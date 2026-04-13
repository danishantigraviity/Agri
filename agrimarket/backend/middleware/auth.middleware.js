const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

// Verify JWT access token
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Fetch fresh user data
    const user = await User.findById(decoded.id).select('+isActive');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or account deactivated.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please refresh.',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
      });
    }
    next();
  };
};

// Farmer approval check
const requireApprovedFarmer = (req, res, next) => {
  if (req.user.role !== 'farmer') {
    return res.status(403).json({ success: false, message: 'Farmers only.' });
  }
  if (!req.user.farmerProfile?.isApproved) {
    return res.status(403).json({
      success: false,
      message: 'Your farmer account is pending approval.',
      code: 'FARMER_NOT_APPROVED',
    });
  }
  next();
};

// Optional auth (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = await User.findById(decoded.id);
    }
  } catch (_) {}
  next();
};

module.exports = { protect, authorize, requireApprovedFarmer, optionalAuth };
