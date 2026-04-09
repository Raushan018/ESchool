import jwt from 'jsonwebtoken';

/**
 * Generate a signed JWT for the given user.
 * Payload includes id and role for fast RBAC without DB lookups.
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Attach token to an HTTP-only cookie (optional — for web clients).
 * Also returned in body so mobile/SPA clients can store it themselves.
 */
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user);

  const cookieOptions = {
    httpOnly: true, // Prevent XSS
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      token,
      data: user.toSafeObject ? user.toSafeObject() : user,
    });
};

export { generateToken, sendTokenResponse };
