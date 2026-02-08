const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { awaitConnection } = require('../config/database');

// Middleware to protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    // Ensure database connection
    await awaitConnection();

    let token;

    // Check for token in cookies first, then in Authorization header
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    // Check if password was changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'Password was recently changed. Please log in again.'
      });
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please log in again.'
      });
    }
    
    // Check for connection errors specifically
    if (error.name === 'MongooseError' || error.message.includes('connect')) {
       console.error('Auth middleware DB connection error:', error);
       return res.status(503).json({
         success: false,
         message: 'Service unavailable. Please try again.',
         error: 'DATABASE_CONNECTION_ERROR'
       });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error.'
    });
  }
};

// Middleware to restrict access to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.'
      });
    }

    next();
  };
};

// Middleware to check if user is authenticated (optional)
const optionalAuth = async (req, res, next) => {
  try {
    // Try to ensure connection but don't fail hard if just checking optional auth
    // actually, we should fail if we can't connect, or we can't check auth.
    // But optional auth usually implies "if not auth, continue as guest".
    // If DB is down, guest logic might still work if it doesn't need DB.
    // However, safest to try connecting.
    try {
        await awaitConnection(); 
    } catch(e) {
        // If connection fails, treat as not authenticated
        console.warn('Optional auth DB connect failed, proceeding as guest');
        return next();
    }

    let token;

    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Rate limiting helper
const createRateLimit = (windowMs, max) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(ip)) {
      requests.set(ip, []);
    }
    
    const userRequests = requests.get(ip);
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      });
    }
    
    validRequests.push(now);
    requests.set(ip, validRequests);
    next();
  };
};

// Alias for protect function
const authenticateToken = protect;

// Alias for restrictTo function
const authorizeRoles = restrictTo;

module.exports = {
  protect,
  restrictTo,
  optionalAuth,
  createRateLimit,
  authenticateToken,
  authorizeRoles
};
