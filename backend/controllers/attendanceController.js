import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { getPaginationParams, buildPaginationMeta } from '../utils/paginationHelper.js';
import { HTTP, ROLES, ATTENDANCE_STATUS } from '../config/constants.js';

/**
 * @route   POST /api/attendance
 * @access  Admin
 * @desc    Mark attendance for multiple students at once (bulk operation)
 * Body: { courseId, date, records: [{ studentId, status, remarks }] }
 */
const markAttendance = async (req, res, next) => {
  try {
    const { courseId, date, records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(HTTP.BAD_REQUEST).json(errorResponse('Records array is required.'));
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0); // Normalize to start of day

    // Use bulkWrite for efficient upsert — idempotent operation
    const operations = records.map(({ studentId, status, remarks }) => ({
      updateOne: {
        filter: { studentId, courseId, date: attendanceDate },
        update: {
          $set: {
            status,
            remarks,
            markedBy: req.user._id,
          },
        },
        upsert: true, // Create if not exists
      },
    }));

    const result = await Attendance.bulkWrite(operations);

    res.status(HTTP.OK).json(
      successResponse('Attendance marked successfully.', {
        matched: result.matchedCount,
        inserted: result.upsertedCount,
        modified: result.modifiedCount,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/attendance
 * @access  Admin
 * @desc    Get attendance records with optional filters
 * Query: courseId, studentId, startDate, endDate, status, page, limit
 */
const getAttendanceReport = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { courseId, studentId, startDate, endDate, status } = req.query;

    const filter = {};
    if (courseId) filter.courseId = courseId;
    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const [records, total] = await Promise.all([
      Attendance.find(filter)
        .populate('studentId', 'batch phone')
        .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
        .populate('courseId', 'name')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Attendance.countDocuments(filter),
    ]);

    res.status(HTTP.OK).json(
      successResponse('Attendance records fetched.', records, buildPaginationMeta(total, page, limit))
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/attendance/my
 * @access  Student
 * @desc    Student views their own attendance summary
 */
const getMyAttendance = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(HTTP.NOT_FOUND).json(errorResponse('Student profile not found.'));
    }

    const { startDate, endDate } = req.query;
    const filter = { studentId: student._id };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const records = await Attendance.find(filter)
      .populate('courseId', 'name')
      .sort({ date: -1 });

    // Compute attendance percentage
    const total = records.length;
    const present = records.filter((r) => r.status === ATTENDANCE_STATUS.PRESENT).length;
    const percentage = total > 0 ? parseFloat(((present / total) * 100).toFixed(2)) : 0;

    res.status(HTTP.OK).json(
      successResponse('Attendance fetched.', {
        records,
        summary: { total, present, absent: total - present, percentage },
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/attendance/summary/:studentId
 * @access  Admin
 * @desc    Aggregate attendance percentage for a specific student
 */
const getStudentAttendanceSummary = async (req, res, next) => {
  try {
    const summary = await Attendance.aggregate([
      { $match: { studentId: new (await import('mongoose')).default.Types.ObjectId(req.params.studentId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const totals = { present: 0, absent: 0, late: 0 };
    summary.forEach(({ _id, count }) => { totals[_id] = count; });
    const total = totals.present + totals.absent + totals.late;
    const percentage = total > 0 ? parseFloat(((totals.present / total) * 100).toFixed(2)) : 0;

    res.status(HTTP.OK).json(
      successResponse('Summary fetched.', { ...totals, total, percentage })
    );
  } catch (error) {
    next(error);
  }
};

export { markAttendance, getAttendanceReport, getMyAttendance, getStudentAttendanceSummary };
