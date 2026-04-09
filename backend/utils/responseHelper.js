/**
 * Standardized API response helpers.
 * All responses follow this envelope:
 *
 * { success: true,  message: '...', data: {...}, meta: {...} }
 * { success: false, message: '...', errors: [...] }
 *
 * Using consistent structure makes frontend parsing predictable.
 */

/**
 * @param {string} message
 * @param {*} data
 * @param {object} meta  - pagination info, counts, etc.
 */
const successResponse = (message, data = null, meta = null) => ({
  success: true,
  message,
  ...(data !== null && { data }),
  ...(meta !== null && { meta }),
});

/**
 * @param {string} message
 * @param {*} errors  - validation errors array or object
 */
const errorResponse = (message, errors = null) => ({
  success: false,
  message,
  ...(errors !== null && { errors }),
});

export { successResponse, errorResponse };
