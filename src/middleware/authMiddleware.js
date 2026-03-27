import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to verify local JWT token.
 * Extracts user from the Authorization header or token cookie.
 */
export const authMiddleware = async (req, res, next) => {
  try {
     const authHeader = req.headers.authorization;
     let token = null;

     // 1. Try Extracting from Authorization header (Bearer X)
     if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1];
     }
     
     // 2. Fallback to token cookie (Session based)
     if (!token && req.cookies && req.cookies.token) {
        token = req.cookies.token;
     }

     if (!token) {
        return res.status(401).json({ error: 'Authentication required. No session found.' });
     }

     // Verify JWT
     const decoded = jwt.verify(token, process.env.JWT_SECRET);
     
     if (!decoded || !decoded.id) {
        return res.status(401).json({ error: 'Invalid or malformed session token.' });
     }

     // Find user in MongoDB (using id from JWT)
     const user = await User.findById(decoded.id).select('-password');

     if (!user) {
        return res.status(401).json({ error: 'User record not found in system.' });
     }

     if (!user.isActive) {
        return res.status(403).json({ error: 'Your account is currently suspended or inactive.' });
     }

     // Attach user to the request
     req.user = user;
     next();

  } catch (err) {
     console.error('Auth Middleware Error:', err);
     
     if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
     }
     
     res.status(500).json({ error: 'System error during authentication.' });
  }
};

/**
 * Middleware to verify admin/reviewer role.
 * Must be used AFTER authMiddleware to have req.user populated.
 */
export const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const allowedRoles = ['admin', 'sub-admin', 'judge'];
    if (!allowedRoles.includes(req.user.role?.toLowerCase())) {
      return res.status(403).json({ 
        error: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}` 
      });
    }

    next();
  } catch (err) {
    console.error('Admin Middleware Error:', err);
    res.status(500).json({ error: 'System error during authorization.' });
  }
};

/**
 * Middleware to verify super admin role.
 * More restrictive than adminMiddleware.
 */
export const superAdminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (req.user.role?.toLowerCase() !== 'admin' && req.user.role?.toLowerCase() !== 'sub-admin') {
      return res.status(403).json({ 
        error: 'Access denied. Admin privileges required.' 
      });
    }

    next();
  } catch (err) {
    console.error('Super Admin Middleware Error:', err);
    res.status(500).json({ error: 'System error during authorization.' });
  }
};
