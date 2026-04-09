/**
 * Database Seeder
 * Run: node utils/seeder.js
 *
 * Creates:
 * - 1 admin user
 * - 2 sample courses
 * - 2 sample teachers
 * - 2 sample students
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Course from '../models/Course.js';

const seed = async () => {
  await connectDB();

  // Wipe existing data (dev only)
  await Promise.all([
    User.deleteMany(),
    Student.deleteMany(),
    Teacher.deleteMany(),
    Course.deleteMany(),
  ]);

  console.log('🗑️  Cleared existing data');

  // ── Admin ──────────────────────────────────────────────────────────────
  const admin = await User.create({
    name: 'Super Admin',
    email: 'admin@eschool.com',
    password: 'Admin@1234',
    role: 'admin',
  });

  // ── Teachers ───────────────────────────────────────────────────────────
  const [teacher1, teacher2] = await Teacher.create([
    { name: 'Priya Sharma', subject: 'Mathematics', qualification: 'M.Sc', experience: 8, email: 'priya@eschool.com' },
    { name: 'Rohit Verma', subject: 'Physics', qualification: 'M.Sc', experience: 5, email: 'rohit@eschool.com' },
  ]);

  // ── Courses ────────────────────────────────────────────────────────────
  const [course1, course2] = await Course.create([
    {
      name: 'Class 10 - Science',
      description: 'Complete Science curriculum for Class 10',
      teacherId: teacher1._id,
      duration: '12 months',
      fee: 5000,
    },
    {
      name: 'Class 12 - Mathematics',
      description: 'Advanced Mathematics for Class 12 board exams',
      teacherId: teacher2._id,
      duration: '12 months',
      fee: 6000,
    },
  ]);

  // ── Students ───────────────────────────────────────────────────────────
  const [user1, user2] = await User.create([
    { name: 'Amit Kumar', email: 'amit@student.com', password: 'Student@1234', role: 'student' },
    { name: 'Sneha Patel', email: 'sneha@student.com', password: 'Student@1234', role: 'student' },
  ]);

  await Student.create([
    { userId: user1._id, courseId: course1._id, batch: '2025-A', phone: '9876543210' },
    { userId: user2._id, courseId: course2._id, batch: '2025-B', phone: '9876543211' },
  ]);

  console.log('✅ Seed complete!');
  console.log('─────────────────────────────────');
  console.log('Admin     → admin@eschool.com     / Admin@1234');
  console.log('Student 1 → amit@student.com      / Student@1234');
  console.log('Student 2 → sneha@student.com     / Student@1234');
  console.log('─────────────────────────────────');

  mongoose.connection.close();
};

seed().catch((err) => {
  console.error(err);
  mongoose.connection.close();
  process.exit(1);
});
