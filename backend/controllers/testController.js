import Test from '../models/Test.js';
import Result from '../models/Result.js';
import Student from '../models/Student.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { getPaginationParams, buildPaginationMeta } from '../utils/paginationHelper.js';
import { HTTP, ROLES } from '../config/constants.js';

/**
 * @route   POST /api/tests
 * @access  Admin
 * @desc    Create a new MCQ test
 */
const createTest = async (req, res, next) => {
  try {
    const { title, courseId, questions, duration, scheduledAt, isPublished, passingMarks } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(HTTP.BAD_REQUEST).json(errorResponse('At least one question is required.'));
    }

    const test = await Test.create({
      title,
      courseId,
      questions,
      duration,
      scheduledAt,
      isPublished,
      passingMarks,
      createdBy: req.user._id,
    });

    res.status(HTTP.CREATED).json(successResponse('Test created successfully.', test));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tests
 * @access  Admin (all tests) | Student (published tests for their course)
 */
const getAllTests = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { courseId } = req.query;

    const filter = {};
    if (courseId) filter.courseId = courseId;

    // Students only see published tests
    if (req.user.role === ROLES.STUDENT) {
      filter.isPublished = true;

      // Restrict to student's enrolled course
      const student = await Student.findOne({ userId: req.user._id });
      if (student) filter.courseId = student.courseId;
    }

    const [tests, total] = await Promise.all([
      Test.find(filter)
        .select('-questions.correctOption') // Never expose answers
        .populate('courseId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Test.countDocuments(filter),
    ]);

    res.status(HTTP.OK).json(
      successResponse('Tests fetched.', tests, buildPaginationMeta(total, page, limit))
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tests/:id
 * @access  Admin | Student (published only)
 */
const getTestById = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === ROLES.ADMIN;

    let query = Test.findById(req.params.id).populate('courseId', 'name');
    if (!isAdmin) {
      // Strip correct answers for student view
      query = query.select('-questions.correctOption');
    }

    const test = await query;
    if (!test) return res.status(HTTP.NOT_FOUND).json(errorResponse('Test not found.'));
    if (!isAdmin && !test.isPublished) {
      return res.status(HTTP.FORBIDDEN).json(errorResponse('This test is not available.'));
    }

    res.status(HTTP.OK).json(successResponse('Test fetched.', test));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tests/:id/attempt
 * @access  Student
 * @desc    Submit answers for a test — auto-grade and store result
 * Body: { answers: [{ questionId, selectedOption }] }
 */
const attemptTest = async (req, res, next) => {
  try {
    const { answers, timeTaken } = req.body;

    const test = await Test.findById(req.params.id);
    if (!test) return res.status(HTTP.NOT_FOUND).json(errorResponse('Test not found.'));
    if (!test.isPublished) return res.status(HTTP.FORBIDDEN).json(errorResponse('Test is not available.'));

    // Check if student already attempted
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(HTTP.NOT_FOUND).json(errorResponse('Student profile not found.'));

    const existing = await Result.findOne({ studentId: student._id, testId: test._id });
    if (existing) {
      return res.status(HTTP.CONFLICT).json(errorResponse('You have already attempted this test.'));
    }

    // ── Grade the attempt ────────────────────────────────────────────────
    let score = 0;
    const gradedAnswers = test.questions.map((q) => {
      const submitted = answers?.find((a) => a.questionId === q._id.toString());
      const isCorrect = submitted?.selectedOption === q.correctOption;
      const marksAwarded = isCorrect ? (q.marks || 1) : 0;
      score += marksAwarded;

      return {
        questionId: q._id,
        selectedOption: submitted?.selectedOption ?? null,
        isCorrect,
        marksAwarded,
      };
    });

    const result = await Result.create({
      studentId: student._id,
      testId: test._id,
      answers: gradedAnswers,
      score,
      totalMarks: test.totalMarks,
      timeTaken,
    });

    res.status(HTTP.CREATED).json(
      successResponse('Test submitted successfully.', {
        score,
        totalMarks: test.totalMarks,
        percentage: result.percentage,
        passed: result.passed,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/tests/:id
 * @access  Admin
 */
const updateTest = async (req, res, next) => {
  try {
    const allowedFields = ['title', 'questions', 'duration', 'scheduledAt', 'isPublished', 'passingMarks'];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const test = await Test.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!test) return res.status(HTTP.NOT_FOUND).json(errorResponse('Test not found.'));

    res.status(HTTP.OK).json(successResponse('Test updated.', test));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/tests/:id
 * @access  Admin
 */
const deleteTest = async (req, res, next) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);
    if (!test) return res.status(HTTP.NOT_FOUND).json(errorResponse('Test not found.'));
    // Also delete results for this test
    await Result.deleteMany({ testId: test._id });
    res.status(HTTP.OK).json(successResponse('Test deleted.'));
  } catch (error) {
    next(error);
  }
};

export { createTest, getAllTests, getTestById, attemptTest, updateTest, deleteTest };
