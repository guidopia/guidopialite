const express = require('express');
const router = express.Router();
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
