import express from 'express';
import { register, login, logout } from '../controllers/authController.js';

const router = express.Router();

// --- PUBLIC AUTH ROUTES ---

/**
 * Register scientific portal member
 * POST /api/auth/register
 */
router.post('/register', register);

/**
 * Log in to portal
 * POST /api/auth/login
 */
router.post('/login', login);

/**
 * Clear session
 * POST /api/auth/logout
 */
router.post('/logout', logout);

// User will add Google OAuth logic here (e.g. POST /api/auth/google)
// ... router.post('/google', googleLogin);

export default router;
