// import express from 'express';
// import {
//   markLessonComplete,
//   updateVideoProgress,
//   getLessonProgress,
//   getEnrollmentProgress,
//   resetLessonProgress
// } from '../controllers/progressController.js';
// import { protect } from '../middleware/auth.js';

// const router = express.Router();

// // All routes require authentication
// router.use(protect);

// // Lesson progress routes
// router.post('/lessons/:lessonId/complete', markLessonComplete);
// router.put('/lessons/:lessonId/video', updateVideoProgress);
// router.get('/lessons/:lessonId', getLessonProgress);
// router.post('/lessons/:lessonId/reset', resetLessonProgress);

// // Enrollment progress routes
// router.get('/enrollments/:enrollmentId', getEnrollmentProgress);

// export default router;


import express from 'express';
import {
  markLessonComplete,
  updateVideoProgress,
  getLessonProgress,
  getEnrollmentProgress,
  resetLessonProgress
} from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Progress
 *   description: Lesson and enrollment progress management
 */

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/progress/lessons/{lessonId}/complete:
 *   post:
 *     summary: Mark a lesson as completed
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson marked as completed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson not found
 */
router.post('/lessons/:lessonId/complete', markLessonComplete);

/**
 * @swagger
 * /api/progress/lessons/{lessonId}/video:
 *   put:
 *     summary: Update lesson video progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               watchedSeconds:
 *                 type: number
 *                 example: 120
 *               duration:
 *                 type: number
 *                 example: 600
 *     responses:
 *       200:
 *         description: Video progress updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.put('/lessons/:lessonId/video', updateVideoProgress);

/**
 * @swagger
 * /api/progress/lessons/{lessonId}:
 *   get:
 *     summary: Get progress for a specific lesson
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson progress retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Progress not found
 */
router.get('/lessons/:lessonId', getLessonProgress);

/**
 * @swagger
 * /api/progress/lessons/{lessonId}/reset:
 *   post:
 *     summary: Reset lesson progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson progress reset
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson not found
 */
router.post('/lessons/:lessonId/reset', resetLessonProgress);

/**
 * @swagger
 * /api/progress/enrollments/{enrollmentId}:
 *   get:
 *     summary: Get enrollment progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment progress retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Enrollment not found
 */
router.get('/enrollments/:enrollmentId', getEnrollmentProgress);

export default router;
