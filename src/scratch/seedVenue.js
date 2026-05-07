import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

import VenueSetting from '../models/VenueSetting.js';
import connectDB from '../config/db.js';

const seedVenue = async () => {
    try {
        await connectDB();
        
        const venueData = {
            host_city: 'Singapore',
            country: 'Singapore',
            venue_name: 'Crowne Plaza Changi Airport',
            venue_address: '75 Airport Blvd., #01-01, Singapore 819664',
            venue_description: 'Voted the World\'s Best Airport Hotel, Crowne Plaza Changi Airport offers premium facilities and direct access to Changi Airport, making it the perfect hub for international summits.',
            map_url: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3801.7266078870543!2d103.9853923!3d1.3585663!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da3c936a9124bf%3A0x74a0170f1cc50445!2sCrowne%20Plaza%20Changi%20Airport%20by%20IHG!5e1!3m2!1sen!2sin!4v1778159244706!5m2!1sen!2sin'
        };

        const venue = await VenueSetting.findOneAndUpdate({}, venueData, { upsert: true, new: true });
        console.log('✅ Venue seeded successfully:', venue);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedVenue();
