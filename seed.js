import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import SiteSetting from './src/models/SiteSetting.js';

dotenv.config();

const seed = async () => {
    await connectDB();

    console.log('🧹 Cleaning existing data...');
    await User.deleteMany({});
    await SiteSetting.deleteMany({});

    console.log('👤 Creating Admin user...');
    await User.create({
        firstName: 'Admin',
        lastName: 'Secretariat',
        email: 'admin@asfaa2026.com',
        password: 'AdminPassword123!', 
        role: 'admin'
    });

    const settings = [
        // --- GENERAL SITE CONFIG ---
        {
            key: 'site_config',
            group: 'general',
            value: {
                site_title: 'Ascendix World Food, AgroTech & Animal Science',
                site_short_name: 'ASFAA-2026',
                site_tagline: 'Leading the future of food, agriculture and animal systems.',
                currency: '$',
                contact_email: 'contact@asfaa2026.com',
                contact_phone: '+65 6123 4567',
                contact_address: 'Singapore Innovation Hub, Singapore',
                office_hours: 'Mon - Fri: 09:00 - 18:00 (SGT)',
                socials: {
                    twitter: 'https://twitter.com/asfaa2026',
                    linkedin: 'https://linkedin.com/company/asfaa2026',
                    facebook: 'https://facebook.com/asfaa2026',
                    instagram: 'https://instagram.com/asfaa2026'
                }
            }
        },

        // --- HERO SECTION CONFIG ---
        {
            key: 'hero_config',
            group: 'appearance',
            value: {
                title: 'Ascendix World Food, AgroTech & Animal Science',
                subtitle: 'ASFAA-2026 • Singapore • November 18-20, 2026',
                description: 'Uniting leaders, innovators, and investors across the global food and agriculture ecosystem to shape the future of sustainable food systems.',
                bg_image_url: '/hero.png',
                cta_primary: { label: 'Register Now', link: '/registration' },
                cta_secondary: { label: 'Learn More', link: '#about' }
            }
        },

        // --- TOPICS ---
        {
            key: 'topics',
            group: 'content',
            value: [
                { title: 'Future of Food Systems & Global Food Security', description: 'Ensuring access to safe, nutritious, and sustainable food for all.', icon_name: 'Globe', color_gradient: 'from-blue-600 to-indigo-400', image_url: '/topics/food-security.png' },
                { title: 'Smart & Precision Agriculture', description: 'Leveraging data and technology to optimize crop yields.', icon_name: 'Zap', color_gradient: 'from-emerald-600 to-green-400', image_url: '/topics/smart-agri.png' },
                { title: 'AI, Big Data & Digital Agriculture', description: 'Harnessing the power of AI and data analytics in farming.', icon_name: 'Database', color_gradient: 'from-purple-600 to-pink-400', image_url: '/topics/ai-data.png' },
                { title: 'Climate-Smart & Regenerative Farming', description: 'Building resilient ecosystems through sustainable practices.', icon_name: 'CloudSun', color_gradient: 'from-orange-600 to-red-400', image_url: '/topics/climate-farming.png' },
                { title: 'Soil Health, Water & Resource Management', description: 'Optimizing resource use for healthy soil and water cycles.', icon_name: 'Droplets', color_gradient: 'from-cyan-600 to-blue-400', image_url: '/topics/soil-water.png' },
                { title: 'Crop Innovation, Genetics & Biotechnology', description: 'Advancing crop resilience through genetic research.', icon_name: 'Dna', color_gradient: 'from-rose-600 to-pink-400', image_url: '/topics/crop-genetics.png' },
                { title: 'Sustainable & Resilient Farming Systems', description: 'Developing adaptive farming techniques for future challenges.', icon_name: 'Sprout', color_gradient: 'from-green-600 to-lime-400', image_url: '/topics/resilient-systems.png' },
                { title: 'Animal Health, Welfare & Veterinary Science', description: 'Prioritizing livestock care and disease prevention.', icon_name: 'HeartPulse', color_gradient: 'from-red-600 to-rose-400', image_url: '/topics/animal-health.png' },
                { title: 'Livestock Production & Smart Animal Farming', description: 'Next-gen animal husbandry and monitoring technologies.', icon_name: 'Beef', color_gradient: 'from-amber-600 to-orange-400', image_url: '/topics/smart-livestock.png' },
                { title: 'Alternative Proteins & Future Foods', description: 'Exploring plant-based meats and lab-grown alternatives.', icon_name: 'Apple', color_gradient: 'from-lime-600 to-green-400', image_url: '/topics/alt-protein.png' }
            ]
        },

        // --- PRICING TIERS ---
        {
            key: 'pricing_tiers',
            group: 'content',
            value: [
                { id: 't1', name: 'Speaker Pass', category: 'Registration', amount: 749, currency: '$', is_active: true, features: ['Certification', 'Proceedings', 'Abstract Book'] },
                { id: 't2', name: 'Delegate Pass', category: 'Registration', amount: 899, currency: '$', is_active: true, features: ['Networking', 'Exhibition Access', 'Certification'] },
                { id: 't3', name: 'Student Pass', category: 'Registration', amount: 399, currency: '$', is_active: true, features: ['ID Verification Required', 'Full Session Access'] },
                { id: 's1', name: 'Platinum Sponsorship', category: 'Sponsorship', amount: 5000, currency: '$', is_active: true, features: ['4 Comp Passes', 'Workshop Lead', 'Main Stage Logo'] },
                { id: 's2', name: 'Gold Sponsorship', category: 'Sponsorship', amount: 3500, currency: '$', is_active: true, features: ['2 Comp Passes', 'Social Promo'] },
                { id: 'e1', name: 'Premium Exhibitor', category: 'Exhibition', amount: 3000, currency: '$', is_active: true, features: ['9sqm Booth', '2 Staff Passes'] }
            ]
        },

        // --- SITE METRICS ---
        {
            key: 'site_metrics',
            group: 'content',
            value: [
                { label: 'Expected Attendees', value: '5,000+', icon_name: 'Users' },
                { label: 'Global Speakers', value: '200+', icon_name: 'Mic2' },
                { label: 'Strategic Partners', value: '45+', icon_name: 'Award' },
                { label: 'Represented Nations', value: '60+', icon_name: 'Globe' }
            ]
        },

        // --- ABOUT HIGHLIGHTS ---
        {
            key: 'about_highlights',
            group: 'content',
            value: [
                { title: 'Global Recognition', description: 'Accredited by leading international agricultural bodies.', icon_name: 'Award' },
                { title: 'Strategic Networking', description: 'Connect with 200+ industry leaders and policy makers.', icon_name: 'Network' },
                { title: 'Publication Opportunities', description: 'Abstracts published in Scopus-indexed partner journals.', icon_name: 'BookOpen' }
            ]
        },

        // --- IMPORTANT DATES ---
        {
            key: 'important_dates',
            group: 'content',
            value: [
                { title: 'Abstract Submission Opens', date: 'Jan 10, 2026', status: 'Active', icon_name: 'FileText' },
                { title: 'Early Bird Registration', date: 'March 31, 2026', status: 'Active', icon_name: 'Zap' },
                { title: 'Final Abstract Deadline', date: 'Aug 15, 2026', status: 'Active', icon_name: 'Clock' },
                { title: 'Summit Kickoff', date: 'Nov 18, 2026', status: 'Active', icon_name: 'Calendar' }
            ]
        },

        // --- TESTIMONIALS ---
        {
            key: 'testimonials',
            group: 'content',
            value: [
                { name: 'Dr. Robert Chen', role: 'Chief Scientist, IARI', content: 'Asfaa is the most critical meeting point for agricultural innovation in the Asia-Pacific region.', image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert' },
                { name: 'Sarah Jenkins', role: 'CEO, AgriTech global', content: 'An unparalleled opportunity to scout for the latest startups and research.', image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' }
            ]
        },

        // --- FAQs ---
        {
            key: 'faqs',
            group: 'content',
            value: [
                { question: 'Is the summit online or in-person?', answer: 'ASFAA-2026 is planned as a full-scale in-person event in Singapore, with selected hybrid sessions for global reach.' },
                { question: 'What journals are you partnered with?', answer: 'We are partnered with over 15 high-impact journals including the International Journal of Agricultural Science and Technology.' }
            ]
        }
    ];

    console.log('📦 Seeding site settings...');
    await SiteSetting.insertMany(settings);

    console.log('✅ Seeding complete!');
    process.exit(0);
};

seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
