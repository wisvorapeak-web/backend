import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PricingTier from './src/models/PricingTier.js';
import connectDB from './src/config/db.js';

dotenv.config();

const registrationFeatures = [
    'Speaker Certificate',
    'Official Conference Program Inclusion',
    'E-Abstract Book Publication',
    'Publication in Partnered Journals',
    'Complimentary Meals',
    'Full Session Access'
];

const tiers = [
    // Early Bird Registration
    {
        name: 'Early Bird: Speaker Registration',
        category: 'Registration',
        amount: 749,
        description: 'Available until March 30, 2026',
        features: registrationFeatures,
        display_order: 1
    },
    {
        name: 'Early Bird: Delegate Registration',
        category: 'Registration',
        amount: 899,
        description: 'Available until March 30, 2026',
        features: registrationFeatures,
        display_order: 2
    },
    {
        name: 'Early Bird: Poster Registration',
        category: 'Registration',
        amount: 449,
        description: 'Available until March 30, 2026',
        features: registrationFeatures,
        display_order: 3
    },
    {
        name: 'Early Bird: Student Registration',
        category: 'Registration',
        amount: 399,
        description: 'Available until March 30, 2026',
        features: registrationFeatures,
        display_order: 4
    },
    
    // Standard Registration
    {
        name: 'Standard: Speaker Registration',
        category: 'Registration',
        amount: 849,
        description: 'Available until August 30, 2026',
        features: registrationFeatures,
        display_order: 5
    },
    {
        name: 'Standard: Delegate Registration',
        category: 'Registration',
        amount: 999,
        description: 'Available until August 30, 2026',
        features: registrationFeatures,
        display_order: 6
    },
    {
        name: 'Standard: Poster Registration',
        category: 'Registration',
        amount: 549,
        description: 'Available until August 30, 2026',
        features: registrationFeatures,
        display_order: 7
    },
    {
        name: 'Standard: Student Registration',
        category: 'Registration',
        amount: 599,
        description: 'Available until August 30, 2026',
        features: registrationFeatures,
        display_order: 8
    },

    // Accommodation - Single Occupancy
    { name: 'Accommodation: 1 Night (Single)', category: 'Accommodation', amount: 200, display_order: 9 },
    { name: 'Accommodation: 2 Nights (Single)', category: 'Accommodation', amount: 400, display_order: 10 },
    { name: 'Accommodation: 3 Nights (Single)', category: 'Accommodation', amount: 600, display_order: 11 },
    { name: 'Accommodation: 4 Nights (Single)', category: 'Accommodation', amount: 800, display_order: 12 },

    // Accommodation - Double Occupancy
    { name: 'Accommodation: 1 Night (Double)', category: 'Accommodation', amount: 240, display_order: 13 },
    { name: 'Accommodation: 2 Nights (Double)', category: 'Accommodation', amount: 480, display_order: 14 },
    { name: 'Accommodation: 3 Nights (Double)', category: 'Accommodation', amount: 720, display_order: 15 },
    { name: 'Accommodation: 4 Nights (Double)', category: 'Accommodation', amount: 960, display_order: 16 },

    // Add-ons
    { name: 'Accompanying Guest', category: 'Other', amount: 299, description: 'Optional guest package', display_order: 17 }
];

const seedPricing = async () => {
    try {
        await connectDB();
        
        // Remove existing registration and accommodation tiers to prevent duplicates
        await PricingTier.deleteMany({ category: { $in: ['Registration', 'Accommodation', 'Other'] } });
        
        const createdTiers = await PricingTier.insertMany(tiers);
        console.log(`✅ Successfully seeded ${createdTiers.length} pricing tiers.`);
        
        process.exit();
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedPricing();
