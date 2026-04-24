import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Define allowed file types and max size
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'pdf'];
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB
const MAX_FILE_SIZE_READABLE = '30MB';

// Custom file filter for validation
const fileFilter = (req, file, cb) => {
  const ext = file.originalname.split('.').pop()?.toLowerCase();
  
  console.log('File Upload Filter Triggered:', {
    mimetype: file.mimetype,
    originalname: file.originalname,
    extension: ext
  });

  // Check content type
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    console.error('File Upload Type Rejection:', { fileType: file.mimetype, allowed: ALLOWED_TYPES });
    return cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`));
  }

  // Check filename extension
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    console.error('File Upload Extension Rejection:', { ext, allowed: ALLOWED_EXTENSIONS });
    return cb(new Error(`Invalid file extension (.${ext}). Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`));
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
    // Determine folder based on file type or context
    let folder = 'wisvora_scientific/general';
    
    // Check if the request is specifically for brochures
    if (req.originalUrl && (req.originalUrl.includes('brochure') || req.originalUrl.includes('brocher'))) {
      folder = 'brochures';
    } else if (file.mimetype.startsWith('image/')) {
      folder = 'wisvora_scientific/images';
    } else if (file.mimetype === 'application/pdf') {
      folder = 'wisvora_scientific/abstracts';
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const publicId = `${file.fieldname}-${uniqueSuffix}-${safeName.split('.')[0]}`;

    return {
      folder: folder,
      allowed_formats: ALLOWED_EXTENSIONS,
      resource_type: 'auto',
      public_id: publicId
    };
  },
});

/**
 * File upload middleware with validation
 * Usage: upload.single('fieldName') or upload.array('fieldName', limit)
 */
export const upload = multer({
  storage: storage,
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
    return res.status(400).json({ error: `Upload error (${err.code}): ${err.message}` });
  } else if (err) {
    // Check if it's a Cloudinary specific error
    const errorMessage = err.message || 'File upload failed.';
    return res.status(400).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
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
    console.error('Validation Failure: req.file is missing after Multer middleware');
    return res.status(400).json({ error: 'No file uploaded or file rejected by server configurations.' });
  }

  // Additional validation: only if not memoryStorage but we check path presence if expected
  // Skip path check for memoryStorage
  if (req.file.buffer || req.file.path) {
    return next();
  }

  return res.status(500).json({ error: 'File transmission failed cloud storage verification.' });
};
