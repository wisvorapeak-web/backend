import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Brochure from '../src/models/Brochure.js';

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await Brochure.countDocuments();
        const brochures = await Brochure.find();
        console.log('Brochure Count:', count);
        console.log('Brochures:', JSON.stringify(brochures, null, 2));
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

check();
