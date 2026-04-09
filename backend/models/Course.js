import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Course name must be at least 2 characters'],
      maxlength: [200, 'Course name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    duration: {
      type: String, // e.g. "6 months", "1 year"
      trim: true,
    },
    fee: {
      type: Number,
      min: [0, 'Fee cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    thumbnail: {
      type: String, // URL
    },
    syllabus: [
      {
        topic: { type: String, required: true },
        description: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// Text index for search
courseSchema.index({ name: 'text', description: 'text' });
courseSchema.index({ teacherId: 1 });

const Course = mongoose.model('Course', courseSchema);
export default Course;
