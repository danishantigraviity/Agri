const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  method: {
    type: String,
    enum: ['razorpay', 'cod', 'upi', 'netbanking', 'card', 'wallet'],
  },
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
    default: 'created',
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  gatewayResponse: mongoose.Schema.Types.Mixed,
  refundId: String,
  refundAmount: Number,
  refundReason: String,
  refundedAt: Date,
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

paymentSchema.index({ order: 1 });
paymentSchema.index({ customer: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
