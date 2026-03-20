import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

client.on('connect', () => {
    console.log('✅ Connecting to Redis...');
});

client.on('ready', () => {
    console.log('🚀 Redis Cloud is Ready and Connected');
});

// For local dev where redis might not be running, we can handle it gracefully.
const connectRedis = async () => {
    try {
        await client.connect();
    } catch (err) {
        console.warn('⚠️ Could not connect to Redis. Caching will be disabled.');
    }
};

connectRedis();

export default client;
