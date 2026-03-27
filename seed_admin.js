import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Topic from './src/models/Topic.js';
import Speaker from './src/models/Speaker.js';
import Sponsor from './src/models/Sponsor.js';
import Brochure from './src/models/Brochure.js';
import PricingTier from './src/models/PricingTier.js';
import SiteSetting from './src/models/SiteSetting.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing
    await Promise.all([
      Topic.deleteMany({}),
      Speaker.deleteMany({}),
      Sponsor.deleteMany({}),
      Brochure.deleteMany({}),
      PricingTier.deleteMany({}),
    ]);

    // Topics
    await Topic.insertMany([
      { title: 'Regenerative Agriculture', description: 'Restoring soil health and biodiversity.', icon_name: 'Leaf', display_order: 1 },
      { title: 'Animal Science & Welfare', description: 'Ethics and innovations in livestock management.', icon_name: 'Dog', display_order: 2 },
      { title: 'AgriTech & AI', description: 'Leveraging AI for precision farming.', icon_name: 'Cpu', display_order: 3 },
      { title: 'Food Security', description: 'Ensuring global food availability.', icon_name: 'Shield', display_order: 4 },
    ]);

    // Speakers
    await Speaker.insertMany([
      { name: 'Dr. Sarah Wilson', designation: 'Professor', institution: 'Oxford University', type: 'Keynote', display_order: 1 },
      { name: 'Marcus Chen', designation: 'CEO', institution: 'AgriCorp Tech', type: 'Guest', display_order: 2 },
    ]);

    // Sponsors
    await Sponsor.insertMany([
      { name: 'Global AgriTech', logo_url: 'https://via.placeholder.com/200x100?text=AgriTech', category: 'Platinum', display_order: 1 },
      { name: 'EcoFarmer Solutions', logo_url: 'https://via.placeholder.com/200x100?text=EcoFarmer', category: 'Gold', display_order: 2 },
    ]);

    // Pricing
    await PricingTier.insertMany([
      { name: 'Speaker Pass', category: 'Registration', amount: 749, features: ['Certification', 'Abstract Publication'], display_order: 1 },
      { name: 'Global Delegate', category: 'Registration', amount: 899, features: ['Full Access', 'Banquet Entry'], is_popular: true, display_order: 2 },
      { name: 'Platinum Partner', category: 'Sponsorship', amount: 15000, features: ['Prime Logo', 'Keynote Slot'], display_order: 3 },
    ]);

    // Brochures
    await Brochure.insertMany([
      { title: 'Event Brochure 2026', description: 'Overview of the summit.', file_url: '/files/brochure.pdf', display_order: 1 },
    ]);

    console.log('Seed data inserted successfully');
    process.exit();
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedData();
