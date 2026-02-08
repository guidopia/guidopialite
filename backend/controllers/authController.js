const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to create and send JWT token
const createSendToken = (user, statusCode, res) => {
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  // Remove password from output
  user.password = undefined;

  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // Set refresh token in httpOnly cookie
  const refreshCookieOptions = {
    ...cookieOptions,
    expires: new Date(
      Date.now() + (process.env.JWT_REFRESH_COOKIE_EXPIRES_IN || 30) * 24 * 60 * 60 * 1000
    )
  };

  // Set cookies
  res.cookie('jwt', token, cookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);

  res.status(statusCode).json({
    success: true,
    message: 'Authentication successful',
    data: {
      user,
      token,
      refreshToken
    }
  });
};

// @desc    User signup
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { fullName, class: userClass, phone, email, password } = req.body;

    console.log('🔐 Signup attempt:', {
      email,
      fullName,
      phone,
      userClass,
      hasPassword: !!password
    });

    // Check database connection first
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ Database not connected during signup, readyState:', mongoose.connection.readyState);
      return res.status(503).json({
        success: false,
        message: 'Database connection error. Please try again later.',
        readyState: mongoose.connection.readyState
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
      if (existingUser.phone === phone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already registered'
        });
      }
    }

    console.log('👤 Creating user in database...');

    // Create new user
    const user = await User.create({
      fullName,
      class: userClass,
      phone,
      email,
      password
    });

    console.log('✅ User created with ID:', user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log('🎫 Generating auth tokens...');
    createSendToken(user, 201, res);
  } catch (error) {
    console.error('❌ Signup error:', {
      message: error.message,
      code: error.code,
      name: error.name
    });

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }

    // Handle database connection errors specifically
    if (error.name === 'MongooseError' || error.message.includes('connect')) {
      return res.status(503).json({
        success: false,
        message: 'Database connection error. Please try again later.',
        error: 'DATABASE_CONNECTION_ERROR'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating account. Please try again.',
      error: error.message
    });
  }
};

// @desc    User login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts'
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Add redirect URL based on role
    const redirectUrl = user.role === 'admin' ? '/admin' : '/student';
    
    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        user,
        token: user.generateAuthToken(),
        refreshToken: user.generateRefreshToken(),
        redirectUrl
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

// @desc    User logout
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
  try {
    // Clear cookies
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.cookie('refreshToken', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists or account is deactivated'
      });
    }

    // Generate new tokens
    const newToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();

    // Set new cookies
    const cookieOptions = {
      expires: new Date(
        Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    const refreshCookieOptions = {
      ...cookieOptions,
      expires: new Date(
        Date.now() + (process.env.JWT_REFRESH_COOKIE_EXPIRES_IN || 30) * 24 * 60 * 60 * 1000
      )
    };

    res.cookie('jwt', newToken, cookieOptions);
    res.cookie('refreshToken', newRefreshToken, refreshCookieOptions);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired. Please log in again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error refreshing token'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { fullName, class: userClass, phone, email } = req.body;
    
    // Check if email is being changed and if it already exists
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
    }

    // Check if phone is being changed and if it already exists
    if (phone && phone !== req.user.phone) {
      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already registered'
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        fullName: fullName || req.user.fullName,
        class: userClass || req.user.class,
        phone: phone || req.user.phone,
        email: email || req.user.email
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  refreshToken,
  getMe,
  updateProfile,
  changePassword
};
