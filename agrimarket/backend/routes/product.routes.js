const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, addReview, getMyProducts, getFeaturedProducts, getCategories,
} = require('../controllers/product.controller');
const { protect, authorize, requireApprovedFarmer } = require('../middleware/auth.middleware');
const { uploadProduct } = require('../config/cloudinary');
const { body } = require('express-validator');

const productValidation = [
  body('name').notEmpty().withMessage('Product name is required').trim().isLength({ max: 100 }),
  body('description').notEmpty().withMessage('Description is required').isLength({ max: 2000 }),
  body('category').notEmpty().withMessage('Category is required'),
  body('price.mrp').optional().isNumeric().withMessage('MRP must be a number'),
  body('price.selling').optional().isNumeric().withMessage('Selling price must be a number'),
  body('stock.quantity').optional().isNumeric().withMessage('Stock must be a number'),
];

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/my-products', protect, authorize('farmer'), getMyProducts);
router.get('/:id', getProduct);

router.post('/',
  protect,
  authorize('farmer'),
  productValidation,
  requireApprovedFarmer,
  (req, res, next) => {
    // Wrap multer upload to catch Cloudinary config/upload errors gracefully
    uploadProduct.array('images', 5)(req, res, (err) => {
      if (err) {
        console.error('📸 Image upload error:', err.message);
        return res.status(400).json({ 
          success: false, 
          message: `Image upload failed: ${err.message}. Please check server image configuration.`
        });
      }
      next();
    });
  },
  createProduct
);

router.put('/:id',
  protect,
  authorize('farmer'),
  productValidation,
  requireApprovedFarmer,
  uploadProduct.array('images', 5),
  updateProduct
);

router.delete('/:id', protect, authorize('farmer', 'admin'), deleteProduct);
router.post('/:id/reviews', protect, authorize('customer'), addReview);

module.exports = router;
