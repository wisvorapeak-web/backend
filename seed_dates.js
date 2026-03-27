import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';

dotenv.config();

const dateSchema = new mongoose.Schema({
    event: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String }
});

const EventDate = mongoose.model('Date', dateSchema);

const dates = [
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

const seedDates = async () => {
    try {
        await connectDB();
        await EventDate.deleteMany({});
        await EventDate.insertMany(dates);
        console.log(`✅ Seeded ${dates.length} event dates.`);
        process.exit();
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedDates();
