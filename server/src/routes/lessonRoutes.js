

import express from 'express';
import {
  createLesson,
  getSectionLessons,
  getLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  getLessonWithProgress,
  setLessonSkills,
  getLessonSkills
} from '../controllers/lessonController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /lessons/{id}:
 *   get:
 *     summary: Get lesson by ID
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     lesson:
 *                       $ref: '#/components/schemas/Lesson'
 *       403:
 *         description: Not authorized to view this lesson
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', getLesson);

/**
 * @swagger
 * /lessons/{id}/progress:
 *   get:
 *     summary: Get lesson with progress (Student only)
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson with progress retrieved
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id/progress', protect, getLessonWithProgress);

/**
 * @swagger
 * /lessons/{id}/skills:
 *   put:
 *     summary: Set lesson skills (Instructor/Admin only)
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             required:
 *               - skillIds
 *             properties:
 *               skillIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Lesson skills updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.put('/:id/skills', protect, authorize('INSTRUCTOR', 'ADMIN'), setLessonSkills);
router.get('/:id/skills', protect, getLessonSkills);

router.post('/', protect, authorize('INSTRUCTOR', 'ADMIN'), createLesson);

/**
 * @swagger
 * /courses/{courseId}/sections/{sectionId}/lessons:
 *   get:
 *     summary: Get all lessons for a section
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lessons retrieved successfully
 */
router.get('/', getSectionLessons);

/**
 * @swagger
 * /lessons/{id}:
 *   put:
 *     summary: Update lesson (Instructor only)
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               contentType:
 *                 type: string
 *               contentUrl:
 *                 type: string
 *               content:
 *                 type: string
 *               duration:
 *                 type: integer
 *               orderNumber:
 *                 type: integer
 *               isPreview:
 *                 type: boolean
 *               resources:
 *                 type: array
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.put('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), updateLesson);

/**
 * @swagger
 * /lessons/{id}:
 *   delete:
 *     summary: Delete lesson (Instructor only)
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.delete('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), deleteLesson);

/**
 * @swagger
 * /courses/{courseId}/sections/{sectionId}/lessons/reorder:
 *   put:
 *     summary: Reorder lessons (Instructor only)
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lessons:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     lessonId:
 *                       type: string
 *                     orderNumber:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Lessons reordered successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.put('/reorder', protect, authorize('INSTRUCTOR', 'ADMIN'), reorderLessons);

export default router;