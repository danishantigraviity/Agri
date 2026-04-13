// routes/farmer.routes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const User = require('../models/User');
const { uploadAvatar } = require('../config/cloudinary');

// Get farmer public profile
router.get('/:id', async (req, res) => {
  try {
    const farmer = await User.findOne({ _id: req.params.id, role: 'farmer' })
      .select('name avatar farmerProfile phone createdAt');
    if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found.' });
    res.json({ success: true, data: farmer });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Update farmer profile
router.patch('/profile', protect, authorize('farmer'), uploadAvatar.single('avatar'), async (req, res) => {
  try {
    const updates = {};
    const allowed = ['name', 'phone', 'farmerProfile'];
    allowed.forEach(field => { if (req.body[field]) updates[field] = req.body[field]; });
    if (req.file) updates.avatar = req.file.path;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
