const express = require('express');
const router = express.Router();
const {
  getDashboard, getUsers, updateFarmerApproval,
  getPendingProducts, updateProductApproval, getAllOrders, toggleUserStatus,
  getTasks, createTask, updateTask, deleteTask, getActivityFeed
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.patch('/farmers/:id/approval', updateFarmerApproval);
router.get('/products/pending', getPendingProducts);
router.patch('/products/:id/approval', updateProductApproval);
router.get('/orders', getAllOrders);

// Task management
router.get('/tasks', getTasks);
router.post('/tasks', createTask);
router.patch('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

// Activity feed
router.get('/activity', getActivityFeed);

module.exports = router;
