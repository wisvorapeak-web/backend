import client from '../config/redis.js';

/**
 * Higher-order function to generate caching middleware.
 * @param {number} duration - Cache duration in seconds.
 */
export const cacheMiddleware = (duration = 3600) => {
    return async (req, res, next) => {
        if (!client.isOpen) {
            return next();
        }

        const key = `cache:${req.originalUrl || req.url}`;
        
        try {
            const cachedData = await client.get(key);
            if (cachedData) {
                return res.json(JSON.parse(cachedData));
            }

            // Override res.json to capture response
            const originalJson = res.json.bind(res);
            res.json = (body) => {
                if (res.statusCode === 200) {
                    client.setEx(key, duration, JSON.stringify(body));
                }
                return originalJson(body);
            };

            next();
        } catch (err) {
            console.error('Cache Middleware Error:', err);
            next();
        }
    };
};

/**
 * Utility to clear specific cache keys or patterns.
 */
export const clearCache = async (pattern) => {
    if (!client.isOpen) return;
    try {
        const keys = await client.keys(`cache:${pattern}`);
        if (keys.length > 0) {
            await client.del(keys);
            console.log(`🧹 Cache cleared for pattern: ${pattern}`);
        }
    } catch (err) {
        console.error('Clear Cache Error:', err);
    }
};
