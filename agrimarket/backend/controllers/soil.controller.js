const SoilAnalysis = require('../models/SoilAnalysis');

/**
 * Perform soil analysis and store results
 */
exports.analyzeSoil = async (req, res) => {
  try {
    const { N, P, K, pH, temperature, humidity, rainfall } = req.body;
    const farmerId = req.user.id || req.user._id;

    // Call ML Service (using environment variable for production)
    const rawUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const mlServiceBaseUrl = rawUrl.replace(/\/+$/, '').replace(/\/predict$/, '');
    
    console.log(`📡 [SoilAnalysis] Calling ML Service: ${mlServiceBaseUrl}/analyze-soil`);

    const mlResponse = await fetch(`${mlServiceBaseUrl}/analyze-soil`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ N, P, K, pH, temp: temperature, hum: humidity, rain: rainfall })
    });


    if (!mlResponse.ok) {
      throw new Error('ML Service Error');
    }

    const mlData = await mlResponse.json();

    // Store in DB
    const analysis = await SoilAnalysis.create({
      farmer: farmerId,
      parameters: { N, P, K, pH, temperature, humidity, rainfall },
      predictedCrop: mlData.predicted_crop,
      confidence: mlData.confidence,
      fertilityScore: mlData.fertility_score,
      recommendations: mlData.insights,
      suggestions: mlData.top_suggestions,
      yieldPrediction: mlData.yield_prediction,
      sowingGuide: mlData.sowing_guide
    });

    res.status(201).json({
      success: true,
      data: {
        ...analysis._doc,
        yield_prediction: mlData.yield_prediction,
        sowing_guide: mlData.sowing_guide
      }
    });
  } catch (error) {
    console.error('Soil Analysis Controller Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

/**
 * Get analysis history for a farmer
 */
exports.getAnalysisHistory = async (req, res) => {
  try {
    const farmerId = req.user.id || req.user._id;
    const history = await SoilAnalysis.find({ farmer: farmerId }).sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch history'
    });
  }
};
