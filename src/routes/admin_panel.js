import express from 'express';
import multer from 'multer';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';
import { generalLimiter } from '../middleware/rateLimitMiddleware.js';
import { 
    getAllUsers, 
    getInboxMessages, 
    getAllAbstracts, 
    updateAbstractStatus,
    getAdminStats,
    updateSiteSettings,
    getAllRegistrations,
    getSiteSettings,
    createSiteSettings,
    deleteUser,
    updateUserStatus,
    replyToMessage,
    deleteMessage,
    sendBulkEmail,
    getAllTopics, createTopic, updateTopic, deleteTopic,
    getAllSpeakers, createSpeaker, updateSpeaker, deleteSpeaker,
    getAllSponsors, createSponsor, updateSponsor, deleteSponsor,
    getAllBrochures, createBrochure, updateBrochure, deleteBrochure,
    getAllPricing, createPricing, updatePricing, deletePricing,
    getAllFaqs, createFaq, updateFaq, deleteFaq,
    getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
    getAllAudiences, createAudience, updateAudience, deleteAudience,
    getAllMetrics, createMetric, updateMetric, deleteMetric,
    getAllTravelInfo, createTravelInfo, updateTravelInfo, deleteTravelInfo,
    updateRegistrationStatus, deleteRegistration,
    getVenueSettings, updateVenueSettings,
    getAllVenueGallery, createVenueGallery, deleteVenueGallery
} from '../controllers/adminController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Apply authentication and admin check to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Apply rate limiting
router.use(generalLimiter);

// --- DASHBOARD STATS ---
router.get('/stats', cacheMiddleware(900), getAdminStats);

// --- USER MANAGEMENT ---
router.get('/users', cacheMiddleware(1800), getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// --- INBOX MANAGEMENT ---
router.get('/inbox', cacheMiddleware(300), getInboxMessages);
router.patch('/inbox/:id/reply', replyToMessage);
router.delete('/inbox/:id', deleteMessage);

// --- ABSTRACT REVIEW ---
router.get('/abstracts', cacheMiddleware(600), getAllAbstracts);
router.patch('/abstracts/:id/status', updateAbstractStatus);

// --- REGISTRATION MANAGEMENT ---
router.get('/registrations', cacheMiddleware(900), getAllRegistrations);
router.patch('/registrations/:id/status', updateRegistrationStatus);
router.delete('/registrations/:id', deleteRegistration);

// --- SITE SETTINGS ---
router.get('/settings', cacheMiddleware(3600), getSiteSettings);
router.post('/settings', createSiteSettings);
router.put('/settings/:id', updateSiteSettings);

// --- SITE CONTENT MANAGEMENT (DYNAMIC) ---
router.get('/topics', getAllTopics);
router.post('/topics', createTopic);
router.patch('/topics/:id', updateTopic);
router.delete('/topics/:id', deleteTopic);

router.get('/speakers', getAllSpeakers);
router.post('/speakers', createSpeaker);
router.patch('/speakers/:id', updateSpeaker);
router.delete('/speakers/:id', deleteSpeaker);

router.get('/sponsors', getAllSponsors);
router.post('/sponsors', createSponsor);
router.patch('/sponsors/:id', updateSponsor);
router.delete('/sponsors/:id', deleteSponsor);

router.get('/brochures', getAllBrochures);
router.post('/brochures', createBrochure);
router.patch('/brochures/:id', updateBrochure);
router.delete('/brochures/:id', deleteBrochure);

router.get('/pricing', getAllPricing);
router.post('/pricing', createPricing);
router.patch('/pricing/:id', updatePricing);
router.delete('/pricing/:id', deletePricing);

router.get('/faqs', getAllFaqs);
router.post('/faqs', createFaq);
router.patch('/faqs/:id', updateFaq);
router.delete('/faqs/:id', deleteFaq);

router.get('/testimonials', getAllTestimonials);
router.post('/testimonials', createTestimonial);
router.patch('/testimonials/:id', updateTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);

router.get('/audiences', getAllAudiences);
router.post('/audiences', createAudience);
router.patch('/audiences/:id', updateAudience);
router.delete('/audiences/:id', deleteAudience);

router.get('/metrics', getAllMetrics);
router.post('/metrics', createMetric);
router.patch('/metrics/:id', updateMetric);
router.delete('/metrics/:id', deleteMetric);

router.get('/travel-info', getAllTravelInfo);
router.post('/travel-info', createTravelInfo);
router.patch('/travel-info/:id', updateTravelInfo);
router.delete('/travel-info/:id', deleteTravelInfo);

router.get('/venue', getVenueSettings);
router.put('/venue', updateVenueSettings);
router.get('/venue/gallery', getAllVenueGallery);
router.post('/venue/gallery', createVenueGallery);
router.delete('/venue/gallery/:id', deleteVenueGallery);


// --- BULK EMAIL DISPATCH ---
router.post('/bulk-email', upload.single('csv'), sendBulkEmail);

export default router;
