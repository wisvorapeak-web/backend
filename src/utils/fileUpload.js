import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Define allowed file types and max size
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILE_SIZE_READABLE = '10MB';

// Custom file filter for validation
const fileFilter = (req, file, cb) => {
  // Check content type
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`));
  }

  // Check filename extension
  const ext = file.originalname.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`));
  }

  // File name length validation
  if (file.originalname.length > 100) {
    return cb(new Error('File name is too long (max 100 characters)'));
  }

  cb(null, true);
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // Determine folder based on file type
    let folder = 'wisvora_scientific/general';
    if (file.mimetype.startsWith('image/')) {
      folder = 'wisvora_scientific/images';
    } else if (file.mimetype === 'application/pdf') {
      folder = 'wisvora_scientific/abstracts';
    }

    return {
      folder: folder,
      allowed_formats: ALLOWED_EXTENSIONS,
      resource_type: 'auto',
      public_id: (req, file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        return `${file.fieldname}-${uniqueSuffix}-${safeName.split('.')[0]}`;
      }
    };
  },
});

/**
 * File upload middleware with validation
 * Usage: upload.single('fieldName') or upload.array('fieldName', limit)
 */
// FOR DEBUGGING ONLY: Switch to memory storage to isolate Cloudinary issues
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: fileFilter
});

/**
 * Middleware to handle upload errors gracefully
 */
export const handleUploadError = (err, req, res, next) => {
  console.error('CRITICAL Multer Failure:', {
    err: err.message,
    code: err.code,
    field: err.field,
    contentType: req.headers['content-type']
  });
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(413).json({ 
        error: `File too large. Maximum size: ${MAX_FILE_SIZE_READABLE}` 
      });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message || 'File upload failed.' });
  }
  next();
};

export const validateFileUpload = (req, res, next) => {
  console.log('Validating File Object:', {
    present: !!req.file,
    originalName: req.file?.originalname,
    fieldname: req.file?.fieldname
  });
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  // Additional validation: only if not memoryStorage but we check path presence if expected
  // Skip path check for memoryStorage
  if (req.file.buffer || req.file.path) {
    return next();
  }

  return res.status(500).json({ error: 'File transmission failed cloud storage verification.' });
};
