import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

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

     // Find user in Supabase (using id from JWT)
     const { data: user, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, status')
        .eq('id', decoded.id)
        .single();

     if (error || !user) {
        return res.status(401).json({ error: 'User record not found in system.' });
     }

     if (user.status !== 'Active') {
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

export const adminMiddleware = (req, res, next) => {
  const adminRoles = ['admin', 'super admin', 'reviewer'];
  const userRole = req.user?.role?.toLowerCase();
  
  if (req.user && adminRoles.includes(userRole)) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
};
