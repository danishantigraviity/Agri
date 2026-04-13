const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');
const farmerRoutes = require('./routes/farmer.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const notificationRoutes = require('./routes/notification.routes');
const medicineRoutes = require('./routes/medicine.routes');
const soilRoutes = require('./routes/soil.routes');
const Medicine = require('./models/Medicine');

const app = express();

// ─────────────────────────────────────────────
// CORS & Security Headers (Top Priority)
// ─────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// Manual CORS fallback & Preflight handler
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, Cookie');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Relaxed for development stability
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Relexed for development
  message: { success: false, message: 'Too many auth attempts. Please wait 15 minutes.' },
});

app.use(globalLimiter);
// app.use('/api/auth', authLimiter); // Disabled for development unblocking

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// NoSQL injection sanitization
app.use(mongoSanitize());

// XSS Protection
app.use(xss());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/analysis', soilRoutes);

// ─────────────────────────────────────────────
// AI Disease Prediction Proxy
// ─────────────────────────────────────────────
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/predict-disease', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a leaf image' });
    }

    // Forward to FastAPI Service (ML Microservice) 
    // Using 127.0.0.1 to avoid IPv6 resolution overhead on some Windows setups
    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append('file', blob, req.file.originalname);

    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000/predict';
    console.log(`📡 [AI Proxy] Forwarding to: ${mlServiceUrl}`);

    const mlResponse = await fetch(mlServiceUrl, {
      method: 'POST',
      body: formData,
    });

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      console.error(`❌ ML Service responded with ${mlResponse.status}:`, errorText);
      throw new Error(`ML Service failure: ${mlResponse.status}`);
    }

    const prediction = await mlResponse.json();

    // Map predicted disease to available medicines in MongoDB
    const medicines = await Medicine.find({ 
      diseaseTarget: { $in: [prediction.disease] },
      isAvailable: true 
    }).limit(5);

    res.json({
      success: true,
      data: {
        ...prediction,
        recommendedMedicines: medicines
      }
    });
  } catch (error) {
    console.error('🚨 AI Prediction Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'AI Diagnostic service unavailable. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AgriMarket API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─────────────────────────────────────────────
// Database & Server Start
// ─────────────────────────────────────────────
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Using Database: ${conn.connection.db.databaseName}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AgriMarket server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
});

module.exports = app;
