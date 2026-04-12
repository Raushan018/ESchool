import User from '../models/User.js';
import { sendTokenResponse } from '../utils/tokenHelper.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { HTTP, ROLES } from '../config/constants.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * @route   POST /api/auth/register
 * @access  Public
 * @desc    Register a new user (admin or student)
 */
const register = async (req, res, next) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    // Prevent creating admin via public API — must be done via seeder or existing admin
    if (role === ROLES.ADMIN) {
      const adminExists = await User.findOne({ role: ROLES.ADMIN });
      if (adminExists) {
        // Only an existing admin can create another admin (handled by separate route)
        return res
          .status(HTTP.FORBIDDEN)
          .json(errorResponse('Admin registration is restricted.'));
      }
    }

    // Check for duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(HTTP.CONFLICT)
        .json(errorResponse('An account with this email already exists.'));
    }

    // Check for duplicate mobile if provided
    if (mobile) {
      const mobileExists = await User.findOne({ mobile });
      if (mobileExists) {
        return res
          .status(HTTP.CONFLICT)
          .json(errorResponse('An account with this mobile number already exists.'));
      }
    }

    const user = await User.create({ 
      name, 
      email, 
      mobile: mobile || undefined,
      password, 
      role: role || ROLES.STUDENT 
    });

    sendTokenResponse(user, HTTP.CREATED, res, 'Registration successful.');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @access  Public
 * @desc    Login with email or mobile + password
 */
const login = async (req, res, next) => {
  try {
    const { email, mobile, password } = req.body;

    // Accept either email or mobile
    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    } else if (mobile) {
      user = await User.findOne({ mobile }).select('+password');
    } else {
      return res
        .status(HTTP.BAD_REQUEST)
        .json(errorResponse('Email or mobile number is required.'));
    }

    if (!user || !user.isActive) {
      return res
        .status(HTTP.UNAUTHORIZED)
        .json(errorResponse('Invalid credentials.'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(HTTP.UNAUTHORIZED)
        .json(errorResponse('Invalid credentials.'));
    }

    // Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, HTTP.OK, res, 'Login successful.');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    res.status(HTTP.OK).json(successResponse('Profile fetched.', req.user));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @access  Private
 * @desc    Clear auth cookie (for cookie-based clients)
 */
const logout = (req, res) => {
  res
    .cookie('token', '', { httpOnly: true, expires: new Date(0) })
    .status(HTTP.OK)
    .json(successResponse('Logged out successfully.'));
};

/**
 * @route   POST /api/auth/admin/create
 * @access  Private (admin only)
 * @desc    Allow existing admin to create another admin account
 */
const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(HTTP.CONFLICT)
        .json(errorResponse('An account with this email already exists.'));
    }

    const user = await User.create({ name, email, password, role: ROLES.ADMIN });
    res
      .status(HTTP.CREATED)
      .json(successResponse('Admin account created.', user.toSafeObject()));
  } catch (error) {
    next(error);
  }
};

export { register, login, getMe, logout, createAdmin };
