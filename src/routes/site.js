import express from 'express';
import { 
  getSiteSettings, 
  getSpeakers, 
  getProgram, 
  getDates,
  getVenue,
  getGallery,
  getSponsors,
  getPricing,
  getLegalContent,
  getLegalBySlug,
  getBrochures,
  getTopics,
  getFAQs,
  getTestimonials,
  getAudiences,
  getAboutHighlights,
  getMetrics,
  getHeroConfig,
  getTravelInfo,
  getChairs
} from '../controllers/siteController.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = express.Router();

// --- PUBLIC READ-ONLY SITE DATA ---

// Core settings
router.get('/settings', cacheMiddleware(3600), getSiteSettings);

// Hero section
router.get('/hero', cacheMiddleware(3600), getHeroConfig);

// About
router.get('/about-highlights', cacheMiddleware(3600), getAboutHighlights);

// Speakers
router.get('/speakers', cacheMiddleware(3600), getSpeakers);

// Topics
router.get('/topics', cacheMiddleware(3600), getTopics);

// Schedule & Dates
router.get('/program', cacheMiddleware(3600), getProgram);
router.get('/dates', cacheMiddleware(3600), getDates);

// Venue
router.get('/venue', cacheMiddleware(3600), getVenue);
router.get('/gallery', cacheMiddleware(3600), getGallery);
router.get('/travel-info', cacheMiddleware(3600), getTravelInfo);

// Pricing & Registration
router.get('/pricing', cacheMiddleware(3600), getPricing);
router.get('/pricing-tiers', cacheMiddleware(3600), getPricing);

// Sponsors
router.get('/sponsors', cacheMiddleware(3600), getSponsors);

// Testimonials & FAQ
router.get('/testimonials', cacheMiddleware(3600), getTestimonials);
router.get('/faqs', cacheMiddleware(3600), getFAQs);

// Audiences
router.get('/audiences', cacheMiddleware(3600), getAudiences);

// Metrics
router.get('/metrics', cacheMiddleware(3600), getMetrics);

// Chairs
router.get('/chairs', cacheMiddleware(3600), getChairs);

// Legal
router.get('/legal', cacheMiddleware(3600), getLegalContent);
router.get('/legal/:slug', cacheMiddleware(3600), getLegalBySlug);

// Brochures
router.get('/brochures', cacheMiddleware(3600), getBrochures);

export default router;
