const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Place order
// @route   POST /api/orders
// @access  Private (customer)
const placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order.' });
    }

    // Validate and price items
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.isApproved !== 'approved' || !product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} is not available.`,
        });
      }

      if (product.stock.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}.`,
        });
      }

      const itemSubtotal = product.price.selling * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        farmer: product.farmer,
        name: product.name,
        image: product.images[0] || '',
        price: product.price.selling,
        unit: product.price.unit,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });

      // Deduct stock
      product.stock.quantity -= item.quantity;
      product.soldCount += item.quantity;
      await product.save({ validateBeforeSave: false });
    }

    const deliveryCharge = subtotal >= 500 ? 0 : 50;
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const total = subtotal + deliveryCharge + tax;

    // Estimated delivery (2-3 business days)
    const estDelivery = new Date();
    estDelivery.setDate(estDelivery.getDate() + 3);

    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      shippingAddress,
      pricing: { subtotal, deliveryCharge, tax, total },
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus: 'placed',
      estimatedDelivery: estDelivery,
      notes,
      trackingEvents: [{
        status: 'placed',
        message: 'Order placed successfully.',
        timestamp: new Date(),
        updatedBy: req.user._id,
      }],
    });

    await order.populate('items.product', 'name images');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my orders (customer)
// @route   GET /api/orders/my
// @access  Private (customer)
const getMyOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { customer: req.user._id };
    if (status) query.orderStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('items.product', 'name images');

    res.json({
      success: true,
      data: { orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? { _id: req.params.id }
      : req.user.role === 'farmer'
        ? { _id: req.params.id, 'items.farmer': req.user._id }
        : { _id: req.params.id, customer: req.user._id };

    const order = await Order.findOne(query)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images category')
      .populate('items.farmer', 'name phone farmerProfile.farmName');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (farmer/admin)
// @route   PATCH /api/orders/:id/status
// @access  Private (farmer, admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, message, location } = req.body;

    const validTransitions = {
      farmer: ['confirmed', 'processing', 'packed', 'shipped'],
      admin: ['confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    };

    const allowed = validTransitions[req.user.role] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status transition.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.orderStatus = status;
    order.trackingEvents.push({
      status,
      message: message || `Order ${status.replace(/_/g, ' ')}.`,
      location,
      timestamp: new Date(),
      updatedBy: req.user._id,
    });

    if (status === 'delivered') {
      order.actualDelivery = new Date();
      order.paymentStatus = 'paid'; // Mark COD as paid on delivery
    }

    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order (customer)
// @route   PATCH /api/orders/:id/cancel
// @access  Private (customer)
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id,
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (!['placed', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage.',
      });
    }

    order.orderStatus = 'cancelled';
    order.cancellationReason = req.body.reason;
    order.trackingEvents.push({
      status: 'cancelled',
      message: `Cancelled: ${req.body.reason || 'Customer request'}`,
      timestamp: new Date(),
      updatedBy: req.user._id,
    });

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 'stock.quantity': item.quantity, soldCount: -item.quantity },
      });
    }

    await order.save();
    res.json({ success: true, message: 'Order cancelled.', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get orders for farmer
// @route   GET /api/orders/farmer-orders
// @access  Private (farmer)
const getFarmerOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { 'items.farmer': req.user._id };
    if (status) query.orderStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('customer', 'name phone email')
      .populate('items.product', 'name images');

    res.json({
      success: true,
      data: { orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Farmer analytics
// @route   GET /api/orders/farmer-analytics
// @access  Private (farmer)
const getFarmerAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Default search window for charts
    const dateQuery = {
      createdAt: {
        $gte: startDate ? new Date(startDate) : thirtyDaysAgo,
        $lte: endDate ? new Date(endDate) : now,
      }
    };

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [
      totals, statusBreakdown, dailyRevenue, topProducts, 
      previousTotals, lowStockProducts, customerInsights, heatmap
    ] = await Promise.all([
      // Total revenue + orders (Honors date range)
      Order.aggregate([
        { $match: { 'items.farmer': farmerId, paymentStatus: 'paid', ...dateQuery } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$pricing.total' },
            totalOrders: { $sum: 1 },
          },
        },
      ]),
      // Orders by status (Honors date range)
      Order.aggregate([
        { $match: { 'items.farmer': farmerId, ...dateQuery } },
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      ]),
      // Last 7 days revenue
      Order.aggregate([
        {
          $match: {
            'items.farmer': farmerId,
            createdAt: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$pricing.total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Top-selling products (Honors date range)
      Order.aggregate([
        { $match: { 'items.farmer': farmerId, ...dateQuery } },
        { $unwind: '$items' },
        { $match: { 'items.farmer': farmerId } },
        {
          $group: {
            _id: '$items.product',
            name: { $first: '$items.name' },
            totalSold: { $sum: '$items.quantity' },
            revenue: { $sum: '$items.subtotal' },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
      // Previous 7-14 days for growth trends
      Order.aggregate([
        {
          $match: {
            'items.farmer': farmerId,
            paymentStatus: 'paid',
            createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$pricing.total' },
            orders: { $sum: 1 },
          },
        },
      ]),
      // Low stock alerts
      Product.find({
        farmer: farmerId,
        'stock.quantity': { $lt: 10 },
        isApproved: 'approved',
      }).select('name stock.quantity images').limit(5),
      // Customer insights (Unique vs Repeat)
      Order.aggregate([
        { $match: { 'items.farmer': farmerId } },
        { $group: { _id: '$customer', orderCount: { $sum: 1 } } },
        {
          $group: {
            _id: null,
            totalUnique: { $sum: 1 },
            repeatCount: {
              $sum: { $cond: [{ $gt: ['$orderCount', 1] }, 1, 0] },
            },
          },
        },
      ]),
      // Sales Heatmap (Last 6 Months)
      Order.aggregate([
        {
          $match: {
            'items.farmer': farmerId,
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            value: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const currentPeriod = totals[0] || { totalRevenue: 0, totalOrders: 0 };
    const prevPeriod = previousTotals[0] || { revenue: 0, orders: 0 };

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Calculate growth percentages using 7-day windows
    const current7DaysRevenue = dailyRevenue.reduce((acc, curr) => acc + curr.revenue, 0);
    const revenueGrowth = calculateGrowth(current7DaysRevenue, prevPeriod.revenue);

    res.json({
      success: true,
      data: {
        overview: currentPeriod,
        trends: {
          revenueGrowth,
          orderGrowth: calculateGrowth(
            dailyRevenue.reduce((acc, curr) => acc + curr.orders, 0),
            prevPeriod.orders
          ),
        },
        statusBreakdown,
        dailyRevenue,
        topProducts,
        lowStockAlerts: lowStockProducts,
        customerInsights: customerInsights[0] || { totalUnique: 0, repeatCount: 0 },
        heatmap: heatmap || [],
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  placeOrder, getMyOrders, getOrder, updateOrderStatus,
  cancelOrder, getFarmerOrders, getFarmerAnalytics,
};
