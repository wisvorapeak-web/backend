import express from 'express';
import { submitContact, submitAbstract, registerEvent } from '../controllers/submissionController.js';
import { upload } from '../utils/fileUpload.js';

const router = express.Router();

// @route POST /api/submissions/contact
router.post('/contact', submitContact);

// @route POST /api/submissions/abstract
router.post('/abstract', upload.single('file'), submitAbstract);

// @route POST /api/submissions/register
router.post('/register', registerEvent);

export default router;
