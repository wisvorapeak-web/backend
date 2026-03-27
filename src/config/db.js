import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Fix MongoDB SRV Lookups on restricted local DNS
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (error) {
    console.warn('DNS server adjustment skipped or failed:', error.message);
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and serverless function invocations in production.
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/asfaa2026';
        
        console.log('🔄 Initiating MongoDB Connection...');
        
        cached.promise = mongoose.connect(mongoURI, {
            autoIndex: true,
            // These options are often helpful for serverless stability
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        }).then((mongooseInstance) => {
            console.log(`✅ MongoDB Connected: ${mongooseInstance.connection.host}`);
            return mongooseInstance;
        }).catch((err) => {
            console.error(`❌ MongoDB connection error: ${err.message}`);
            cached.promise = null; // Reset if it failed
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
};

export default connectDB;
