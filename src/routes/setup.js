import express from 'express';
import { setupSuperAdmin, checkSetupStatus } from '../controllers/setupController.js';

const router = express.Router();

// --- SETUP ROUTES ---

/**
 * Register primary super admin if none exists
 * POST /api/setup
 */
router.post('/', setupSuperAdmin);

/**
 * Check if a super admin is already initialized
 * GET /api/setup/status
 */
router.get('/status', checkSetupStatus);

export default router;
