import { HTTP } from '../config/constants.js';
import { errorResponse } from '../utils/responseHelper.js';

/**
 * Request body validator middleware factory.
 * Usage: validate(['name', 'email', 'password'])
 *
 * Checks that required fields exist and are not empty strings.
 */
const validate = (requiredFields) => {
  return (req, res, next) => {
    const missing = [];

    for (const field of requiredFields) {
      const value = req.body[field];
      if (value === undefined || value === null || String(value).trim() === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return res.status(HTTP.BAD_REQUEST).json(
        errorResponse(`Missing required fields: ${missing.join(', ')}`, {
          missing,
        })
      );
    }

    next();
  };
};

export { validate };
