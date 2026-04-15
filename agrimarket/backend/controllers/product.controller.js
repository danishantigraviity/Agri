const Product = require('../models/Product');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all approved products (with filters)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const {
      category, search, minPrice, maxPrice,
      isOrganic, sort, page = 1, limit = 12, farmer,
    } = req.query;

    const query = { isApproved: 'approved', isAvailable: true };

    if (category) query.category = category;
    if (isOrganic === 'true') query.isOrganic = true;
    if (farmer) query.farmer = farmer;

    if (search) {
      // Use regex for reliable search (doesn't require a text index to exist)
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      query['price.selling'] = {};
      if (minPrice) query['price.selling'].$gte = Number(minPrice);
      if (maxPrice) query['price.selling'].$lte = Number(maxPrice);
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      price_asc: { 'price.selling': 1 },
      price_desc: { 'price.selling': -1 },
      rating: { rating: -1 },
      popular: { soldCount: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('farmer', 'name avatar farmerProfile.farmName farmerProfile.isApproved')
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip(skip)
      .limit(Number(limit))
      .select('-reviews');

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmer', 'name avatar farmerProfile phone')
      .populate('reviews.user', 'name avatar');

    if (!product || product.isApproved !== 'approved') {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save({ validateBeforeSave: false });

    // Get recommendations (same category, different farmer)
    const recommendations = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isApproved: 'approved',
      isAvailable: true,
    })
      .select('name images price rating reviewCount')
      .limit(6);

    res.json({ success: true, data: { product, recommendations } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product (farmer)
// @route   POST /api/products
// @access  Private (farmer)
const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const images = req.files?.map((f) => f.path) || [];

    const product = await Product.create({
      ...req.body,
      farmer: req.user._id,
      images,
      isApproved: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Product submitted for approval.',
      data: product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product (farmer - own products only)
// @route   PUT /api/products/:id
// @access  Private (farmer)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      farmer: req.user._id,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const newImages = req.files?.map((f) => f.path) || [];
    const updatedData = { ...req.body };

    if (newImages.length > 0) {
      updatedData.images = [...(product.images || []), ...newImages];
    }

    // Re-submit for approval on price/stock change
    if (req.body.price || req.body.name || req.body.description) {
      updatedData.isApproved = 'pending';
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (farmer or admin)
const deleteProduct = async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, farmer: req.user._id };

    const product = await Product.findOneAndDelete(query);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, message: 'Product deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add review
// @route   POST /api/products/:id/reviews
// @access  Private (customer)
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'Already reviewed this product.' });
    }

    product.reviews.push({ user: req.user._id, rating: Number(rating), comment });
    product.updateRating();
    await product.save();

    res.status(201).json({ success: true, message: 'Review added.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get farmer's own products
// @route   GET /api/products/my-products
// @access  Private (farmer)
const getMyProducts = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { farmer: req.user._id };
    if (status) query.isApproved = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: { products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isFeatured: true,
      isApproved: 'approved',
      isAvailable: true,
    })
      .populate('farmer', 'name farmerProfile.farmName')
      .select('name images price rating reviewCount isFeatured category')
      .limit(8);

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get product categories with count
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isApproved: 'approved', isAvailable: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, addReview, getMyProducts, getFeaturedProducts, getCategories,
};
