import express from 'express';
import { submitContact, submitAbstract, registerEvent, submitBrochureRequest } from '../controllers/submissionController.js';
import { upload, handleUploadError, validateFileUpload } from '../utils/fileUpload.js';

const router = express.Router();

// @route POST /api/submissions/contact
router.post('/contact', submitContact);

// @route POST /api/submissions/abstract
// File upload with validation
router.post('/abstract', 
  upload.single('file'),
  handleUploadError,
  validateFileUpload,
  submitAbstract
);

// @route POST /api/submissions/register
router.post('/register', registerEvent);

// @route POST /api/submissions/brochure
router.post('/brochure', submitBrochureRequest);

export default router;
