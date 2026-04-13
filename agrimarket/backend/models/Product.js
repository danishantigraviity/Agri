const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer is required'],
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  slug: { type: String, lowercase: true },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description too long'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'vegetables', 'fruits', 'grains', 'dairy', 'pulses',
      'spices', 'herbs', 'flowers', 'honey', 'eggs', 'other'
    ],
  },
  subcategory: { type: String, trim: true },
  images: [{ type: String }],
  price: {
    mrp: { type: Number, required: true, min: 0 },
    selling: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'kg', enum: ['kg', 'g', 'litre', 'ml', 'piece', 'dozen', 'bunch', 'packet'] },
  },
  stock: {
    quantity: { type: Number, required: true, default: 0, min: 0 },
    minOrderQty: { type: Number, default: 1 },
    maxOrderQty: { type: Number, default: 100 },
  },
  isOrganic: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  isApproved: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  approvalNote: { type: String },
  tags: [String],
  nutritionInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
  },
  harvestDate: Date,
  expiryDate: Date,
  deliveryInfo: {
    freeDelivery: { type: Boolean, default: false },
    minFreeDeliveryAmount: { type: Number, default: 500 },
    estimatedDays: { type: Number, default: 2 },
  },
  reviews: [reviewSchema],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  // Subscription availability
  subscriptionAvailable: { type: Boolean, default: false },
  subscriptionDiscount: { type: Number, default: 0, min: 0, max: 50 }, // percentage
}, { timestamps: true });

// Indexes
productSchema.index({ farmer: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isApproved: 1, isAvailable: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ 'price.selling': 1 });
productSchema.index({ rating: -1 });

// Auto-generate slug
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

// Update rating on new review
productSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.reviewCount = 0;
  } else {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.rating = Math.round((sum / this.reviews.length) * 10) / 10;
    this.reviewCount = this.reviews.length;
  }
};

module.exports = mongoose.model('Product', productSchema);
