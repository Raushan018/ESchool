import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { HTTP } from '../config/constants.js';

/**
 * @route   PUT /api/user/profile
 * @access  Private
 * @desc    Update logged-in user's name and email
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name && !email) {
      return res.status(HTTP.BAD_REQUEST).json(errorResponse('Provide name or email to update.'));
    }

    // Check email uniqueness if changing it
    if (email && email !== req.user.email) {
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) {
        return res.status(HTTP.CONFLICT).json(errorResponse('Email is already in use.'));
      }
    }

    const updates = {};
    if (name)  updates.name  = name.trim();
    if (email) updates.email = email.toLowerCase().trim();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(HTTP.OK).json(successResponse('Profile updated successfully.', user));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/user/password
 * @access  Private
 * @desc    Change logged-in user's password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(HTTP.BAD_REQUEST).json(errorResponse('Both current and new password are required.'));
    }
    if (newPassword.length < 6) {
      return res.status(HTTP.BAD_REQUEST).json(errorResponse('New password must be at least 6 characters.'));
    }

    // Fetch with password (excluded by default)
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(HTTP.UNAUTHORIZED).json(errorResponse('Current password is incorrect.'));
    }

    user.password = newPassword;
    await user.save(); // triggers pre-save bcrypt hash

    res.status(HTTP.OK).json(successResponse('Password changed successfully.'));
  } catch (error) {
    next(error);
  }
};
