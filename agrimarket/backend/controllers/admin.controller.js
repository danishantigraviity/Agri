const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Task = require('../models/Task');

// @desc    Admin dashboard overview
// @route   GET /api/admin/dashboard
// @access  Private (admin)
const getDashboard = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const now = new Date();
    const dateQuery = {
      createdAt: {
        $gte: startDate ? new Date(startDate) : new Date(now.getFullYear(), 0, 1), // Start of current year by default
        $lte: endDate ? new Date(endDate) : now,
      }
    };

    const [
      totalUsers, totalFarmers, totalCustomers,
      totalProducts, pendingProducts,
      totalOrders, pendingFarmers,
      revenueData, recentOrders,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'farmer', isActive: true }),
      User.countDocuments({ role: 'customer', isActive: true }),
      Product.countDocuments({ isApproved: 'approved' }),
      Product.countDocuments({ isApproved: 'pending' }),
      Order.countDocuments(dateQuery),
      User.countDocuments({ role: 'farmer', 'farmerProfile.isApproved': false }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', ...dateQuery } },
        { $group: { _id: null, total: { $sum: '$pricing.total' }, count: { $sum: 1 } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('customer', 'name email')
        .select('orderNumber pricing.total orderStatus createdAt'),
    ]);

    const sixMonthsAgo = startDate ? new Date(startDate) : new Date();
    if (!startDate) sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { 
        $gte: sixMonthsAgo,
        $lte: endDate ? new Date(endDate) : now 
      } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$pricing.total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalFarmers,
          totalCustomers,
          totalProducts,
          pendingProducts,
          totalOrders,
          pendingFarmers,
          totalRevenue: revenueData[0]?.total || 0,
          completedOrders: revenueData[0]?.count || 0,
        },
        monthlyRevenue,
        recentOrders,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin)
const getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20, isActive } = req.query;
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    console.log('🔍 [AdminController] getUsers query:', JSON.stringify(query));
    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

    console.log(`📊 [AdminController] getUsers found ${users.length} users (total: ${total})`);

    res.json({
      success: true,
      data: { users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    console.error('❌ [AdminController] getUsers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve / reject farmer
// @route   PATCH /api/admin/farmers/:id/approval
// @access  Private (admin)
const updateFarmerApproval = async (req, res) => {
  try {
    const { action, note } = req.body; // action: 'approve' | 'reject'
    const farmer = await User.findOne({ _id: req.params.id, role: 'farmer' });
    if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found.' });

    farmer.farmerProfile.isApproved = action === 'approve';
    farmer.farmerProfile.approvedAt = action === 'approve' ? new Date() : undefined;
    farmer.farmerProfile.approvedBy = req.user._id;

    await farmer.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: `Farmer ${action === 'approve' ? 'approved' : 'rejected'}.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get pending products for approval
// @route   GET /api/admin/products/pending
// @access  Private (admin)
const getPendingProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments({ isApproved: 'pending' });
    const products = await Product.find({ isApproved: 'pending' })
      .populate('farmer', 'name email farmerProfile.farmName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: { products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve / reject product
// @route   PATCH /api/admin/products/:id/approval
// @access  Private (admin)
const updateProductApproval = async (req, res) => {
  try {
    const { action, note } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    product.isApproved = action === 'approve' ? 'approved' : 'rejected';
    if (note) product.approvalNote = note;
    if (action === 'approve') product.isFeatured = req.body.featured || false;

    await product.save({ validateBeforeSave: false });

    res.json({ success: true, message: `Product ${product.isApproved}.`, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Private (admin)
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (status) query.orderStatus = status;
    if (search) query.orderNumber = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: { orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/admin/users/:id/toggle-status
// @access  Private (admin)
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot modify admin.' });

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── TASK MANAGEMENT ──

// @desc    Get all admin tasks
// @route   GET /api/admin/tasks
// @access  Private (admin)
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a task
// @route   POST /api/admin/tasks
// @access  Private (admin)
const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a task
// @route   PATCH /api/admin/tasks/:id
// @access  Private (admin)
const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/admin/tasks/:id
// @access  Private (admin)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── ACTIVITY FEED ──

// @desc    Get platform activity feed
// @route   GET /api/admin/activity
// @access  Private (admin)
const getActivityFeed = async (req, res) => {
  try {
    const [users, products, orders] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(5).select('name role createdAt'),
      Product.find().sort({ createdAt: -1 }).limit(5).select('name price isApproved createdAt').populate('farmer', 'name'),
      Order.find().sort({ createdAt: -1 }).limit(5).select('orderNumber pricing.total orderStatus createdAt').populate('customer', 'name'),
    ]);

    // Combinining into a single timeline
    const activities = [
      ...users.map(u => ({ type: 'user', data: u, createdAt: u.createdAt })),
      ...products.map(p => ({ type: 'product', data: p, createdAt: p.createdAt })),
      ...orders.map(o => ({ type: 'order', data: o, createdAt: o.createdAt })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboard, getUsers, updateFarmerApproval,
  getPendingProducts, updateProductApproval, getAllOrders, toggleUserStatus,
  getTasks, createTask, updateTask, deleteTask, getActivityFeed
};
