import dns from 'dns';
import mongoose from 'mongoose';
dns.setServers(['8.8.8.8', '1.1.1.1']); // Fix MongoDB SRV Lookups on restricted local DNS
import dotenv from 'dotenv';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/asfaa2026', {
            autoIndex: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
