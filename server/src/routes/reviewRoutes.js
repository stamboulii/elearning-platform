import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getMyDueReviews,
  getMyReviewStats,
  getSessionReviews,
  submitLessonReview
} from '../controllers/reviewController.js';

const router = express.Router();

router.get('/due', protect, getMyDueReviews);
router.get('/stats', protect, getMyReviewStats);
router.get('/session/:enrollmentId', protect, getSessionReviews);
router.post('/lessons/:lessonId/submit', protect, submitLessonReview);

export default router;