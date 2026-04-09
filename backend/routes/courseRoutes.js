import { Router } from 'express';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';

const router = Router();

// Public browsing — no auth required
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Admin mutation routes
router.post('/',      protect, authorize(ROLES.ADMIN), validate(['name', 'description']), createCourse);
router.put('/:id',   protect, authorize(ROLES.ADMIN), updateCourse);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteCourse);

export default router;
