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

    await mongoose.connect(config.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log('✅ MongoDB Connected');

  } catch (error) {
    console.error('❌ Database connection error:', error);
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
