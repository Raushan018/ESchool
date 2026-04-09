import Fees from '../models/Fees.js';
import Student from '../models/Student.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { getPaginationParams, buildPaginationMeta } from '../utils/paginationHelper.js';
import { HTTP, FEE_STATUS } from '../config/constants.js';
import mongoose from 'mongoose';

/**
 * @route   POST /api/fees
 * @access  Admin
 * @desc    Create a fee record for a student
 */
const createFeeRecord = async (req, res, next) => {
  try {
    const { studentId, amount, dueDate, month, description } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(HTTP.NOT_FOUND).json(errorResponse('Student not found.'));
    }

    const fee = await Fees.create({
      studentId,
      amount,
      dueDate,
      month,
      description,
      collectedBy: req.user._id,
    });

    res.status(HTTP.CREATED).json(successResponse('Fee record created.', fee));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/fees
 * @access  Admin
 * @desc    Get all fee records with filters: status, month, studentId
 */
const getAllFees = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status, month, studentId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (month) filter.month = month;
    if (studentId) filter.studentId = studentId;

    const [fees, total] = await Promise.all([
      Fees.find(filter)
        .populate({
          path: 'studentId',
          select: 'batch phone',
          populate: { path: 'userId', select: 'name email' },
        })
        .sort({ dueDate: -1 })
        .skip(skip)
        .limit(limit),
      Fees.countDocuments(filter),
    ]);

    res.status(HTTP.OK).json(
      successResponse('Fee records fetched.', fees, buildPaginationMeta(total, page, limit))
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/fees/my
 * @access  Student
 */
const getMyFees = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(HTTP.NOT_FOUND).json(errorResponse('Student profile not found.'));
    }

    const fees = await Fees.find({ studentId: student._id }).sort({ dueDate: -1 });

    const total = fees.reduce((sum, f) => sum + f.amount, 0);
    const paid = fees.filter((f) => f.status === FEE_STATUS.PAID).reduce((sum, f) => sum + f.amount, 0);
    const pending = total - paid;

    res.status(HTTP.OK).json(
      successResponse('Fees fetched.', {
        fees,
        summary: { total, paid, pending },
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/fees/:id/pay
 * @access  Admin
 * @desc    Mark a fee record as paid
 */
const markFeePaid = async (req, res, next) => {
  try {
    const fee = await Fees.findById(req.params.id);
    if (!fee) return res.status(HTTP.NOT_FOUND).json(errorResponse('Fee record not found.'));

    if (fee.status === FEE_STATUS.PAID) {
      return res.status(HTTP.BAD_REQUEST).json(errorResponse('Fee is already marked as paid.'));
    }

    fee.status = FEE_STATUS.PAID;
    fee.paidDate = new Date();
    fee.collectedBy = req.user._id;
    await fee.save();

    // Update student's feesStatus if all fees are paid
    const pendingCount = await Fees.countDocuments({ studentId: fee.studentId, status: FEE_STATUS.PENDING });
    if (pendingCount === 0) {
      await Student.findByIdAndUpdate(fee.studentId, { feesStatus: FEE_STATUS.PAID });
    }

    res.status(HTTP.OK).json(successResponse('Fee marked as paid.', fee));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/fees/summary
 * @access  Admin
 * @desc    Aggregated financial summary
 */
const getFeesSummary = async (req, res, next) => {
  try {
    const summary = await Fees.aggregate([
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyTrend = await Fees.aggregate([
      { $match: { status: FEE_STATUS.PAID } },
      {
        $group: {
          _id: '$month',
          collected: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 12 }, // Last 12 months
    ]);

    res.status(HTTP.OK).json(
      successResponse('Summary fetched.', { breakdown: summary, monthlyTrend })
    );
  } catch (error) {
    next(error);
  }
};

export { createFeeRecord, getAllFees, getMyFees, markFeePaid, getFeesSummary };
