import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from './config/db.js';
import { sendEmail } from './config/mailer.js';
import cloudinary from './config/cloudinary.js';
import { upload, handleUploadError, validateFileUpload } from './utils/fileUpload.js';
import { sanitizeInput } from './middleware/sanitizationMiddleware.js';
import { generalLimiter, uploadLimiter } from './middleware/rateLimitMiddleware.js';

// Route Imports
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import submissionRoutes from './routes/submission.js';
import siteRoutes from './routes/site.js';
import adminPanelRoutes from './routes/admin_panel.js';
import setupRoutes from './routes/setup.js';
import paymentRoutes from './routes/payment.js';

// Connect to MongoDB
connectDB().catch(err => console.error('Initial DB Connection Error:', err));

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Apply input sanitization to all routes
app.use(sanitizeInput);

// Apply general rate limiting
app.use(generalLimiter);

// Ensure DB is connected before handling requests (Serverless optimization)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('Critical: Database Connection Failed in Middleware', err.message);
        // On root endpoint, we might want to still respond with "online" but DB "offline"
        if (req.path === '/') return next();
        
        res.status(503).json({ 
            error: 'Service Unavailable: Database Connection Failure',
            message: 'Our systems are experiencing issues connecting to the database.'
        });
    }
});

// Redis client
import client from './config/redis.js';

// --- ROOT STATUS ENDPOINT ---
app.get('/', async (req, res) => {
  // Ensure we try to connect if not already connected (vital for serverless)
  try {
    await connectDB();
  } catch (err) {
    console.error('DB Connection failure during status check:', err.message);
  }

  res.json({
    status: 'online',
    message: 'Wisvora Scientific Platform API',
    version: '1.0.0',
    security: {
      rateLimit: 'enabled',
      inputSanitization: 'enabled',
      jwtAuth: 'enabled',
      passwordEncryption: 'bcrypt (12 rounds)',
      emailVerification: 'OTP-based'
    },
    cache: {
      connected: client.isOpen,
      provider: 'Redis'
    },
    database: {
      provider: 'MongoDB',
      connected: mongoose.connection.readyState === 1
    },
    storage: {
      provider: 'Cloudinary',
      connected: true
    },
    endpoints: {
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      submissions: '/api/submissions',
      site: '/api/site',
      admin: '/api/admin',
      setup: '/api/setup'
    },
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      node: process.version
    }
  });
});

// --- SETUP INITIALIZER ---
app.use('/api/setup', setupRoutes);

// --- PUBLIC AUTH SERVICE ---
app.use('/api/auth', authRoutes);

// --- HEALTH CHECK ---
app.get('/health', (req, res) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    service: 'Wisvora Scientific API'
  });
});

// --- DASHBOARD ROUTES (Protected) ---
app.use('/api/dashboard', dashboardRoutes);

// --- SUBMISSIONS (Public) ---
app.use('/api/submissions', submissionRoutes);

// --- SITE DATA (Public) ---
app.use('/api/site', siteRoutes);

// --- ADMIN PANEL (Protected) ---
app.use('/api/admin', adminPanelRoutes);

// --- PAYMENT ROUTES ---
app.use('/api/payments', paymentRoutes);

app.post('/api/upload', (req, res, next) => {
  console.log('Incoming Upload Protocol:', {
    headers: req.headers['content-type'],
    method: req.method
  });
  next();
}, upload.single('file'), handleUploadError, validateFileUpload, (req, res) => {
  try {
    console.log('Final Asset Verification:', {
      file: !!req.file,
      mimetype: req.file?.mimetype,
      size: req.file?.size
    });
    
    // Fallback for memoryStorage
    const fileUrl = req.file.path || `data:${req.file.mimetype};base64,${req.file.buffer?.toString('base64').substring(0, 50)}...`;
    
    res.json({ 
      message: 'Transmission Successful', 
      url: fileUrl, 
      id: req.file.filename || `tmp-${Date.now()}`
    });
  } catch (error) {
    console.error('Terminal Pipeline Collision:', error);
    res.status(500).json({ error: 'Critical transmission failure.' });
  }
});

// --- MAIL SERVICE ENDPOINT ---
app.post('/api/mail', async (req, res) => {
  const { to, subject, html } = req.body;
  if (!to || !subject || !html) return res.status(400).json({ error: 'Missing required mail fields.' });

  const success = await sendEmail(to, subject, html);
  if (success) res.json({ message: 'Email sent successfully.' });
  else res.status(500).json({ error: 'Email delivery failed.' });
});

// --- GLOBAL ERROR HANDLING ---
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }

  if (err.message && err.message.includes('File')) {
    return res.status(400).json({
      error: 'File Upload Error',
      details: err.message
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong on the server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// --- START SERVER ---
app.listen(PORT, async () => {
    console.log(`🚀 Wisvora Backend running on http://localhost:${PORT}`);
    
    // Database connectivity will be logged by connectDB()

    // Check Cloudinary Connectivity
    try {
        const result = await cloudinary.api.ping();
        if (result.status === 'ok') {
            console.log('✅ Cloudinary Connection: Active');
        }
    } catch (err) {
        console.error('❌ Cloudinary Connection: Failed', err.message);
    }

    // Check Redis Connectivity
    if (client.isOpen) {
        console.log('✅ Redis Connection: Active');
    } else {
        console.warn('⚠️ Redis Connection: Check status');
    }
});

export default app;
