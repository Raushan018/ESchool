import { Router } from 'express';
import {
  getAllStudents,
  getStudentById,
  getMyProfile,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats,
} from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';

const router = Router();

// All routes require authentication
router.use(protect);

// Student-accessible routes
router.get('/me', getMyProfile);

// Admin-only routes
router.get('/stats',   authorize(ROLES.ADMIN), getStudentStats);
router.get('/',        authorize(ROLES.ADMIN), getAllStudents);
router.post('/',       authorize(ROLES.ADMIN), validate(['name', 'email', 'password', 'courseId', 'batch', 'phone']), createStudent);
router.get('/:id',     authorize(ROLES.ADMIN), getStudentById);
router.put('/:id',     authorize(ROLES.ADMIN), updateStudent);
router.delete('/:id',  authorize(ROLES.ADMIN), deleteStudent);

export default router;
