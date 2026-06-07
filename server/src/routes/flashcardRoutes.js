import express from 'express';
import { generateDeck, getDeckByLesson, deleteDeck } from '../controllers/flashcardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Routes
router.post('/generate/:lessonId', protect, generateDeck);
router.get('/lesson/:lessonId', protect, getDeckByLesson);
router.delete('/:lessonId', protect, deleteDeck);

export default router;
