const Medicine = require('../models/Medicine');

// @desc    Get all medicines
exports.getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ isAvailable: true }).sort('-createdAt');
    res.status(200).json({ success: true, results: medicines.length, data: { medicines } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ success: false, message: 'No medicine found' });
    res.status(200).json({ success: true, data: { medicine } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecommendedMedicines = async (req, res) => {
  try {
    const { disease } = req.params;
    const medicines = await Medicine.find({ 
      diseaseTarget: { $regex: disease || '', $options: 'i' },
      isAvailable: true 
    }).limit(10);
    res.status(200).json({ success: true, results: medicines.length, data: { medicines } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createMedicine = async (req, res) => {
  try {
    const newMedicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, data: { medicine: newMedicine } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
