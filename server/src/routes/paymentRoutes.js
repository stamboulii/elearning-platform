import express from 'express';
import { checkCoursePayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/check/:courseId', protect, checkCoursePayment);

export default router;