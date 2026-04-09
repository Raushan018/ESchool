import { HTTP } from '../config/constants.js';
import { errorResponse } from '../utils/responseHelper.js';

/**
 * Role-based access control (RBAC).
 * Usage: authorize('admin') or authorize('admin', 'teacher')
 *
 * Must be used AFTER `protect` middleware (req.user must exist).
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(HTTP.UNAUTHORIZED)
        .json(errorResponse('Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(HTTP.FORBIDDEN)
        .json(
          errorResponse(
            `Access denied. Required role: ${allowedRoles.join(' or ')}.`
          )
        );
    }

    next();
  };
};

export { authorize };
