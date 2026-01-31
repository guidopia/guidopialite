require('dotenv').config();

const config = {
  // Server configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5001,
  
  // Database configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://aakub1096:BmOvBVktlX5A7UUi@cluster0.mongodb.net/GuidopiaXNps?retryWrites=true&w=majority',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'guidopia-super-secret-jwt-key-2024-development',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_COOKIE_EXPIRES_IN: process.env.JWT_COOKIE_EXPIRES_IN || 7,
  
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'guidopia-super-secret-refresh-key-2024-development',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  JWT_REFRESH_COOKIE_EXPIRES_IN: process.env.JWT_REFRESH_COOKIE_EXPIRES_IN || 30,
  
  // OpenAI configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  
  // Security configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:5174', 'https://guidopia.com'],
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100, // requests per window
  
  // File upload
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES || ['image/jpeg', 'image/png', 'image/gif'],
  
  // Email configuration (for future use)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Session configuration
  SESSION_SECRET: process.env.SESSION_SECRET || 'guidopia-super-secret-session-key-2024-development',
  SESSION_COOKIE_SECURE: process.env.NODE_ENV === 'production',
  SESSION_COOKIE_HTTPONLY: true,
  SESSION_COOKIE_SAMESITE: 'strict'
};

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'OPENAI_API_KEY'];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0 && config.NODE_ENV === 'production') {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Security warnings
if (config.NODE_ENV === 'production') {
  if (config.JWT_SECRET === 'guidopia-super-secret-jwt-key-2024-development') {
    console.warn('⚠️  WARNING: Using default JWT secret in production!');
  }
  if (config.JWT_REFRESH_SECRET === 'guidopia-super-secret-refresh-key-2024-development') {
    console.warn('⚠️  WARNING: Using default refresh secret in production!');
  }
  if (config.SESSION_SECRET === 'guidopia-super-secret-session-key-2024-development') {
    console.warn('⚠️  WARNING: Using default session secret in production!');
  }
}

module.exports = config;
