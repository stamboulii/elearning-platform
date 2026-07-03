import express from 'express';
import {submitReview, checkEligibility, deleteReview} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';


const router = express.Router();

router.post('/:courseId', protect, submitReview);
router.get('/:courseId/eligibility', protect, checkEligibility);
router.delete('/:courseId', protect, deleteReview);

export default router;