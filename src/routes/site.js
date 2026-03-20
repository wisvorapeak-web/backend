import express from 'express';
import { getSiteSettings, getSpeakers, getProgram, getDates } from '../controllers/siteController.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = express.Router();

router.get('/settings', cacheMiddleware(3600), getSiteSettings);
router.get('/speakers', cacheMiddleware(3600), getSpeakers);
router.get('/program', cacheMiddleware(3600), getProgram);
router.get('/dates', cacheMiddleware(3600), getDates);

export default router;
