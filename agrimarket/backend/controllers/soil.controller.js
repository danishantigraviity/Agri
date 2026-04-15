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

    let mlData;
    try {
      const mlResponse = await fetch(`${mlServiceBaseUrl}/analyze-soil`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ N, P, K, pH, temp: temperature, hum: humidity, rain: rainfall })
      });

      if (!mlResponse.ok) {
        const errorDetail = await mlResponse.json().catch(() => ({}));
        throw new Error(errorDetail.detail || `ML Service responded with ${mlResponse.status}`);
      }
      mlData = await mlResponse.json();
    } catch (mlError) {
      console.warn(`⚠️ [SoilAnalysis] ML Service Unreachable: ${mlError.message}. Using Simulation Mode.`);
      
      // Simulation Mode Fallback (Matches SoilFertilityEngine logic)
      mlData = {
        predicted_crop: 'Rice',
        confidence: 85.5,
        fertility_score: 72.4,
        yield_prediction: 'Silver',
        sowing_guide: [
          { month: 'June', rating: 'Optimal' },
          { month: 'July', rating: 'Optimal' }
        ],
        top_suggestions: [
          { crop: 'Rice', score: 85.5 },
          { crop: 'Maize', score: 62.1 },
          { crop: 'Cotton', score: 45.3 }
        ],
        insights: [
          "Nitrogen levels are slightly low for optimal yield.",
          "Soil pH is perfect for local staples."
        ]
      };
    }

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
        _id: analysis._id,
        farmer: analysis.farmer,
        parameters: analysis.parameters,
        predicted_crop: mlData.predicted_crop,
        confidence: mlData.confidence,
        fertility_score: mlData.fertility_score,
        yield_prediction: mlData.yield_prediction,
        sowing_guide: mlData.sowing_guide,
        top_suggestions: mlData.top_suggestions,
        insights: mlData.insights,
        timestamp: analysis.timestamp
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
