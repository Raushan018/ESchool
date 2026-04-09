import Course from '../models/Course.js';
import Student from '../models/Student.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { getPaginationParams, buildPaginationMeta } from '../utils/paginationHelper.js';
import { HTTP } from '../config/constants.js';

/**
 * @route   GET /api/courses
 * @access  Public (auth not required for browsing)
 */
const getAllCourses = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search } = req.query;

    const filter = { isActive: true };

    // MongoDB full-text search if index exists
    if (search) {
      filter.$text = { $search: search };
    }

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate('teacherId', 'name subject')
        .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Course.countDocuments(filter),
    ]);

    res.status(HTTP.OK).json(
      successResponse('Courses fetched.', courses, buildPaginationMeta(total, page, limit))
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/courses/:id
 * @access  Public
 */
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('teacherId', 'name subject qualification experience');
    if (!course) {
      return res.status(HTTP.NOT_FOUND).json(errorResponse('Course not found.'));
    }

    // Include enrolled student count
    const enrolledCount = await Student.countDocuments({ courseId: course._id, isActive: true });

    res.status(HTTP.OK).json(successResponse('Course fetched.', { ...course.toObject(), enrolledCount }));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/courses
 * @access  Admin
 */
const createCourse = async (req, res, next) => {
  try {
    const { name, description, teacherId, duration, fee, syllabus, thumbnail } = req.body;

    const course = await Course.create({ name, description, teacherId, duration, fee, syllabus, thumbnail });
    res.status(HTTP.CREATED).json(successResponse('Course created successfully.', course));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/courses/:id
 * @access  Admin
 */
const updateCourse = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'description', 'teacherId', 'duration', 'fee', 'syllabus', 'thumbnail', 'isActive'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('teacherId', 'name subject');

    if (!course) {
      return res.status(HTTP.NOT_FOUND).json(errorResponse('Course not found.'));
    }

    res.status(HTTP.OK).json(successResponse('Course updated.', course));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/courses/:id
 * @access  Admin
 */
const deleteCourse = async (req, res, next) => {
  try {
    // Check if students are enrolled
    const enrolledCount = await Student.countDocuments({ courseId: req.params.id, isActive: true });
    if (enrolledCount > 0) {
      return res
        .status(HTTP.BAD_REQUEST)
        .json(errorResponse(`Cannot delete course with ${enrolledCount} active student(s). Deactivate students first.`));
    }

    const course = await Course.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!course) {
      return res.status(HTTP.NOT_FOUND).json(errorResponse('Course not found.'));
    }

    res.status(HTTP.OK).json(successResponse('Course deactivated.'));
  } catch (error) {
    next(error);
  }
};

export { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse };
