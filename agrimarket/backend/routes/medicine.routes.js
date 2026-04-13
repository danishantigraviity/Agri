const express = require('express');
const medicineController = require('../controllers/medicine.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', medicineController.getAllMedicines);
router.get('/:id', medicineController.getMedicine);
router.get('/recommend/:disease', medicineController.getRecommendedMedicines);

// Admin-only: Create medicine
router.post('/', 
  protect, 
  authorize('admin'), 
  medicineController.createMedicine
);

module.exports = router;
