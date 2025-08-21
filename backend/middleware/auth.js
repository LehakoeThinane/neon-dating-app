const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided 🔐'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid. User not found 👻'
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated 🚫'
      });
    }

    // Add user to request object
    req.user = {
      userId: user._id,
      username: user.username,
      status: user.status,
      subscription: user.subscription.type
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid 🚫'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again 🕐'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during authentication 🔧'
    });
  }
};

// Middleware to check if user has premium subscription
const requirePremium = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user.isPremium()) {
      return res.status(403).json({
        success: false,
        message: 'Premium subscription required for this feature 💎'
      });
    }

    next();
  } catch (error) {
    console.error('Premium check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking premium status 🔧'
    });
  }
};

// Middleware for optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (user && user.isActive) {
          req.user = {
            userId: user._id,
            username: user.username,
            status: user.status,
            subscription: user.subscription.type
          };
        }
      } catch (error) {
        // Token is invalid, but we continue without authentication
        console.log('Optional auth failed, continuing without user');
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};

module.exports = {
  authenticate,
  requirePremium,
  optionalAuth
};