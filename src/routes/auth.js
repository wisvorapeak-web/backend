import express from 'express';
import { 
  register, 
  login, 
  logout,
  getMe,
  forgotPassword,
  verifyOTP,
  resetPassword,
  resendOTP
} from '../controllers/authController.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimitMiddleware.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- PUBLIC AUTH ROUTES ---

// Register
router.post('/register', authLimiter, register);

// Login
router.post('/login', authLimiter, login);

// Logout
router.post('/logout', logout);

// Get current user (protected)
router.get('/me', authMiddleware, getMe);

// Forgot password
router.post('/forgot-password', passwordResetLimiter, forgotPassword);

// Verify OTP
router.post('/verify-otp', verifyOTP);

// Reset password
router.post('/reset-password', passwordResetLimiter, resetPassword);

// Resend OTP
router.post('/resend-otp', resendOTP);

export default router;
