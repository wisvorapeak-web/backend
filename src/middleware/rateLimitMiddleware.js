import rateLimit from 'express-rate-limit';

/**
 * General API Rate Limiter
 * 500 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 500, 
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, 
  legacyHeaders: false, 
  skip: (req) => {
    return req.path === '/health' || process.env.NODE_ENV === 'development';
  }
});

/**
 * Authentication Rate Limiter
 * 50 requests per 15 minutes per IP for login/register
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 50, 
  message: 'Too many login/register attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, 
  skip: () => process.env.NODE_ENV === 'development',
  keyGenerator: (req) => {
    return req.body.email || req.ip;
  }
});

/**
 * Password Reset Rate Limiter
 * 10 requests per hour per IP
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 10,
  message: 'Too many password reset attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development',
  keyGenerator: (req) => {
    return req.body.email || req.ip;
  }
});

/**
 * Upload Rate Limiter
 * 50 uploads per 30 minutes per IP
 */
export const uploadLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, 
  max: 50,
  message: 'Upload rate limit exceeded, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development'
});
