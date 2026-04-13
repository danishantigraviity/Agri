const mongoose = require('mongoose');

const soilAnalysisSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parameters: {
    N: { type: Number, required: true },
    P: { type: Number, required: true },
    K: { type: Number, required: true },
    pH: { type: Number, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    rainfall: { type: Number, required: true }
  },
  predictedCrop: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  fertilityScore: {
    type: Number,
    required: true
  },
  recommendations: [String],
  suggestions: [{
    crop: String,
    score: Number
  }],
  yieldPrediction: {
    type: String,
    enum: ['Gold', 'Silver', 'Bronze'],
    default: 'Bronze'
  },
  sowingGuide: [{
    month: String,
    rating: String
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SoilAnalysis', soilAnalysisSchema);
