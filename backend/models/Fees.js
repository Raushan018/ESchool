import mongoose from 'mongoose';
import { FEE_STATUS } from '../config/constants.js';

const feesSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be at least 1'],
    },
    status: {
      type: String,
      enum: Object.values(FEE_STATUS),
      default: FEE_STATUS.PENDING,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    paidDate: {
      type: Date, // null until paid
    },
    month: {
      type: String, // e.g. "April-2025" for quick filtering
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

feesSchema.index({ studentId: 1 });
feesSchema.index({ status: 1 });
feesSchema.index({ dueDate: 1 });
feesSchema.index({ studentId: 1, status: 1 }); // Common query: student's pending fees

const Fees = mongoose.model('Fees', feesSchema);
export default Fees;
