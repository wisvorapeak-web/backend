import mongoose from 'mongoose';
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import dotenv from 'dotenv';
import Submission from './src/models/Submission.js';
import crypto from 'crypto';

dotenv.config();

const abstracts = [
  {
    firstName: 'Dr. Elena',
    lastName: 'Kovac',
    email: 'e.kovac@wageningen.nl',
    institution: 'Wageningen University',
    topic: 'Technology',
    title: 'Precision AI in Soil Health Monitoring: A Multi-Sensor Approach',
    abstract: 'This research presents a novel architecture for real-time soil analysis using edge-computing and NIR spectroscopy. Our results indicate a 40% reduction in nitrogen runoff across various test plots.',
    type: 'abstract',
    status: 'Pending'
  },
  {
    firstName: 'Prof. Li',
    lastName: 'Wei',
    email: 'li.wei@cas.cn',
    institution: 'Chinese Academy of Sciences',
    topic: 'Innovation',
    title: 'Genomic Selection for Drought-Resistant Rice Varieties in Arid Regions',
    abstract: 'By utilizing CRISPR-Cas9 and advanced QTL mapping, we have identified three specific gene clusters responsible for enhanced water retention. The study details the field trial outcomes over three growing seasons.',
    type: 'abstract',
    status: 'Pending'
  },
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'jsmith@mit.edu',
    institution: 'Massachusetts Institute of Technology',
    topic: 'Sustainability',
    title: 'Blockchain-Enabled Transparency in Global Food Supply Chains',
    abstract: 'A distributed ledger framework designed to track carbon footprint and fair trade certifications from farm to table. The prototype focuses on the global coffee trade between Brazil and Europe.',
    type: 'abstract',
    status: 'Approved'
  },
  {
    firstName: 'Dr. Amara',
    lastName: 'Okonjo',
    email: 'a.okonjo@cgiar.org',
    institution: 'CGIAR Research Program',
    topic: 'Policy',
    title: 'Socio-Economic Impacts of Vertical Farming on Urban Food Security',
    abstract: 'This paper evaluates the scalability of hydroponic systems in high-density African mega-cities. We analyze energy consumption versus nutritional output for leafy greens and tubers.',
    type: 'abstract',
    status: 'Pending'
  }
];

async function seedAbstracts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Linked for Seeding Abstracts...');

        // Clear existing abstracts to avoid duplicates during test
        await Submission.deleteMany({ type: 'abstract' });
        console.log('Orphaned abstracts cleared.');

        for (const a of abstracts) {
            const submissionId = `ABS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
            await Submission.create({ ...a, submissionId });
        }

        console.log('Successfully seeded 4 Scientific Abstracts.');
        process.exit();
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
}

seedAbstracts();
