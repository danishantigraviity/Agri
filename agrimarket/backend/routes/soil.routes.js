const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { analyzeSoil, getAnalysisHistory } = require('../controllers/soil.controller');

router.use(protect);
router.use(authorize('farmer'));

router.post('/analyze', analyzeSoil);
router.get('/history', getAnalysisHistory);

module.exports = router;
