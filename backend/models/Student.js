import mongoose from 'mongoose';
import { FEE_STATUS } from '../config/constants.js';

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One profile per user
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    batch: {
      type: String,
      required: [true, 'Batch is required'],
      trim: true,
      // e.g. "2024-A", "Morning-2025"
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      match: [/^\+?[\d\s\-()]{7,15}$/, 'Please provide a valid phone number'],
    },
    feesStatus: {
      type: String,
      enum: Object.values(FEE_STATUS),
      default: FEE_STATUS.PENDING,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    profilePic: {
      type: String, // URL to image (cloud storage in prod)
    },
    address: {
      type: String,
      trim: true,
    },
    guardianName: {
      type: String,
      trim: true,
    },
    guardianPhone: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes for common queries ────────────────────────────────────────────
studentSchema.index({ userId: 1 });
studentSchema.index({ courseId: 1 });
studentSchema.index({ batch: 1 });
studentSchema.index({ feesStatus: 1 });

// ─── Virtual: populate user name/email without storing it ─────────────────
studentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
