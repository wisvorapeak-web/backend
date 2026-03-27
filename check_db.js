import mongoose from 'mongoose';
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import dotenv from 'dotenv';
import Submission from './src/models/Submission.js';

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const counts = await Submission.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);
        console.log('Submission Counts:', counts);
        
        const samples = await Submission.find().limit(5);
        console.log('Sample Submissions:', JSON.stringify(samples, null, 2));
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
