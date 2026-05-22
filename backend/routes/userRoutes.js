import { Router } from 'express';
import { updateProfile, changePassword } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import upload from '../middleware/uploadMiddleware.js';

const router = Router();

router.use(protect); // all user routes require login

router.put('/profile', upload.single('avatar'), validate(['name']), updateProfile);
router.put('/password', validate(['currentPassword', 'newPassword']), changePassword);

export default router;
