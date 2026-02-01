const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Sanitize error message and stack trace to prevent information leakage
  const sanitizeError = (errorObj) => {
    if (!errorObj) return errorObj;

    const sanitized = { ...errorObj };

    // Remove sensitive information from message
    if (sanitized.message) {
      sanitized.message = sanitized.message
        .replace(/sk-[a-zA-Z0-9]{48}/g, '[REDACTED]') // OpenAI API keys
        .replace(/mongodb\+srv:\/\/[^:]+:[^@]+@/g, 'mongodb+srv://[REDACTED]:[REDACTED]@') // MongoDB credentials
        .replace(/Bearer\s+[a-zA-Z0-9._-]+/g, 'Bearer [REDACTED]') // JWT tokens
        .replace(/password[^=]*=([^&\s]+)/g, 'password=[REDACTED]') // Passwords in URLs
        .replace(/token[^=]*=([^&\s]+)/g, 'token=[REDACTED]'); // Tokens in URLs
    }

    // Sanitize stack trace in production
    if (sanitized.stack && process.env.NODE_ENV === 'production') {
      // Remove file paths and sensitive information from stack trace
      sanitized.stack = sanitized.stack
        .replace(/\/home\/[^/]+\/[^/]+\/[^/]+\//g, '/[REDACTED]/')
        .replace(/C:\\Users\\[^\\]+\\[^\\]+\\[^\\]+\\/g, 'C:\\[REDACTED]\\')
        .replace(/sk-[a-zA-Z0-9]{48}/g, '[REDACTED]');
    }

    return sanitized;
  };

  const sanitizedError = sanitizeError(err);

  // Log sanitized error for debugging
  console.error('Error:', {
    message: sanitizedError.message,
    stack: process.env.NODE_ENV === 'development' ? sanitizedError.stack : '[REDACTED IN PRODUCTION]',
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')?.substring(0, 100), // Truncate user agent
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = { message, statusCode: 400 };
  }

  // Rate limit errors
  if (err.status === 429) {
    const message = 'Too many requests';
    error = { message, statusCode: 429 };
  }

  // Default error
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || err.message || 'Server Error';

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(isDevelopment && { stack: err.stack }),
    ...(isDevelopment && { error: err })
  });
};

// 404 handler for undefined routes
const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};
