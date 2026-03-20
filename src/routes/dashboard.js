import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { 
  getProfile, 
  updateProfile, 
  getAbstracts, 
  submitAbstract,
  getRegistrations, 
  getEvents, 
  getSettings,
  getStats
} from '../controllers/dashboardController.js';

const router = express.Router();

/**
 * All routes in /api/dashboard require authentication.
 */
router.use(authMiddleware);

// --- Overview Stats ---
router.get('/stats', getStats);

// --- User Profile ---
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

// --- Scientific Abstracts ---
router.get('/abstracts', getAbstracts);
router.post('/abstracts/submit', submitAbstract);

// --- Events & Schedule ---
router.get('/events', getEvents);

// --- Registrations ---
router.get('/registrations', getRegistrations);

// --- User Settings ---
router.get('/settings', getSettings);

export default router;
