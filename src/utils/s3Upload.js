import multer from 'multer';
import multerS3 from 'multer-s3';
import s3Client from '../config/s3.js';
import dotenv from 'dotenv';
dotenv.config();

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

const s3Storage = multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    acl: 'public-read', // Ensure files are readable
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const folder = req.originalUrl.includes('brochure') ? 'brochures' : 'documents';
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${folder}/${uniqueSuffix}-${safeName}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Block images and videos as per user request for S3
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        return cb(new Error('Images and videos should be uploaded via Cloudinary, not S3.'), false);
    }
    cb(null, true);
};

export const s3Upload = multer({
    storage: s3Storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB for S3
    },
    fileFilter: fileFilter
});
