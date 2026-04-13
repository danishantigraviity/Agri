const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Medicine type is required'],
    enum: ['fertilizer', 'pesticide', 'fungicide', 'herbicide', 'growth_promoter'],
  },
  cropType: [{
    type: String, // e.g., 'Tomato', 'Potato', 'Apple'
    required: true,
  }],
  diseaseTarget: [{
    type: String, // e.g., 'Leaf Blight', 'Bacterial Spot'
    required: true,
  }],
  dosage: {
    type: String,
    required: [true, 'Dosage instructions are required'],
  },
  price: {
    mrp: { type: Number, required: true },
    selling: { type: Number, required: true },
  },
  image: {
    type: String,
    required: [true, 'Medicine image is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  brand: String,
}, { timestamps: true });

// Primary model export
module.exports = mongoose.model('Medicine', medicineSchema);
