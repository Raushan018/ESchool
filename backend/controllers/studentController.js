import Student from '../models/Student.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { getPaginationParams, buildPaginationMeta } from '../utils/paginationHelper.js';
import { HTTP, ROLES, FEE_STATUS } from '../config/constants.js';
import { AppError } from '../middleware/errorHandler.js';
import mongoose from 'mongoose';

/**
 * @route   GET /api/students
 * @access  Admin
 * @desc    Get all students with pagination, search, and filtering
 */
const getAllStudents = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, batch, feesStatus, courseId } = req.query;

    // Build filter
    const filter = { isActive: true };
    if (batch) filter.batch = batch;
    if (feesStatus) filter.feesStatus = feesStatus;
    if (courseId) filter.courseId = courseId;

    // Text search on joined user (name/email) — use aggregation
    let query = Student.find(filter)
      .populate('userId', 'name email lastLogin')
      .populate('courseId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // If search, filter by user name/email via $lookup is ideal but adds complexity.
    // Simple approach: search by joining after populate (works for small-medium datasets).
    let students = await query;

    if (search) {
      const s = search.toLowerCase();
      students = students.filter(
        (st) =>
          st.userId?.name?.toLowerCase().includes(s) ||
          st.userId?.email?.toLowerCase().includes(s) ||
          st.phone?.includes(s)
      );
    }

    const total = await Student.countDocuments(filter);

    res.status(HTTP.OK).json(
      successResponse('Students fetched successfully.', students, buildPaginationMeta(total, page, limit))
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/students/:id
 * @access  Admin | Student (own profile)
 */
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'name email role lastLogin')
      .populate('courseId', 'name description fee');

    if (!student) {
      return res.status(HTTP.NOT_FOUND).json(errorResponse('Student not found.'));
    }

    // Students can only view their own profile
    if (
      req.user.role === ROLES.STUDENT &&
      student.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(HTTP.FORBIDDEN).json(errorResponse('Access denied.'));
    }

    res.status(HTTP.OK).json(successResponse('Student fetched.', student));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/students/me
 * @access  Student
 * @desc    Get logged-in student's own profile
 */
const getMyProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id })
      .populate('courseId', 'name description duration fee')
      .populate('userId', 'name email lastLogin');

    if (!student) {
      return res.status(HTTP.NOT_FOUND).json(errorResponse('Student profile not found.'));
    }

    res.status(HTTP.OK).json(successResponse('Profile fetched.', student));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/students
 * @access  Admin
 * @desc    Create student (also creates User account)
 */
const createStudent = async (req, res, next) => {
  try {
    const { name, email, password, courseId, batch, phone, address, guardianName, guardianPhone } = req.body;

    // Check email uniqueness
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(HTTP.CONFLICT)
        .json(errorResponse('An account with this email already exists.'));
    }

    // Use a session for atomic creation
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const [user] = await User.create([{ name, email, password, role: ROLES.STUDENT }], { session });
      const [student] = await Student.create(
        [{ userId: user._id, courseId, batch, phone, address, guardianName, guardianPhone }],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      const populated = await Student.findById(student._id)
        .populate('userId', 'name email')
        .populate('courseId', 'name');

      res.status(HTTP.CREATED).json(successResponse('Student created successfully.', populated));
    } catch (txError) {
      await session.abortTransaction();
      session.endSession();
      throw txError;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/students/:id
 * @access  Admin
 */
const updateStudent = async (req, res, next) => {
  try {
    const allowedFields = ['batch', 'phone', 'feesStatus', 'address', 'guardianName', 'guardianPhone', 'courseId', 'isActive'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email')
      .populate('courseId', 'name');

    if (!student) {
      return res.status(HTTP.NOT_FOUND).json(errorResponse('Student not found.'));
    }

    res.status(HTTP.OK).json(successResponse('Student updated successfully.', student));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/students/:id
 * @access  Admin
 * @desc    Soft delete — deactivate, not destroy
 */
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!student) {
      return res.status(HTTP.NOT_FOUND).json(errorResponse('Student not found.'));
    }

    // Also deactivate the User account
    await User.findByIdAndUpdate(student.userId, { isActive: false });

    res.status(HTTP.OK).json(successResponse('Student deactivated successfully.'));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/students/stats
 * @access  Admin
 * @desc    Aggregated student statistics for dashboard
 */
const getStudentStats = async (req, res, next) => {
  try {
    const stats = await Student.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          paid: { $sum: { $cond: [{ $eq: ['$feesStatus', FEE_STATUS.PAID] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$feesStatus', FEE_STATUS.PENDING] }, 1, 0] } },
        },
      },
    ]);

    const batchBreakdown = await Student.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$batch', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.status(HTTP.OK).json(
      successResponse('Statistics fetched.', {
        summary: stats[0] || { total: 0, paid: 0, pending: 0 },
        batchBreakdown,
      })
    );
  } catch (error) {
    next(error);
  }
};

export { getAllStudents, getStudentById, getMyProfile, createStudent, updateStudent, deleteStudent, getStudentStats };
