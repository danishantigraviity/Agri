const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, addReview, getMyProducts, getFeaturedProducts, getCategories,
} = require('../controllers/product.controller');
const { protect, authorize, requireApprovedFarmer } = require('../middleware/auth.middleware');
const { uploadProduct } = require('../config/cloudinary');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/my-products', protect, authorize('farmer'), getMyProducts);
router.get('/:id', getProduct);

router.post('/',
  protect,
  authorize('farmer'),
  requireApprovedFarmer,
  uploadProduct.array('images', 5),
  createProduct
);

router.put('/:id',
  protect,
  authorize('farmer'),
  requireApprovedFarmer,
  uploadProduct.array('images', 5),
  updateProduct
);

router.delete('/:id', protect, authorize('farmer', 'admin'), deleteProduct);
router.post('/:id/reviews', protect, authorize('customer'), addReview);

module.exports = router;
