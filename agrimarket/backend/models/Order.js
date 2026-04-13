const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  unit: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true },
});

const trackingEventSchema = new mongoose.Schema({
  status: { type: String, required: true },
  message: { type: String, required: true },
  location: { type: String },
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
  },
  pricing: {
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'cod'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  orderStatus: {
    type: String,
    enum: [
      'placed', 'confirmed', 'processing',
      'packed', 'shipped', 'out_for_delivery',
      'delivered', 'cancelled', 'return_requested', 'returned'
    ],
    default: 'placed',
  },
  trackingEvents: [trackingEventSchema],
  estimatedDelivery: Date,
  actualDelivery: Date,
  cancellationReason: String,
  returnReason: String,
  notes: String,
  isSubscriptionOrder: { type: Boolean, default: false },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
}, { timestamps: true });

// Indexes
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ 'items.farmer': 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ orderNumber: 1 });

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const random = Math.floor(Math.random() * 9000) + 1000;
    this.orderNumber = `AGM-${dateStr}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
