import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';

dotenv.config();

const dateSchema = new mongoose.Schema({
    event: String,
    date: Date,
    description: String
});

const DateModel = mongoose.model('Date', dateSchema);

const checkDates = async () => {
    try {
        await connectDB();
        const dates = await DateModel.find();
        console.log('--- DATES IN DB ---');
        console.log(JSON.stringify(dates, null, 2));
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkDates();
