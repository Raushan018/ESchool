import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// ── Route imports ──────────────────────────────────────────────────────────
import authRoutes       from './routes/authRoutes.js';
import userRoutes       from './routes/userRoutes.js';
import studentRoutes    from './routes/studentRoutes.js';
import courseRoutes     from './routes/courseRoutes.js';
import teacherRoutes    from './routes/teacherRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import feesRoutes       from './routes/feesRoutes.js';
import testRoutes       from './routes/testRoutes.js';
import resultRoutes     from './routes/resultRoutes.js';

// ── Connect to database ───────────────────────────────────────────────────
connectDB();

const app = express();

// ─── Security middleware ──────────────────────────────────────────────────
app.use(helmet()); // Sets security HTTP headers

// CORS — allow only the frontend origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,            // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', limiter);

// Stricter limit on auth routes to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── Body parsers ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // Prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Request logging ──────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Health check ─────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ESchool API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/user',       userRoutes);
app.use('/api/students',   studentRoutes);
app.use('/api/courses',    courseRoutes);
app.use('/api/teachers',   teacherRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees',       feesRoutes);
app.use('/api/tests',      testRoutes);
app.use('/api/results',    resultRoutes);

// ─── 404 handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ─── Centralized error handler (must be last) ─────────────────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

export default app;
