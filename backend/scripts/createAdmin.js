require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Admin user details
    const adminData = {
      fullName: 'Guidopia Admin',
      email: 'guidopiacareer@gmail.com',
      password: 'Admin@Guidopia2026!',
      phone: '+919876543210',
      class: '12th', // Required field, using 12th as default
      role: 'admin',
      isEmailVerified: true,
      isActive: true
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:', existingAdmin.email);
      console.log('📧 Email:', existingAdmin.email);
      console.log('🔑 Password: Admin@Guidopia2026!');
      process.exit(0);
    }

    // Create new admin user
    console.log('👤 Creating admin user...');
    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: Admin@Guidopia2026!');
    console.log('👑 Role: admin');
    console.log('📱 Phone: +919876543210');

    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the script
createAdmin();
