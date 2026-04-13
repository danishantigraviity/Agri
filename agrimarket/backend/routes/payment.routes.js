const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment, handleWebhook, getPaymentHistory } = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/create-order', protect, authorize('customer'), createRazorpayOrder);
router.post('/verify', protect, authorize('customer'), verifyPayment);
router.post('/webhook', handleWebhook); // No auth - Razorpay calls this directly
router.get('/history', protect, getPaymentHistory);

module.exports = router;
