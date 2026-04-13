// routes/order.routes.js
const express = require('express');
const router = express.Router();
const {
  placeOrder, getMyOrders, getOrder, updateOrderStatus,
  cancelOrder, getFarmerOrders, getFarmerAnalytics,
} = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/', protect, authorize('customer'), placeOrder);
router.get('/my', protect, authorize('customer'), getMyOrders);
router.get('/farmer-orders', protect, authorize('farmer'), getFarmerOrders);
router.get('/farmer-analytics', protect, authorize('farmer'), getFarmerAnalytics);
router.get('/:id', protect, getOrder);
router.patch('/:id/status', protect, authorize('farmer', 'admin'), updateOrderStatus);
router.patch('/:id/cancel', protect, authorize('customer'), cancelOrder);

module.exports = router;
