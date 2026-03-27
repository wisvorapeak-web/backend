import User from '../models/User.js';
import Topic from '../models/Topic.js';
import Speaker from '../models/Speaker.js';
import Sponsor from '../models/Sponsor.js';
import Brochure from '../models/Brochure.js';
import PricingTier from '../models/PricingTier.js';
import SiteSetting from '../models/SiteSetting.js';
import Registration from '../models/Registration.js';
import Submission from '../models/Submission.js';
import Testimonial from '../models/Testimonial.js';
import jwt from 'jsonwebtoken';
import { validatePassword } from '../middleware/sanitizationMiddleware.js';
import dotenv from 'dotenv';
dotenv.config();

const secret = process.env.JWT_SECRET;

export const initialSetup = async (req, res) => {
    try {
        if (!secret) {
            return res.status(500).json({ error: 'JWT_SECRET environment variable is not configured.' });
        }

        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required.' });

        // Validate password strength for the admin account
        if (!validatePassword(password)) {
            return res.status(400).json({ 
                error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.' 
            });
        }

        const count = await User.countDocuments();
        if (count > 0) return res.status(403).json({ error: 'System already setup.' });

        const names = name.trim().split(' ');
        const firstName = names[0];
        const lastName = names.slice(1).join(' ') || '.';

        const user = await User.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password,
            role: 'admin',
            isActive: true
        });

        const token = jwt.sign({ id: user._id }, secret, { expiresIn: '7d' });
        
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('token', token, { 
            httpOnly: true, 
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.status(201).json({
            message: 'Super Admin successfully initiated.',
            user: { id: user._id, name: `${user.firstName} ${user.lastName}`, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error('Setup Error:', error);
        res.status(500).json({ error: 'Setup failed.' });
    }
};

export const getSetupStatus = async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.json({ isSetupNeeded: count === 0 });
    } catch (error) {
        res.status(500).json({ error: 'Error' });
    }
};

export const syncEventSettings = async (req, res) => {
    try {
        const settings = [
            { key: 'site_title', value: 'Ascendix World Food, AgroTech & Animal Science' },
            { key: 'site_short_name', value: 'ASFAA-2026' },
            { key: 'event_dates', value: 'November 18-20, 2026' },
            { key: 'event_venue', value: 'Singapore' },
            { key: 'about_title', value: 'Who We Are: ASFAA-2026' },
            { 
                key: 'about_content', 
                value: `Greetings from ASFAA-2026!
Ascendix Summit: Food, AgriTech & Animal Science (ASFAA-2026) is a premier global platform uniting leaders, innovators, researchers, policymakers, and investors across the food, agriculture, and animal science ecosystems. Scheduled for November 18–20, 2026 in Singapore, the summit will spotlight cutting-edge advancements shaping the future of sustainable food systems and agri-innovation.

ASFAA 2026 brings together a dynamic mix of AgriTech startups, food technology pioneers, animal science experts, and global industry stakeholders to explore transformative solutions in areas such as precision agriculture, alternative proteins, smart farming, animal health, supply chain innovation, and climate-resilient agriculture.

A key highlight of the summit is its strong industrial participation, featuring leading agribusiness companies, food processing industries, animal health enterprises, technology providers, and global corporations. Industry partners will showcase next-generation products, share real-world case studies, and engage in collaborative discussions that bridge the gap between research, innovation, and commercialization. Dedicated exhibition zones, B2B networking sessions, and industry-led panels will create valuable opportunities for partnerships, investments, and technology transfer.

Designed as a high-impact, startup-driven and investor-focused event, the summit will feature keynote sessions, panel discussions, technology showcases, startup pitch competitions, and strategic networking opportunities. With Singapore’s position as a global innovation hub, ASFAA 2026 offers an ideal environment for fostering partnerships, accelerating investments, and driving forward-thinking dialogue.

We extend a warm welcome to all participants from around the world to join us in the vibrant city of Singapore, where ideas converge, industry meets innovation, and the future of food and agriculture takes shape!!!`
            },
            {
                key: 'hero_config',
                value: {
                    title: 'Ascendix Summit: Food, AgriTech & Animal Science',
                    description: 'ASFAA-2026: Led by the future of sustainable food systems and agri-innovation.',
                    bg_image_url: '/hero.png'
                }
            },
            {
                key: 'about_highlights',
                value: [
                    { title: 'Global Innovation Hub', description: 'Singapore serves as the ideal nexus for food and agri-tech breakthroughs.', icon_name: 'Zap' },
                    { title: 'Research Frontiers', description: 'Bridging the gap between academic discovery and industrial application.', icon_name: 'Dna' },
                    { title: 'Strategic Partnerships', description: 'Unlocking investment pathways for agricultural startups and investors.', icon_name: 'Handshake' }
                ]
            },
            {
                key: 'audiences',
                value: [
                    { 
                        title: 'Academic Researchers', 
                        subtitle: 'Pioneering Discovery', 
                        description: 'Showcase your latest findings in animal science, crop genetics, and sustainable food systems to a global audience.', 
                        icon_name: 'FlaskConical',
                        benefits: ['Speaker Certificate', 'Inclusion in Conference Program', 'E-Abstract Book Publication', 'Research Paper Publication', 'Complimentary Meals'],
                        link_path: '/abstract-submission'
                    },
                    { 
                        title: 'Industry Leaders', 
                        subtitle: 'Commercial Innovation', 
                        description: 'Bridge the gap between lab-scale research and industrial commercialization through high-impact partnerships.', 
                        icon_name: 'Briefcase',
                        benefits: ['B2B networking sessions', 'Market trend insights', 'Technology transfer'],
                        link_path: '/sponsorship'
                    },
                    { 
                        title: 'Group Participation Benefits', 
                        subtitle: 'Future Growth', 
                        description: 'A dedicated platform for high-impact innovation through collaborative engagement.', 
                        icon_name: 'GraduationCap',
                        benefits: ['Group discounts available', 'Priority session access', 'Customized exhibition space'],
                        link_path: '/registration'
                    }
                ]
            }
        ];

        for (const s of settings) {
            await SiteSetting.findOneAndUpdate(
                { key: s.key },
                { $set: { value: s.value } },
                { upsert: true }
            );
        }

        res.status(200).json({ message: 'Event settings synchronized successfully.' });

    } catch (error) {
        console.error('Settings Sync Error:', error);
        res.status(500).json({ error: 'Settings synchronization failed.', message: error.message });
    }
};


export const syncTopics = async (req, res) => {
    try {
        await Topic.deleteMany({});
        
        const topics = [
            { title: 'Future of Food Systems & Global Food Security', description: 'Exploring transformative solutions for global food supply.', icon_name: 'Globe', image_url: '/food_security_globe_1774551390859.png', display_order: 1 },
            { title: 'Smart & Precision Agriculture', description: 'Next-gen drone and GPS technology in farming.', icon_name: 'Cpu', image_url: '/precision_agri_drone_tractor_1774551412934.png', display_order: 2 },
            { title: 'AI, Big Data & Digital Agriculture', description: 'Data-driven insights for automated yield optimization.', icon_name: 'Database', image_url: '/ai_digital_agri_dashboard_1774551431773.png', display_order: 3 },
            { title: 'Climate-Smart & Regenerative Farming', description: 'Sustainable practices for resilient ecosystems.', icon_name: 'CloudSun', image_url: '/regenerative_farming_climate_1774551458617.png', display_order: 4 },
            { title: 'Soil Health, Water & Resource Management', description: 'Advanced conservation and irrigation science.', icon_name: 'Droplets', image_url: '/soil_health_irrigation_1774551478229.png', display_order: 5 },
            { title: 'Crop Innovation, Genetics & Biotechnology', description: 'Genomic advancements in resilient crop varieties.', icon_name: 'Dna', image_url: '/crops_biotech_dna_1774551497713.png', display_order: 6 },
            { title: 'Sustainable & Resilient Farming Systems', description: 'Diverse ecosystems for long-term productivity.', icon_name: 'Trees', image_url: '/sustainable_eco_farm_1774551516242.png', display_order: 7 },
            { title: 'Animal Health, Welfare & Veterinary Science', description: 'Modern veterinary care for productive livestock.', icon_name: 'Activity', image_url: '/animal_health_vet_1774551538168.png', display_order: 8 },
            { title: 'Livestock Production & Smart Animal Farming', description: 'Sensor technology and efficient production.', icon_name: 'Rss', image_url: '/smart_livestock_farming_1774551559816.png', display_order: 9 },
            { title: 'Alternative Proteins & Future Foods', description: 'Lab-grown and plant-based nutrition.', icon_name: 'FlaskConical', image_url: '/alt_protein_lab_meat_1774551581027.png', display_order: 10 },
            { title: 'Food Safety, Nutrition & Functional Foods', description: 'Certifying the health standards of modern food.', icon_name: 'ShieldCheck', image_url: '/food_safety_plate_1774551603891.png', display_order: 11 },
            { title: 'Food Processing, Packaging & Value Addition', description: 'Preserving quality through modern manufacturing.', icon_name: 'Settings', image_url: '/food_processing_factory_1774551627831.png', display_order: 12 },
            { title: 'Digital Transformation in Agriculture', description: 'Connecting farmers with real-time digital ecosystems.', icon_name: 'Smartphone', image_url: '/farmer_tablet_smart_farm_1774551644257.png', display_order: 13 },
            { title: 'Robotics, Automation & Farm Mechanization', description: 'Autonomous machinery for precision operations.', icon_name: 'Bot', image_url: '/agri_robot_tractor_1774551665722.png', display_order: 14 },
            { title: 'Vertical Farming & Urban Agriculture', description: 'Growing food in the heart of the city.', icon_name: 'Building2', image_url: '/vertical_urban_farm_1774551689988.png', display_order: 15 },
            { title: 'Agri Supply Chain, Logistics & Trade', description: 'Global trade pathways and farm-to-market systems.', icon_name: 'Truck', image_url: '/agri_supply_chain_logistics_1774551715809.png', display_order: 16 },
            { title: 'Blockchain, Traceability & Food Transparency', description: 'Transparent sourcing and decentralized validation.', icon_name: 'QrCode', image_url: '/blockchain_food_traceability_1774551730419_1774551736893.png', display_order: 17 },
            { title: 'Agribusiness, Industry Integration & Markets', description: 'Bridging the gap between innovation and markets.', icon_name: 'Briefcase', image_url: '/food_processing_factory_1774551627831.png', display_order: 18 },
            { title: 'Startups, Innovation & Agri-Investment', description: 'Accelerating early-stage agricultural technology.', icon_name: 'Rocket', image_url: '/precision_agri_drone_tractor_1774551412934.png', display_order: 19 },
            { title: 'Policy, Sustainability & Global Governance', description: 'Shaping the regulatory framework for global food.', icon_name: 'Scale', image_url: '/food_security_globe_1774551390859.png', display_order: 20 },
        ];

        await Topic.insertMany(topics);
        res.status(200).json({ message: 'Thematic sessions synced successfully.' });

    } catch (error) {
        console.error('Topics Sync Error:', error);
        res.status(500).json({ error: 'Failed to sync topics.' });
    }
};

export const syncAllData = async (req, res) => {
    try {
        // 1. Sync Speakers
        await Speaker.deleteMany({});
        const speakers = [
            { 
                name: 'Dr. Sarah Chen', 
                designation: 'Distinguished Professor', 
                institution: 'National University of Singapore', 
                type: 'Keynote',
                photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahChen',
                bio: 'Expert in resilient crop genetics and urban vertical farming systems.', 
                display_order: 1 
            },
            { 
                name: 'Prof. Marcus Thorne', 
                designation: 'Senior Researcher', 
                institution: 'Wageningen University', 
                type: 'Guest',
                photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MarcusThorne',
                bio: 'Leading researcher in livestock welfare and sustainable animal production.', 
                display_order: 2 
            },
            { 
                name: 'Dr. Elena Rossi', 
                designation: 'Policy Director', 
                institution: 'FAO Research Hub', 
                type: 'Guest',
                photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ElenaRossi',
                bio: 'Pioneering work in global food security and climate-smart policy frameworks.', 
                display_order: 3 
            },
            { 
                name: 'Johnathan Wu', 
                designation: 'Chief Technology Officer', 
                institution: 'AgriTech Global', 
                type: 'Regular',
                photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnathanWu',
                bio: 'Entrepreneur focusing on AI-driven precision irrigation and soil health monitoring.', 
                display_order: 4 
            }
        ];
        await Speaker.insertMany(speakers);

        // 1.5 Sync Admin User
        await User.findOneAndDelete({ email: 'admin@example.com' });
        await User.create({
            firstName: 'System',
            lastName: 'Administrator',
            email: 'admin@example.com',
            password: 'Admin123!',
            role: 'admin',
            isActive: true
        });


        // 2. Sync Sponsors/Partners
        await Sponsor.deleteMany({});
        const sponsors = [
            { name: 'FAO', category: 'Partner', logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=FAO', website_url: 'https://fao.org', display_order: 1 },
            { name: 'CGIAR', category: 'Partner', logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=CGIAR', website_url: 'https://cgiar.org', display_order: 2 },
            { name: 'WFP', category: 'Partner', logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=WFP', website_url: 'https://wfp.org', display_order: 3 },
            { name: 'IFAD', category: 'Partner', logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=IFAD', website_url: 'https://ifad.org', display_order: 4 },
            { name: 'GFSI', category: 'Media', logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=GFSI', display_order: 5 }
        ];
        await Sponsor.insertMany(sponsors);


        // 3. Sync Pricing Tiers
        await PricingTier.deleteMany({});
        const tiers = [
            { name: 'Speaker Registration', category: 'Registration', amount: 749, currency: '$', description: 'Early Bird (Until March 30)', features: ['Speaker Certificate', 'Official Program Inclusion', 'E-Abstract Book Publication', 'Partner Journal Publication', 'Complimentary Meals'], display_order: 1 },
            { name: 'Delegate Registration', category: 'Registration', amount: 899, currency: '$', description: 'Early Bird (Until March 30)', features: ['Official Program Inclusion', 'Full Session Access', 'E-Abstract Book Publication', 'Networking Banquet', 'Complimentary Meals'], display_order: 2 },
            { name: 'Poster Registration', category: 'Registration', amount: 449, currency: '$', description: 'Early Bird (Until March 30)', features: ['Scientific Certification', 'Abstract Publication', 'Exhibition Space', 'Digital credentials', 'Complimentary Meals'], display_order: 3 },
            { name: 'Student Registration', category: 'Registration', amount: 399, currency: '$', description: 'Early Bird (Until March 30)', features: ['Official Program Inclusion', 'Full Session Access', 'Mentorship Entry', 'Digital credentials', 'Complimentary Meals'], display_order: 4 },
            { name: 'Standard Speaker', category: 'Registration', amount: 849, currency: '$', description: 'Standard Registration', features: ['Speaker Certificate', 'Official Program Inclusion', 'E-Abstract Book Publication', 'Partner Journal Publication', 'Complimentary Meals'], display_order: 5 },
            { name: 'Standard Delegate', category: 'Registration', amount: 999, currency: '$', description: 'Standard Registration', features: ['Official Program Inclusion', 'Full Session Access', 'E-Abstract Book Publication', 'Networking Banquet', 'Complimentary Meals'], display_order: 6 },
            { name: 'Standard Poster', category: 'Registration', amount: 549, currency: '$', description: 'Standard Registration', features: ['Scientific Certification', 'Abstract Publication', 'Exhibition Space', 'Digital credentials', 'Complimentary Meals'], display_order: 7 },
            { name: 'Standard Student', category: 'Registration', amount: 599, currency: '$', description: 'Standard Registration', features: ['Official Program Inclusion', 'Full Session Access', 'Mentorship Entry', 'Digital credentials', 'Complimentary Meals'], display_order: 8 },
            
            // Sponsorship Packages
            { name: 'Platinum Sponsorship', category: 'Sponsorship', amount: 5000, currency: '$', features: ['4 Complimentary Registrations', 'Complimentary Workshop Access', 'Complimentary Lunch/Coffee', 'Website Logo with Hyperlink', 'Social Media Promotions', 'Conference Proceedings Logo', 'Main Poster Logo', '15-Min Presentation Opportunity'], display_order: 9 },
            { name: 'Gold Sponsorship', category: 'Sponsorship', amount: 4000, currency: '$', features: ['3 Complimentary Registrations', 'Workshop Access', 'Lunch/Coffee Breaks', 'Website Logo', 'Social Media Promotion', 'Conference Proceedings Logo', 'Main Poster Logo'], display_order: 10 },
            { name: 'Silver Sponsorship', category: 'Sponsorship', amount: 3000, currency: '$', features: ['2 Complimentary Registrations', 'Workshop Access', 'Lunch/Coffee Breaks', 'Website Logo', 'Social Media Promotion', 'Conference Proceedings Logo', 'Main Poster Logo'], display_order: 11 },
            
            // Exhibitor Packages
            { name: 'Platinum Exhibitor', category: 'Exhibition', amount: 4000, currency: '$', features: ['Large Booth (Prime Location)', '4 Complimentary Registrations', 'Workshop Access', 'Lunch/Coffee Breaks', 'Website Logo with Hyperlink', 'Conference Proceedings Listing', 'Main Poster Logo', '15-Min Presentation Slot'], display_order: 12 },
            { name: 'Gold Exhibitor', category: 'Exhibition', amount: 3000, currency: '$', features: ['Large Premium Stall', '3 Complimentary Registrations', 'Workshop Access', 'Lunch/Coffee Breaks', 'Website Logo', 'Conference Proceedings Listing', 'Main Poster Logo'], display_order: 13 },
            { name: 'Silver Exhibitor', category: 'Exhibition', amount: 2500, currency: '$', features: ['Standard Premium Stall', '2 Complimentary Registrations', 'Workshop Access', 'Lunch/Coffee Breaks', 'Website Logo', 'Conference Proceedings Listing', 'Main Poster Logo'], display_order: 14 }
        ];
        await PricingTier.insertMany(tiers);

        // 4. Sync Metrics (in SiteSetting)
        const metrics = [
            { label: 'Speakers', value: '50+', icon_name: 'Mic2' },
            { label: 'Participants', value: '2500+', icon_name: 'Users' },
            { label: 'Abstracts', value: '600+', icon_name: 'BookOpen' },
            { label: 'Countries', value: '45+', icon_name: 'Globe' }
        ];
        await SiteSetting.findOneAndUpdate({ key: 'site_metrics' }, { $set: { value: metrics } }, { upsert: true });

        // 5. Sync FAQ (in SiteSetting)
        const faqs = [
            { question: 'What is the date of ASFAA-2026?', answer: 'The summit is scheduled for November 18-20, 2026.' },
            { question: 'Where is the venue?', answer: 'The event will be held in the vibrant city of Singapore.' },
            { question: 'Is there an abstract submission deadline?', answer: 'Yes, please check the Important Dates section for the current deadline.' }
        ];
        await SiteSetting.findOneAndUpdate({ key: 'faqs' }, { $set: { value: faqs } }, { upsert: true });

        // 6. Sync Brochures
        await Brochure.deleteMany({});
        const brochures = [
            { title: 'Attendee Guide', description: 'Complete roadmap for participants.', file_url: '/guides/attendee-guide.pdf', category: 'Guide' },
            { title: 'Abstract Template', description: 'Standard format for research submissions.', file_url: '/guides/abstract-template.docx', category: 'Template' }
        ];
        await Brochure.insertMany(brochures);

        // 7. Sync Venue & Travel (in SiteSetting)
        const venue = {
            venue_name: 'Marina Bay Sands Singapore',
            address: '10 Bayfront Ave, Singapore 018956',
            city: 'Singapore',
            country: 'Singapore',
            description: 'A world-class integrated resort and convention center in the heart of Singapore.',
            map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.436735759942!2d103.851959!3d1.286667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da190fd5ad8619%3A0x6b81566373887413!2sMarina%20Bay%20Sands%20Singapore!5e0!3m2!1sen!2ssg!4v1700000000000!5m2!1sen!2ssg'
        };
        await SiteSetting.findOneAndUpdate({ key: 'venue_settings' }, { $set: { value: venue } }, { upsert: true });

        const travel = [
            { title: 'International Flights', description: 'Direct flights to Changi Airport from 100+ cities.', icon_name: 'Plane' },
            { title: 'Global Access', description: 'Strategic hub for international research exchange.', icon_name: 'Globe' },
            { title: 'Accommodations', description: 'Premium hotel packages available for delegates.', icon_name: 'Hotel' },
            { title: 'Local Logistics', description: 'Efficient public transport and visa support.', icon_name: 'Info' }
        ];
        await SiteSetting.findOneAndUpdate({ key: 'venue_travel_info' }, { $set: { value: travel } }, { upsert: true });

        const gallery = [
            { image_url: 'https://images.unsplash.com/photo-1525625230556-8e8ad5aa7a2e', caption: 'Singapore Skyline', category: 'Destination' },
            { image_url: 'https://images.unsplash.com/photo-1540339832862-da4094e098a0', caption: 'Zenith Convention Hall', category: 'Venue' },
            { image_url: 'https://images.unsplash.com/photo-1561069934-eee225952461', caption: 'Orchid Networking Atrium', category: 'Lobby' },
            { image_url: 'https://images.unsplash.com/photo-1582213713364-2bac3df37f31', caption: 'Global Innovation Hub', category: 'Destination' }
        ];
        await SiteSetting.findOneAndUpdate({ key: 'venue_gallery' }, { $set: { value: gallery } }, { upsert: true });

        const chairs = [
            { name: 'TBA', role: 'Conference Chair', institution: 'International Committee', icon_name: 'Award' },
            { name: 'TBA', role: 'Local Organizing Chair', institution: 'Singapore Hub', icon_name: 'MapPin' },
            { name: 'TBA', role: 'Scientific Committee Chair', institution: 'Global Research Board', icon_name: 'ShieldCheck' }
        ];
        await SiteSetting.findOneAndUpdate({ key: 'event_chairs' }, { $set: { value: chairs } }, { upsert: true });

        // 8. Sync Testimonials (in Testimonial collection)
        await Testimonial.deleteMany({});
        const testimonials = [
            { name: 'Dr. Robert Fisher', role: 'Head of Research', institution: 'FAO Hub', country: 'Germany', quote: 'ASFAA is the definitive assembly for scaling AgriTech solutions globally.', image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RobertFisher', display_order: 1 },
            { name: 'Linda K. M.', role: 'Senior Biotech Lead', institution: 'NUS', country: 'Singapore', quote: 'The interdisciplinary exchange here is second to none. A must-attend.', image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LindaKM', display_order: 2 },
            { name: 'Dr. Samuel Okafor', role: 'Sustainability Policy Advisor', institution: 'World Bank', country: 'Nigeria', quote: 'Bridging the gap between frontier research and market-ready farming.', image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SamuelOkafor', display_order: 3 }
        ];
        await Testimonial.insertMany(testimonials);

        res.status(200).json({ message: 'All data synchronized successfully.' });




    } catch (error) {
        console.error('All Sync Error:', error);
        res.status(500).json({ error: 'Failed to synchronize all data.', message: error.message });
    }
};




