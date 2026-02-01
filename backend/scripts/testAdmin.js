require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const testAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ email: 'guidopiacareer@gmail.com' }).select('+password');
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('👤 Admin user found:');
    console.log('📧 Email:', admin.email);
    console.log('👑 Role:', admin.role);
    console.log('📱 Phone:', admin.phone);
    console.log('✅ Active:', admin.isActive);
    console.log('🔒 Password Hash Length:', admin.password.length);

    // Test password comparison
    const testPassword = 'Admin@Guidopia2026!';
    console.log('🔑 Testing password:', testPassword);

    const isCorrect = await bcrypt.compare(testPassword, admin.password);
    console.log('🔍 Password match:', isCorrect);

    if (isCorrect) {
      console.log('✅ Login should work!');
    } else {
      console.log('❌ Password does not match');

      // Try alternative passwords
      const alternatives = ['Admin@Guidopia2024!', 'admin123', 'password'];
      for (const altPass of alternatives) {
        const altCorrect = await bcrypt.compare(altPass, admin.password);
        if (altCorrect) {
          console.log('✅ Alternative password works:', altPass);
          break;
        }
      }
    }

    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');

  } catch (error) {
    console.error('❌ Error testing admin:', error);
    process.exit(1);
  }
};

// Run the test
testAdmin();
