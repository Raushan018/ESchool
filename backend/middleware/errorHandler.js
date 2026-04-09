import { HTTP } from '../config/constants.js';

/**
 * Centralized error handler middleware.
 * Must be registered LAST in Express middleware chain.
 *
 * Handles:
 * - Mongoose validation errors
 * - Mongoose duplicate key errors
 * - Mongoose CastError (invalid ObjectId)
 * - JWT errors (caught upstream, but fallback here)
 * - Generic server errors
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP.SERVER_ERROR;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // ── Mongoose: Validation error ──────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = HTTP.UNPROCESSABLE;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ── Mongoose: Duplicate key (unique constraint) ──────────────────────────
  if (err.code === 11000) {
    statusCode = HTTP.CONFLICT;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists.`;
  }

  // ── Mongoose: Invalid ObjectId ───────────────────────────────────────────
  if (err.name === 'CastError') {
    statusCode = HTTP.BAD_REQUEST;
    message = `Invalid value for field: ${err.path}`;
  }

  // ── Log in development only ──────────────────────────────────────────────
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error] ${err.stack}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * AppError — throw this from controllers for known HTTP errors.
 * Example: throw new AppError('Not found', 404);
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export { errorHandler, AppError };
