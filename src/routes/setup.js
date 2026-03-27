import express from 'express';
import { initialSetup, getSetupStatus, syncEventSettings, syncTopics, syncAllData } from '../controllers/setupController.js';

const router = express.Router();

router.post('/sync-settings', syncEventSettings);
router.post('/sync-topics', syncTopics);
router.post('/sync-all', syncAllData);

/**
 * Perform initial system setup (creates first Super Admin)
 * POST /api/setup
 */
router.post('/', initialSetup);

/**
 * Check if the system needs initial setup
 * GET /api/setup/status
 */
router.get('/status', getSetupStatus);

export default router;
