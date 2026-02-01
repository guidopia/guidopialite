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

if (missingEnvVars.length > 0) {
  if (config.NODE_ENV === 'production') {
    console.error('❌ CRITICAL: Missing required environment variables:', missingEnvVars);
    console.error('🚨 Application cannot start without required environment variables in production');
    process.exit(1);
  } else {
    console.warn('⚠️  WARNING: Missing environment variables (development mode):', missingEnvVars);
    console.warn('📝 Some features may not work properly');
  }
}

// Validate OpenAI API key format (should start with 'sk-' for OpenAI)
if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-')) {
  console.error('❌ CRITICAL: Invalid OpenAI API key format. Key should start with "sk-"');
  if (config.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Validate OpenAI API key length (OpenAI keys are typically 51 characters for sk- keys)
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length < 50) {
  console.warn('⚠️  WARNING: OpenAI API key seems unusually short. Please verify it is correct.');
}

// Security warnings
if (config.NODE_ENV === 'production') {
  const securityWarnings = [];

  if (config.JWT_SECRET === 'guidopia-super-secret-jwt-key-2024-development') {
    securityWarnings.push('Using default JWT secret in production');
  }
  if (config.JWT_REFRESH_SECRET === 'guidopia-super-secret-refresh-key-2024-development') {
    securityWarnings.push('Using default refresh secret in production');
  }
  if (config.SESSION_SECRET === 'guidopia-super-secret-session-key-2024-development') {
    securityWarnings.push('Using default session secret in production');
  }

  if (securityWarnings.length > 0) {
    console.error('❌ SECURITY ALERT: Production deployment with insecure defaults:');
    securityWarnings.forEach(warning => console.error(`   - ${warning}`));
    console.error('🔒 Please set secure environment variables before deploying to production');
    process.exit(1);
  }
}

// Security audit logging (only in development)
if (config.NODE_ENV !== 'production') {
  console.log('🔒 Security Configuration:');
  console.log(`   - OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   - JWT Secret: ${config.JWT_SECRET ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   - Database URI: ${config.MONGODB_URI ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   - Environment: ${config.NODE_ENV || 'development'}`);
}

module.exports = config;
