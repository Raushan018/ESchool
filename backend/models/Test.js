import mongoose from 'mongoose';

// ─── MCQ question sub-schema ───────────────────────────────────────────────
const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    options: {
      type: [String],
      validate: {
        validator: (arr) => arr.length === 4,
        message: 'Each question must have exactly 4 options',
      },
      required: true,
    },
    correctOption: {
      type: Number, // Index: 0, 1, 2, or 3
      required: [true, 'Correct option index is required'],
      min: 0,
      max: 3,
    },
    marks: {
      type: Number,
      default: 1,
      min: 0,
    },
  },
  { _id: true }
);

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Test title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (arr) => arr.length >= 1,
        message: 'Test must have at least 1 question',
      },
    },
    duration: {
      type: Number, // minutes
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    totalMarks: {
      type: Number, // Computed from questions.marks on save
    },
    scheduledAt: {
      type: Date,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    passingMarks: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: true }
);

// ─── Pre-save: auto-compute totalMarks from questions ─────────────────────
testSchema.pre('save', function (next) {
  if (this.isModified('questions')) {
    this.totalMarks = this.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
  }
  next();
});

testSchema.index({ courseId: 1 });
testSchema.index({ isPublished: 1 });

const Test = mongoose.model('Test', testSchema);
export default Test;
