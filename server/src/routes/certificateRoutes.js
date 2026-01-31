import express from 'express';
import * as certificateController from '../controllers/certificateController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route for verification
router.get('/:id', certificateController.getCertificate);

// Protected routes
router.get('/enrollment/:enrollmentId', protect, certificateController.getMyCertificate);

export default router;
