import mongoose from 'mongoose';

// Stores one answer per question for detailed analysis
const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedOption: { type: Number, min: 0, max: 3 }, // null = unattempted
    isCorrect: { type: Boolean, default: false },
    marksAwarded: { type: Number, default: 0 },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: [true, 'Test is required'],
    },
    answers: [answerSchema],
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    timeTaken: {
      type: Number, // seconds
    },
  },
  { timestamps: true }
);

// ─── One attempt per student per test ────────────────────────────────────
resultSchema.index({ studentId: 1, testId: 1 }, { unique: true });
resultSchema.index({ testId: 1 });

// ─── Pre-save: compute percentage and passed ──────────────────────────────
resultSchema.pre('save', async function (next) {
  if (this.isModified('score') || this.isModified('totalMarks')) {
    this.percentage =
      this.totalMarks > 0
        ? parseFloat(((this.score / this.totalMarks) * 100).toFixed(2))
        : 0;

    // Fetch passing marks from test if not already set
    if (this.isNew) {
      const Test = mongoose.model('Test');
      const test = await Test.findById(this.testId).select('passingMarks');
      if (test?.passingMarks != null) {
        this.passed = this.score >= test.passingMarks;
      }
    }
  }
  next();
});

const Result = mongoose.model('Result', resultSchema);
export default Result;
