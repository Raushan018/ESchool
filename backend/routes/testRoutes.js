import { Router } from 'express';
import {
  createTest,
  getAllTests,
  getTestById,
  attemptTest,
  updateTest,
  deleteTest,
} from '../controllers/testController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(protect);

// Both admin & student can list/view tests (filtered by role in controller)
router.get('/',     getAllTests);
router.get('/:id',  getTestById);

// Student: attempt test
router.post('/:id/attempt', authorize(ROLES.STUDENT), validate(['answers']), attemptTest);

// Admin: create / update / delete
router.post('/',     authorize(ROLES.ADMIN), validate(['title', 'courseId', 'questions', 'duration']), createTest);
router.put('/:id',   authorize(ROLES.ADMIN), updateTest);
router.delete('/:id', authorize(ROLES.ADMIN), deleteTest);

export default router;
