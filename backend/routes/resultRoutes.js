import { Router } from 'express';
import {
  getAllResults,
  getMyResults,
  getResultById,
  getTestLeaderboard,
} from '../controllers/resultController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(protect);

// Student
router.get('/my', getMyResults);

// Admin
router.get('/leaderboard/:testId', authorize(ROLES.ADMIN), getTestLeaderboard);
router.get('/',                    authorize(ROLES.ADMIN), getAllResults);

// Admin | Student (own)
router.get('/:id', getResultById);

export default router;
