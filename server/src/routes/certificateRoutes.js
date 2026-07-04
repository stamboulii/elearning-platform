import express from 'express';
import * as certificateController from '../controllers/certificateController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/enrollment/:enrollmentId', protect, certificateController.getCertificateByEnrollment);
router.get('/my', protect, certificateController.getMyCertificate);
router.get('/my/list', protect, certificateController.getMyCertificates);

router.get('/:id', protect, certificateController.getCertificate);

export default router;
