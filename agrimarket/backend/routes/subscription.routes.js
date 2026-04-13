// routes/subscription.routes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const Subscription = require('../models/Subscription');

router.post('/', protect, authorize('customer'), async (req, res) => {
  try {
    const sub = await Subscription.create({ ...req.body, customer: req.user._id });
    res.status(201).json({ success: true, data: sub });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/my', protect, authorize('customer'), async (req, res) => {
  try {
    const subs = await Subscription.find({ customer: req.user._id })
      .populate('items.product', 'name images price.selling');
    res.json({ success: true, data: subs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.patch('/:id/pause', protect, authorize('customer'), async (req, res) => {
  try {
    const sub = await Subscription.findOneAndUpdate(
      { _id: req.params.id, customer: req.user._id },
      { status: 'paused' },
      { new: true }
    );
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found.' });
    res.json({ success: true, data: sub });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.patch('/:id/cancel', protect, authorize('customer'), async (req, res) => {
  try {
    const sub = await Subscription.findOneAndUpdate(
      { _id: req.params.id, customer: req.user._id },
      { status: 'cancelled' },
      { new: true }
    );
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found.' });
    res.json({ success: true, data: sub });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
