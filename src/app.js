import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { supabase } from './config/supabase.js';
import { sendEmail } from './config/mailer.js';
import cloudinary from './config/cloudinary.js';
import { upload } from './utils/fileUpload.js';

// Route Imports
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import submissionRoutes from './routes/submission.js';
import siteRoutes from './routes/site.js';
import adminPanelRoutes from './routes/admin_panel.js';
import setupRoutes from './routes/setup.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Allow frontend origin
    credentials: true // Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser());

// --- ROUTES ---

import client from './config/redis.js';

// Root Status
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Wisvora Scientific Platform API',
    version: '1.0.0',
    cache: {
      connected: client.isOpen,
      provider: 'Redis'
    },
    database: {
      provider: 'Supabase',
      connected: true // Assumed if we reached here without crash or we can check
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

// Setup Initializer
app.use('/api/setup', setupRoutes);

// Public Auth Service
app.use('/api/auth', authRoutes);

// Public Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    service: 'Wisvora Scientific API'
  });
});

// Mounted Dashboard Routes (Internally Protected)
app.use('/api/dashboard', dashboardRoutes);

// Public Submissions (Abstracts, Contacts, Registrations)
app.use('/api/submissions', submissionRoutes);

// Public Site Data (Speakers, Schedule, Settings)
app.use('/api/site', siteRoutes);

// Admin Protected Panel
app.use('/api/admin', adminPanelRoutes);

// Image Upload Endpoint (Publicly accessible but could be protected)
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    res.json({ message: 'Upload successful', url: req.file.path, id: req.file.filename });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Upload failed.' });
  }
});

// Mail Service Endpoint
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
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong on the server',
  });
});

// Start the server
app.listen(PORT, async () => {
    console.log(`🚀 Wisvora Backend running on http://localhost:${PORT}`);
    
    // Check Supabase Connectivity
    try {
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        if (error) throw error;
        console.log('✅ Supabase Connection: Active');
    } catch (err) {
        console.error('❌ Supabase Connection: Failed', err.message);
    }

    // Check Cloudinary Connectivity
    try {
        const result = await cloudinary.api.ping();
        if (result.status === 'ok') {
            console.log('✅ Cloudinary Connection: Active');
        }
    } catch (err) {
        console.error('❌ Cloudinary Connection: Failed', err.message);
    }
});

export default app;
