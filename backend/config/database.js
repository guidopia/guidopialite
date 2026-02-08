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
    
    // Enabling bufferCommands (default true) allows mongoose to queue requests 
    // until connection is ready. This is safer for serverless.
    await mongoose.connect(config.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      // bufferCommands: true // Default is true, so we don't need to specify false.
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
  // Use a small loop to wait for connection state
  // Check up to 5 seconds
  let retries = 50;
  while (mongoose.connection.readyState !== 1 && retries > 0) {
    if (mongoose.connection.readyState === 2) {
       // It's connecting, just wait a bit
       await new Promise(resolve => setTimeout(resolve, 100));
       retries--;
    } else {
       // Not connected or connecting, try to connect
       await connectDB();
       // If connectDB throws, it will bubble up
       if (mongoose.connection.readyState === 1) return;
       await new Promise(resolve => setTimeout(resolve, 100));
       retries--;
    }
  }
  
  if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection failed to establish within timeout');
  }
};

// Check database connection status
const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = connectDB;
module.exports.awaitConnection = awaitConnection;
module.exports.isDBConnected = isDBConnected;
