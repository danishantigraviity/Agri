const mongoose = require('mongoose');

const subscriptionItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  priceAtSubscription: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
});

const subscriptionSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [subscriptionItemSchema],
  frequency: {
    type: String,
    enum: ['daily', 'alternate_days', 'weekly', 'biweekly', 'monthly'],
    required: true,
  },
  deliveryAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  deliverySlot: {
    type: String,
    enum: ['morning', 'afternoon', 'evening'],
    default: 'morning',
  },
  startDate: { type: Date, required: true },
  endDate: Date,
  nextDeliveryDate: Date,
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'expired'],
    default: 'active',
  },
  paymentMethod: {
    type: String,
    enum: ['auto_debit', 'cod'],
    default: 'cod',
  },
  totalAmount: { type: Number },
  discount: { type: Number, default: 0 },
  pausedDates: [Date],
  deliveryHistory: [{
    date: Date,
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    status: String,
  }],
}, { timestamps: true });

subscriptionSchema.index({ customer: 1, status: 1 });
subscriptionSchema.index({ nextDeliveryDate: 1, status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
