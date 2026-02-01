require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedStudents = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('📚 Student seeding functionality - Not implemented yet');
    console.log('💡 Use this script to seed sample student data for testing');

    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');

  } catch (error) {
    console.error('❌ Error seeding students:', error);
    process.exit(1);
  }
};

// Run the script
seedStudents();
