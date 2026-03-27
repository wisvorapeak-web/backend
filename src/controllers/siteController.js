import SiteSetting from '../models/SiteSetting.js';
import Topic from '../models/Topic.js';
import Speaker from '../models/Speaker.js';
import Sponsor from '../models/Sponsor.js';
import Brochure from '../models/Brochure.js';
import PricingTier from '../models/PricingTier.js';
import VenueSetting from '../models/VenueSetting.js';
import VenueGallery from '../models/VenueGallery.js';

// Helper: safely fetch a SiteSetting by key and return its value
const fetchSetting = async (key, fallback = []) => {
    try {
        const doc = await SiteSetting.findOne({ key });
        return doc?.value ?? fallback;
    } catch {
        return fallback;
    }
};

export const getSiteSettings = async (req, res) => {
    try {
        const settings = await SiteSetting.find({ group: 'general' });

        if (settings.length === 0) {
             return res.status(200).json({
                site_title: 'Ascendix Summit: Food, AgriTech & Animal Science',
                site_short_name: 'ASFAA-2026',
                site_tagline: 'Uniting leaders, innovators, and investors across the global food and agriculture ecosystem.',
                currency: '$',
                contact_email: 'contact@asfaa2026.com',
                contact_phone: '+65 6123 4567',
                contact_address: 'Singapore Innovation Hub, Singapore',
                office_hours: 'Mon - Fri: 09:00 - 18:00 (SGT)',
                twitter_url: 'https://twitter.com/asfaa2026',
                linkedin_url: 'https://linkedin.com/company/asfaa2026',
                facebook_url: 'https://facebook.com/asfaa2026',
                instagram_url: 'https://instagram.com/asfaa2026',
                is_maintenance_mode: false
             });
        }

        const settingsObj = {};
        settings.forEach(s => settingsObj[s.key] = s.value);
        res.status(200).json(settingsObj);
    } catch (error) {
        console.error('getSiteSettings Error:', error);
        res.status(500).json({ error: 'Failed to fetch settings.' });
    }
};

export const getSpeakers = async (req, res) => {
    try {
        const speakers = await Speaker.find({ is_active: true }).sort({ display_order: 1 });
        res.status(200).json(speakers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch speakers.' });
    }
};

export const getProgram = async (req, res) => {
    try {
        res.status(200).json(await fetchSetting('program_schedule'));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch program.' });
    }
};

export const getDates = async (req, res) => {
    try {
        res.status(200).json(await fetchSetting('important_dates'));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dates.' });
    }
};

export const getVenue = async (req, res) => {
    try {
        const venue = await VenueSetting.findOne();
        res.status(200).json(venue || {
            host_city: 'Singapore',
            venue_name: 'Singapore Summit Center',
            venue_address: 'Singapore Innovation Hub, Singapore',
            venue_description: 'State-of-the-art facility for the world food agro-tech summit.'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch venue.' });
    }
};

export const getGallery = async (req, res) => {
    try {
        const gallery = await VenueGallery.find().sort({ display_order: 1, createdAt: -1 });
        res.status(200).json(gallery);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch gallery.' });
    }
};

export const getSponsors = async (req, res) => {
    try {
        const sponsors = await Sponsor.find({ is_active: true }).sort({ display_order: 1 });
        res.status(200).json(sponsors);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sponsors.' });
    }
};

export const getPricing = async (req, res) => {
    try {
        const pricing = await PricingTier.find({ is_active: true }).sort({ category: 1, display_order: 1 });
        res.status(200).json(pricing);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pricing.' });
    }
};

export const getLegalContent = async (req, res) => {
    try {
        res.status(200).json(await fetchSetting('legal_content'));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch legal content.' });
    }
};

export const getLegalBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const all = await fetchSetting('legal_content');
        const page = Array.isArray(all) ? all.find(p => p.slug === slug) : null;
        res.status(200).json(page || null);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch legal page.' });
    }
};

export const getBrochures = async (req, res) => {
    try {
        const brochures = await Brochure.find({ is_active: true }).sort({ display_order: 1 });
        res.status(200).json(brochures);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch brochures.' });
    }
};

export const getTopics = async (req, res) => {
    try {
        const topics = await Topic.find({ is_active: true }).sort({ display_order: 1 });
        res.status(200).json(topics);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch topics.' });
    }
};

export const getFAQs = async (req, res) => {
    try {
        res.status(200).json(await fetchSetting('faqs'));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch FAQs.' });
    }
};

export const getTestimonials = async (req, res) => {
    try {
        res.status(200).json(await fetchSetting('testimonials'));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch testimonials.' });
    }
};

export const getAudiences = async (req, res) => {
    try {
        res.status(200).json(await fetchSetting('audiences'));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch audiences.' });
    }
};

export const getAboutHighlights = async (req, res) => {
    try {
        res.status(200).json(await fetchSetting('about_highlights'));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch about highlights.' });
    }
};

export const getMetrics = async (req, res) => {
    try {
        res.status(200).json(await fetchSetting('site_metrics'));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch metrics.' });
    }
};

export const getHeroConfig = async (req, res) => {
    try {
        res.status(200).json(await fetchSetting('hero_config', {}));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch hero config.' });
    }
};

export const getChairs = async (req, res) => {
    try {
        res.status(200).json(await fetchSetting('event_chairs'));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chairs.' });
    }
};

export const getTravelInfo = async (req, res) => {
    try {
        res.status(200).json(await fetchSetting('venue_travel_info'));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch travel info.' });
    }
};
