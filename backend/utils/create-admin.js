/**
 * Safe Admin Creator
 * Run: node utils/create-admin.js
 *
 * Creates the admin account only if no admin exists yet.
 * Does NOT wipe any existing data.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const createAdmin = async () => {
  await connectDB();

  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log('✅ Admin already exists:');
    console.log(`   Email: ${existing.email}`);
    console.log('   Use that email + your password to log in.');
    mongoose.connection.close();
    return;
  }

  await User.create({
    name: 'Super Admin',
    email: 'admin@eschool.com',
    password: 'Admin@1234',
    role: 'admin',
  });

  console.log('✅ Admin created successfully!');
  console.log('─────────────────────────────────');
  console.log('Email    → admin@eschool.com');
  console.log('Password → Admin@1234');
  console.log('─────────────────────────────────');
  console.log('⚠️  Change the password after first login!');

  mongoose.connection.close();
};

createAdmin().catch((err) => {
  console.error('❌ Error:', err.message);
  mongoose.connection.close();
  process.exit(1);
});
