import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';

dotenv.config();

const legalSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    updated_at: { type: Date, default: Date.now }
});

const LegalContent = mongoose.model('LegalContent', legalSchema);

const policies = [
    {
        title: 'Privacy Policy',
        slug: 'privacy',
        content: `Your privacy is important to ASFAA-2026. This policy outlines how we collect, use, and protect your personal information...

1. Data Collection: We collect name, email, and institutional details for registration.
2. Data Usage: Your data is used solely for summit organization and communications.
3. Security: We implement SSL and PCI-compliant processing for all financial transactions.`
    },
    {
        title: 'Terms of Service',
        slug: 'terms',
        content: `By registering for ASFAA-2026, you agree to the following terms...

1. Registration: Fees are non-refundable after the early bird deadline.
2. Conduct: Attendees are expected to maintain professional standards.
3. Liability: The organizers are not responsible for personal property damage or injury.`
    }
];

const seedLegal = async () => {
    try {
        await connectDB();
        await LegalContent.deleteMany({});
        await LegalContent.insertMany(policies);
        console.log(`✅ Seeded ${policies.length} legal documents.`);
        process.exit();
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedLegal();
