import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { HTTP } from '../config/constants.js';
import { errorResponse } from '../utils/responseHelper.js';

/**
 * Protect routes — verifies JWT from Authorization header.
 * Attaches `req.user` (full user document without password) for downstream use.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(HTTP.UNAUTHORIZED)
        .json(errorResponse('Access denied. No token provided.'));
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === 'TokenExpiredError'
          ? 'Token expired. Please login again.'
          : 'Invalid token.';
      return res.status(HTTP.UNAUTHORIZED).json(errorResponse(message));
    }

    // Verify user still exists and is active
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res
        .status(HTTP.UNAUTHORIZED)
        .json(errorResponse('User account not found or deactivated.'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export { protect };
