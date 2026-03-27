import express from 'express';
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
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all dashboard routes
router.use(authMiddleware);

// Profile
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

// Abstracts
router.get('/abstracts', getAbstracts);
router.post('/abstracts', submitAbstract);

// Registrations
router.get('/registrations', getRegistrations);

// Events
router.get('/events', getEvents);

// Settings
router.get('/settings', getSettings);

// Stats
router.get('/stats', getStats);

export default router;
