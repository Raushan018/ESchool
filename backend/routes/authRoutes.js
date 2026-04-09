import { Router } from 'express';
import { register, login, getMe, logout, createAdmin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.post('/register', validate(['name', 'email', 'password']), register);
router.post('/login',    validate(['email', 'password']),          login);
router.get('/me',        protect,                                   getMe);
router.post('/logout',   protect,                                   logout);

// Only existing admins can create another admin
router.post(
  '/admin/create',
  protect,
  authorize(ROLES.ADMIN),
  validate(['name', 'email', 'password']),
  createAdmin
);

export default router;
