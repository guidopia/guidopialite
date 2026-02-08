const mongoose = require('mongoose');
const config = require('./config');

let isConnected = false;

const connectDB = async () => {
  // If already connected, reuse connection
  if (mongoose.connection.readyState === 1) {
    if (!isConnected) {
       console.log('📡 Using existing MongoDB connection');
       isConnected = true;
    }
    return;
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 MongoDB URI exists:', !!config.MONGODB_URI);

    if (!config.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable not set');
    }
    
    // In serverless, we might want to buffer commands if we are sure we are connecting
    // But user error says bufferCommands is false.
    // We will stick to the config but ensure we wait.
    await mongoose.connect(config.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false // explicitly disable buffering to fail fast if no connection, but we await it.
    });
    
    isConnected = true;
    console.log('✅ MongoDB Connected to:', mongoose.connection.name);
    
  } catch (error) {
    console.error('❌ Database connection error:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    // We don't exit process in serverless, but we must throw so the caller knows it failed
    throw error;
  }
};

// Helper: Wait for connection to be ready (useful in serverless functions)
const awaitConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  await connectDB();
};

// Check database connection status
const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = connectDB;
module.exports.awaitConnection = awaitConnection;
module.exports.isDBConnected = isDBConnected;
