import Teacher from '../models/Teacher.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { getPaginationParams, buildPaginationMeta } from '../utils/paginationHelper.js';
import { HTTP } from '../config/constants.js';

/**
 * @route   GET /api/teachers
 * @access  Admin
 */
const getAllTeachers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, subject } = req.query;

    const filter = { isActive: true };
    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    if (search) filter.$text = { $search: search };

    const [teachers, total] = await Promise.all([
      Teacher.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      Teacher.countDocuments(filter),
    ]);

    res.status(HTTP.OK).json(
      successResponse('Teachers fetched.', teachers, buildPaginationMeta(total, page, limit))
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/teachers/:id
 * @access  Admin
 */
const getTeacherById = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(HTTP.NOT_FOUND).json(errorResponse('Teacher not found.'));
    }
    res.status(HTTP.OK).json(successResponse('Teacher fetched.', teacher));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/teachers
 * @access  Admin
 */
const createTeacher = async (req, res, next) => {
  try {
    const { name, subject, qualification, phone, email, experience } = req.body;
    const teacher = await Teacher.create({ name, subject, qualification, phone, email, experience });
    res.status(HTTP.CREATED).json(successResponse('Teacher created.', teacher));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/teachers/:id
 * @access  Admin
 */
const updateTeacher = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'subject', 'qualification', 'phone', 'email', 'experience', 'isActive'];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const teacher = await Teacher.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!teacher) return res.status(HTTP.NOT_FOUND).json(errorResponse('Teacher not found.'));

    res.status(HTTP.OK).json(successResponse('Teacher updated.', teacher));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/teachers/:id
 * @access  Admin
 */
const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!teacher) return res.status(HTTP.NOT_FOUND).json(errorResponse('Teacher not found.'));
    res.status(HTTP.OK).json(successResponse('Teacher deactivated.'));
  } catch (error) {
    next(error);
  }
};

export { getAllTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher };
