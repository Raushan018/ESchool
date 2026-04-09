import { Router } from 'express';
import {
  createFeeRecord,
  getAllFees,
  getMyFees,
  markFeePaid,
  getFeesSummary,
} from '../controllers/feesController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(protect);

// Student routes
router.get('/my', getMyFees);

// Admin routes
router.get('/summary',   authorize(ROLES.ADMIN), getFeesSummary);
router.get('/',          authorize(ROLES.ADMIN), getAllFees);
router.post('/',         authorize(ROLES.ADMIN), validate(['studentId', 'amount', 'dueDate']), createFeeRecord);
router.patch('/:id/pay', authorize(ROLES.ADMIN), markFeePaid);

export default router;
