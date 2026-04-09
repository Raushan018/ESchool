import Result from '../models/Result.js';
import Student from '../models/Student.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { getPaginationParams, buildPaginationMeta } from '../utils/paginationHelper.js';
import { HTTP, ROLES } from '../config/constants.js';
import mongoose from 'mongoose';

/**
 * @route   GET /api/results
 * @access  Admin
 * @desc    Get all results with optional filters
 */
const getAllResults = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { testId, studentId } = req.query;

    const filter = {};
    if (testId) filter.testId = testId;
    if (studentId) filter.studentId = studentId;

    const [results, total] = await Promise.all([
      Result.find(filter)
        .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
        .populate('testId', 'title totalMarks passingMarks')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Result.countDocuments(filter),
    ]);

    res.status(HTTP.OK).json(
      successResponse('Results fetched.', results, buildPaginationMeta(total, page, limit))
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/results/my
 * @access  Student
 * @desc    Student's own results with performance breakdown
 */
const getMyResults = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(HTTP.NOT_FOUND).json(errorResponse('Student profile not found.'));

    const results = await Result.find({ studentId: student._id })
      .populate('testId', 'title totalMarks courseId duration')
      .sort({ submittedAt: -1 });

    // Performance stats
    const totalTests = results.length;
    const passed = results.filter((r) => r.passed).length;
    const avgPercentage =
      totalTests > 0
        ? parseFloat((results.reduce((sum, r) => sum + r.percentage, 0) / totalTests).toFixed(2))
        : 0;

    res.status(HTTP.OK).json(
      successResponse('Results fetched.', {
        results,
        performance: { totalTests, passed, failed: totalTests - passed, avgPercentage },
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/results/:id
 * @access  Admin | Student (own result)
 */
const getResultById = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
      .populate('testId', 'title totalMarks passingMarks questions');

    if (!result) return res.status(HTTP.NOT_FOUND).json(errorResponse('Result not found.'));

    // Students can only see their own results
    if (req.user.role === ROLES.STUDENT) {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student || result.studentId._id.toString() !== student._id.toString()) {
        return res.status(HTTP.FORBIDDEN).json(errorResponse('Access denied.'));
      }
    }

    res.status(HTTP.OK).json(successResponse('Result fetched.', result));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/results/leaderboard/:testId
 * @access  Admin
 * @desc    Top performers for a specific test
 */
const getTestLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await Result.aggregate([
      { $match: { testId: new mongoose.Types.ObjectId(req.params.testId) } },
      { $sort: { score: -1, timeTaken: 1 } }, // Highest score, then fastest
      { $limit: 20 },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      {
        $lookup: {
          from: 'users',
          localField: 'student.userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          score: 1,
          totalMarks: 1,
          percentage: 1,
          passed: 1,
          timeTaken: 1,
          submittedAt: 1,
          'user.name': 1,
          'user.email': 1,
          'student.batch': 1,
        },
      },
    ]);

    res.status(HTTP.OK).json(successResponse('Leaderboard fetched.', leaderboard));
  } catch (error) {
    next(error);
  }
};

export { getAllResults, getMyResults, getResultById, getTestLeaderboard };
