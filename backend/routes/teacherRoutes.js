import { Router } from 'express';
import {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacherController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get('/',        getAllTeachers);
router.post('/',       validate(['name', 'subject']), createTeacher);
router.get('/:id',     getTeacherById);
router.put('/:id',     updateTeacher);
router.delete('/:id',  deleteTeacher);

export default router;
