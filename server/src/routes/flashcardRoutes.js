import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  generateDeck,
  getDeckByLesson,
  deleteDeck,
  generateFromSummary,
  generateForReview
} from '../controllers/flashcardController.js';

const router = express.Router();

// Routes
router.post('/generate/:lessonId', protect, generateDeck);
router.get('/lesson/:lessonId', protect, getDeckByLesson);
router.delete('/:lessonId', protect, deleteDeck);
router.post('/generate-from-summary/:lessonId', protect, authorize('INSTRUCTOR', 'ADMIN'), generateFromSummary);
router.post('/generate-for-review/:lessonId', protect, generateForReview);

export default router;
