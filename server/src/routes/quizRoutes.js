import express from 'express';
import { generateQuizForLesson, getQuizByLesson, submitQuizAttempt, createQuizManual } from '../controllers/quizController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate/:lessonId', protect, generateQuizForLesson);
router.post('/manual/:lessonId', protect, createQuizManual);
router.get('/lesson/:lessonId', protect, getQuizByLesson);
router.post('/:quizId/attempt', protect, submitQuizAttempt);

export default router;