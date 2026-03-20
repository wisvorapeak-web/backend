import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';
import { 
    getAllUsers, 
    getInboxMessages, 
    getAllAbstracts, 
    updateAbstractStatus,
    getAdminStats,
    updateSiteSettings,
    getAllRegistrations
} from '../controllers/adminController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.get('/inbox', getInboxMessages);
router.get('/abstracts', getAllAbstracts);
router.get('/registrations', getAllRegistrations);
router.patch('/abstracts/status', updateAbstractStatus);
router.put('/settings', updateSiteSettings);

export default router;
