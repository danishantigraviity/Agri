const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

// Lazy init — only create Razorpay instance when keys are available
// Prevents server crash on startup if keys are not configured
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET env vars.');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private (customer)
const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({ _id: orderId, customer: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.pricing.total * 100), // Convert to paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        customerId: req.user._id.toString(),
      },
    });

    // Store Razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;
    await order.save({ validateBeforeSave: false });

    // Create payment record
    await Payment.create({
      order: order._id,
      customer: req.user._id,
      amount: order.pricing.total,
      method: 'razorpay',
      status: 'created',
      razorpayOrderId: razorpayOrder.id,
    });

    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Private (customer)
const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    // Verify signature
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed.' });
    }

    // Update order
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpayPaymentId;
    order.orderStatus = 'confirmed';
    order.trackingEvents.push({
      status: 'confirmed',
      message: 'Payment received. Order confirmed.',
      timestamp: new Date(),
    });
    await order.save();

    // Update payment record
    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        status: 'captured',
        razorpayPaymentId,
        razorpaySignature,
      }
    );

    res.json({ success: true, message: 'Payment verified successfully.', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Handle Razorpay webhook
// @route   POST /api/payments/webhook
// @access  Public (Razorpay webhook)
const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }

    const { event, payload } = req.body;

    if (event === 'payment.captured') {
      const razorpayPaymentId = payload.payment.entity.id;
      const razorpayOrderId = payload.payment.entity.order_id;

      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: 'captured', razorpayPaymentId }
      );

      await Order.findOneAndUpdate(
        { razorpayOrderId },
        { paymentStatus: 'paid', orderStatus: 'confirmed' }
      );
    }

    if (event === 'payment.failed') {
      const razorpayOrderId = payload.payment.entity.order_id;
      await Payment.findOneAndUpdate({ razorpayOrderId }, { status: 'failed' });
      await Order.findOneAndUpdate({ razorpayOrderId }, { paymentStatus: 'failed' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ customer: req.user._id })
      .populate('order', 'orderNumber pricing.total orderStatus')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createRazorpayOrder, verifyPayment, handleWebhook, getPaymentHistory };
