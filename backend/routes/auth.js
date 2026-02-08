const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { 
  validateSignup, 
  validateLogin, 
  validateProfileUpdate,
  validateNewPassword,
  handleValidationErrors,
  sanitizeInput 
} = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 signup attempts per hour
  message: {
    success: false,
    message: 'Too many signup attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Temporary admin creation endpoint (remove after use) - NO AUTH REQUIRED
router.post('/create-admin', async (req, res) => {
  try {
    // Simple secret check for basic security (from body or query)
    const secret = req.body.secret || req.query.secret;
    if (secret !== 'guidopia-admin-setup-2024') {
      return res.status(403).json({
        success: false,
        message: 'Invalid secret provided'
      });
    }

    // Ensure database connection is established
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.log('⏳ Waiting for database connection...');
      // Wait up to 10 seconds for connection
      let attempts = 0;
      while (mongoose.connection.readyState !== 1 && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }

      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          success: false,
          message: 'Database connection not available. Please try again later.',
          readyState: mongoose.connection.readyState
        });
      }
    }

    const adminData = {
      fullName: 'Guidopia Admin',
      email: 'admin@guidopia.com',
      password: 'admin123',
      phone: '+1234567890',
      class: '12th',
      role: 'admin',
      isEmailVerified: true,
      isActive: true
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin user already exists',
        email: existingAdmin.email
      });
    }

    // Create admin user
    const admin = new User(adminData);
    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      email: admin.email,
      password: adminData.password,
      note: 'Remove this endpoint after successful creation'
    });

  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user'
    });
  }
});

// Public routes
router.post('/signup',
  signupLimiter,
  sanitizeInput,
  validateSignup,
  handleValidationErrors,
  authController.signup
);

router.post('/login', 
  authLimiter,
  sanitizeInput,
  validateLogin,
  handleValidationErrors,
  authController.login
);

router.post('/refresh', authController.refreshToken);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.put('/profile', 
  sanitizeInput,
  validateProfileUpdate,
  handleValidationErrors,
  authController.updateProfile
);
router.put('/change-password',
  validateNewPassword,
  handleValidationErrors,
  authController.changePassword
);

module.exports = router;
