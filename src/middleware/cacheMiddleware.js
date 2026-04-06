import client from '../config/redis.js';

/**
 * Higher-order function to generate caching middleware.
 * @param {number} duration - Cache duration in seconds.
 */
export const cacheMiddleware = (duration = 3600) => {
    return async (req, res, next) => {
        // Only cache GET requests and require Redis to be open
        if (req.method !== 'GET' || !client.isOpen) {
            return next();
        }

        const key = `cache:${req.originalUrl || req.url}`;
        
        try {
            const cachedData = await client.get(key);
            if (cachedData) {
                const parsed = JSON.parse(cachedData);
                res.set('X-Cache', 'HIT');
                return res.json(parsed);
            }

            // Override res.json to capture response and cache it
            const originalJson = res.json.bind(res);
            res.json = (body) => {
                // Only cache successful responses
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    // Fire-and-forget — don't block the response on cache write
                    client.setEx(key, duration, JSON.stringify(body)).catch(err => {
                        console.error('Cache Write Error:', err.message);
                    });
                }
                res.set('X-Cache', 'MISS');
                return originalJson(body);
            };

            next();
        } catch (err) {
            console.error('Cache Middleware Error:', err.message);
            next(); // Fail open — serve from DB if cache fails
        }
    };
};

/**
 * Utility to clear specific cache keys or patterns.
 * Uses SCAN instead of KEYS for production safety (KEYS blocks Redis on large data).
 */
export const clearCache = async (pattern) => {
    if (!client.isOpen) return;
    try {
        const fullPattern = `cache:${pattern}`;
        const keysToDelete = [];
        
        // Use SCAN for production-safe iteration (KEYS blocks Redis on large datasets)
        for await (const key of client.scanIterator({ MATCH: fullPattern, COUNT: 100 })) {
            keysToDelete.push(key);
        }

        if (keysToDelete.length > 0) {
            await client.del(keysToDelete);
            console.log(`🧹 Cache cleared: ${keysToDelete.length} keys matching "${pattern}"`);
        }
    } catch (err) {
        console.error('Clear Cache Error:', err.message);
    }
};
