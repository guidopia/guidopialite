const mongoose = require('mongoose');
const config = require('./config');

let isConnected = false;

const connectDB = async () => {
  try {
    if (isConnected) {
      console.log('📡 MongoDB already connected');
      return;
    }

    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 MongoDB URI exists:', !!config.MONGODB_URI);
    console.log('🌐 Node ENV:', process.env.NODE_ENV);

    if (!config.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable not set');
    }
    
    await mongoose.connect(config.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    });
    
    isConnected = true;
    console.log('✅ MongoDB Connected to:', mongoose.connection.name);
    console.log('🏠 Database host:', mongoose.connection.host);
    
  } catch (error) {
    console.error('❌ Database connection error:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    console.warn('⚠️  App will continue without database connection');
    // Don't exit process in serverless environment
    // Instead, let the app handle requests and return appropriate errors
  }
};

// Check database connection status
const isDBConnected = () => {
  return isConnected && mongoose.connection.readyState === 1;
};

module.exports = connectDB;
module.exports.isDBConnected = isDBConnected;

module.exports = connectDB;
