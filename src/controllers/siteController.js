import SiteSetting from '../models/SiteSetting.js';
import Topic from '../models/Topic.js';
import Speaker from '../models/Speaker.js';
import Sponsor from '../models/Sponsor.js';
import Brochure from '../models/Brochure.js';
import PricingTier from '../models/PricingTier.js';
import VenueSetting from '../models/VenueSetting.js';
import VenueGallery from '../models/VenueGallery.js';
import FAQ from '../models/FAQ.js';
import Testimonial from '../models/Testimonial.js';
import Audience from '../models/Audience.js';
import Metric from '../models/Metric.js';
import TravelInfo from '../models/TravelInfo.js';
import Session from '../models/Session.js';
import ImportantDate from '../models/ImportantDate.js';
import Registration from '../models/Registration.js';
import Offer from '../models/Offer.js';
import Organizer from '../models/Organizer.js';

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
        // Find speakers that are either active or don't have the flag yet (legacy)
        const speakers = await Speaker.find({ is_active: { $ne: false } }).sort({ display_order: 1 });
        
        // Map legacy data to ensure frontend consistency
        const mapped = speakers.map(s => {
            const obj = s.toObject();
            const rawCategory = obj.category || obj.type || 'Regular';
            // Normalize category to ensure it matches the frontend's capitalized tabs
            const normalizedCategory = typeof rawCategory === 'string' 
                ? rawCategory.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
                : 'Regular';

            return {
                id: obj._id,
                ...obj,
                category: normalizedCategory,
                university: obj.university || obj.institution || 'Global Hub',
                image_url: obj.image_url || obj.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${obj.name}`
            };
        });

        console.log(`[SiteData] Dispatched ${mapped.length} speakers to public interface.`);
        res.status(200).json(mapped);
    } catch (error) {
        console.error('getSpeakers sync error:', error);
        res.status(500).json({ error: 'Failed to fetch speakers.' });
    }
};

export const getProgram = async (req, res) => {
    try {
        const sessions = await Session.find().sort({ display_order: 1, createdAt: 1 });
        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch program.' });
    }
};

export const getDates = async (req, res) => {
    try {
        const dates = await ImportantDate.find().sort({ date: 1 });
        res.status(200).json(dates);
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
        const faqs = await FAQ.find().sort({ display_order: 1 });
        res.status(200).json(faqs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch FAQs.' });
    }
};

export const getTestimonials = async (req, res) => {
    try {
        const tests = await Testimonial.find().sort({ display_order: 1, createdAt: -1 });
        res.status(200).json(tests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch testimonials.' });
    }
};

export const getAudiences = async (req, res) => {
    try {
        const aud = await Audience.find().sort({ display_order: 1 });
        res.status(200).json(aud);
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
        const metrics = await Metric.find().sort({ display_order: 1 });
        res.status(200).json(metrics);
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
        const organizers = await Organizer.find({ is_active: true }).sort({ display_order: 1 });
        
        // Map to expected frontend format if needed
        const mapped = organizers.map(o => ({
            id: o._id,
            name: o.name,
            role: o.role,
            category: o.category || 'Scientific Committee',
            affiliation: o.affiliation || '-',
            location: o.location || '-',
            image: o.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${o.name}`
        }));

        // Fallback to settings if collection is empty
        if (mapped.length === 0) {
            const legacy = await fetchSetting('event_chairs');
            return res.status(200).json(legacy.map((l) => ({
                id: Math.random().toString(36).substr(2, 9),
                name: l.name || 'TBA',
                role: l.role || 'Member',
                affiliation: l.institution || l.affiliation || '-',
                location: l.location || 'Global',
                image: l.image || l.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${l.name || 'Org'}&background=random`
            })));
        }

        res.status(200).json(mapped);
    } catch (error) {
        console.error('getChairs error:', error);
        res.status(500).json({ error: 'Failed to fetch chairs.' });
    }
};

export const getTravelInfo = async (req, res) => {
    try {
        const info = await TravelInfo.find().sort({ display_order: 1 });
        res.status(200).json(info);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch travel info.' });
    }
};
export const getRegistrationById = async (req, res) => {
    try {
        const { id } = req.params;
        const reg = await Registration.findOne({ registrationId: id }).select('-__v');
        if (!reg) return res.status(404).json({ error: 'Registration record not found.' });
        res.status(200).json(reg);
    } catch (error) {
        console.error('getRegistrationById Error:', error);
        res.status(500).json({ error: 'Failed to retrieve registration details.' });
    }
};

export const getOfferByToken = async (req, res) => {
    try {
        const { token } = req.params;
        const offer = await Offer.findOne({ token }).populate('tierId', 'name category description features');
        if (!offer) return res.status(404).json({ error: 'Offer not found or link has expired.' });
        res.status(200).json(offer);
    } catch (error) {
        console.error('getOfferByToken Error:', error);
        res.status(500).json({ error: 'Failed to retrieve offer details.' });
    }
};
