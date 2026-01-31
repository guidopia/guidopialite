const { body, validationResult } = require('express-validator');

// Validation rules for signup
const validateSignup = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),
  
  body('class')
    .trim()
    .isIn(['6th', '7th', '8th', '9th', '10th', '11th', '12th'])
    .withMessage('Please select a valid class/grade'),
  
  body('phone')
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 digits'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email cannot exceed 100 characters'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

// Validation rules for login
const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for password reset
const validatePasswordReset = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail()
];

// Validation rules for new password
const validateNewPassword = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
];

// Validation rules for profile update
const validateProfileUpdate = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),
  
  body('class')
    .optional()
    .trim()
    .isIn(['6th', '7th', '8th', '9th', '10th', '11th', '12th'])
    .withMessage('Please select a valid class/grade'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 digits'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email cannot exceed 100 characters')
];

// Middleware to check for validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

// Sanitize input data
const sanitizeInput = (req, res, next) => {
  // Remove extra spaces and trim all string inputs
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].trim();
    }
  });
  next();
};

module.exports = {
  validateSignup,
  validateLogin,
  validatePasswordReset,
  validateNewPassword,
  validateProfileUpdate,
  handleValidationErrors,
  sanitizeInput
};
