import { PAGINATION } from '../config/constants.js';

/**
 * Parse and normalize pagination params from query string.
 * @returns {{ page, limit, skip }}
 */
const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build pagination meta object for API responses.
 * @param {number} total  - total documents matching filter
 * @param {number} page
 * @param {number} limit
 */
const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

export { getPaginationParams, buildPaginationMeta };
