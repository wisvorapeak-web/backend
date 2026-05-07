import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

import VenueSetting from '../models/VenueSetting.js';
import connectDB from '../config/db.js';

const checkVenue = async () => {
    try {
        await connectDB();
        const venue = await VenueSetting.findOne();
        console.log('🔍 Current Venue Data:', JSON.stringify(venue, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('❌ Check failed:', error);
        process.exit(1);
    }
};

checkVenue();
