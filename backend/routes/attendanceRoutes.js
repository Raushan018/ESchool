import { Router } from 'express';
import {
  markAttendance,
  getAttendanceReport,
  getMyAttendance,
  getStudentAttendanceSummary,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(protect);

// Student routes
router.get('/my', getMyAttendance);

// Admin routes
router.post('/',                      authorize(ROLES.ADMIN), validate(['courseId', 'date', 'records']), markAttendance);
router.get('/',                       authorize(ROLES.ADMIN), getAttendanceReport);
router.get('/summary/:studentId',     authorize(ROLES.ADMIN), getStudentAttendanceSummary);

export default router;
