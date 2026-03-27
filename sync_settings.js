import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';

dotenv.config();

const siteSettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    group: { type: String, default: 'general' },
    description: String,
    updated_at: { type: Date, default: Date.now }
});

const SiteSetting = mongoose.model('SiteSetting', siteSettingSchema);

const legalContent = [
    {
        title: 'Privacy Policy',
        slug: 'privacy',
        content: `Your privacy is important to ASFAA-2026. This policy outlines how we collect, use, and protect your personal information...

1. Data Collection: We collect name, email, and institutional details for registration.
2. Data Usage: Your data is used solely for summit organization and communications.
3. Security: We implement SSL and PCI-compliant processing for all financial transactions.`,
        updated_at: new Date().toISOString()
    },
    {
        title: 'Terms of Service',
        slug: 'terms',
        content: `By registering for ASFAA-2026, you agree to the following terms...

1. Registration: Fees are non-refundable after the early bird deadline.
2. Conduct: Attendees are expected to maintain professional standards.
3. Liability: The organizers are not responsible for personal property damage or injury.`,
        updated_at: new Date().toISOString()
    }
];

const importantDates = [
    {
        event: 'Early Bird Registration Deadline',
        date: new Date('2026-03-30T23:59:59'),
        description: 'Last day to register for all entry passes at discounted early rates.'
    },
    {
        event: 'Abstract Submission Deadline',
        date: new Date('2026-05-15T23:59:59'),
        description: 'Submission window for research papers and poster proposals.'
    },
    {
        event: 'ASFAA 2026 World Summit',
        date: new Date('2026-09-12T09:00:00'),
        description: 'Main event inauguration and technical sessions commencement.'
    }
];

const seedSettings = async () => {
    try {
        await connectDB();
        
        // Upsert Legal Content
        await SiteSetting.findOneAndUpdate(
            { key: 'legal_content' },
            { 
                value: legalContent,
                group: 'legal',
                description: 'Official legal policies for the summit.'
            },
            { upsert: true, new: true }
        );

        // Upsert Important Dates
        await SiteSetting.findOneAndUpdate(
            { key: 'important_dates' },
            { 
                value: importantDates,
                group: 'event',
                description: 'Key milestones and deadlines for the summit.'
            },
            { upsert: true, new: true }
        );

        console.log('✅ Site settings (legal & dates) synchronized.');
        process.exit();
    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    }
};

seedSettings();
