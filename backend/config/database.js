const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    await mongoose.connect(config.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    
    });
    
    console.log('✅ MongoDB Connected');
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
