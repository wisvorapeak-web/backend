import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Submission from './src/models/Submission.js';
import crypto from 'crypto';

dotenv.config();

const contacts = [
  {
    firstName: 'Arjun',
    lastName: 'Sharma',
    email: 'arjun.sharma@iitd.ac.in',
    subject: 'Abstract Submission Inquiry',
    message: 'Could you please clarify the word limit for the supplemental materials? Our team has extensive data to contribute.',
    type: 'contact',
    status: 'Pending'
  },
  {
    firstName: 'Priya',
    lastName: 'Das',
    email: 'priya.das@unicef.org',
    subject: 'NGO Partnership Opportunities',
    message: 'UNICEF is interested in collaborating for the Sustainable Materials track. Is there a priority deadline for NGO registrations?',
    type: 'contact',
    status: 'Pending'
  },
  {
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 's.jenkins@nature.com',
    subject: 'Press Accreditation',
    message: 'Requesting a media pass for our editorial team to cover the Food & AgriTech breakthroughs at the summit.',
    type: 'contact',
    status: 'Replied'
  },
  {
    firstName: 'Dr. Michael',
    lastName: 'Chen',
    email: 'm.chen@nus.edu.sg',
    subject: 'Keynote Speaker Availability',
    message: 'Confirming receipt of the speaker invitation. I am available for the Dec 15th session on Precision Agriculture.',
    type: 'contact',
    status: 'Pending'
  },
  {
    firstName: 'Vikram',
    lastName: 'Mehta',
    email: 'vmehta@tatamaterials.com',
    subject: 'Diamond Sponsorship Tiers',
    message: 'TATA Materials is reviewing the platinum sponsorship package. We would like to discuss booth placement in the main hall.',
    type: 'contact',
    status: 'Pending'
  }
];

async function seedContacts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Linked for Seeding...');

        // Clear existing contacts
        await Submission.deleteMany({ type: 'contact' });
        console.log('Existing contacts cleared.');

        for (const c of contacts) {
            const submissionId = `CON-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
            await Submission.create({ ...c, submissionId });
        }

        console.log('Successfully seeded contact submissions.');
        process.exit();
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
}

seedContacts();
