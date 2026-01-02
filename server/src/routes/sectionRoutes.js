// import express from 'express';
// import {
//   createSection,
//   getCourseSections,
//   getSection,
//   updateSection,
//   deleteSection,
//   reorderSections
// } from '../controllers/sectionController.js';
// import { protect, authorize } from '../middleware/auth.js';

// // Import nested routes
// import lessonRoutes from '../routes/lessonRoutes.js';

// const router = express.Router({ mergeParams: true });

// // Nested routes
// router.use('/:sectionId/lessons', lessonRoutes);

// // Public routes
// router.get('/', getCourseSections);
// router.get('/:id', getSection);

// // Instructor routes
// router.post('/', protect, authorize('INSTRUCTOR', 'ADMIN'), createSection);
// router.put('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), updateSection);
// router.delete('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), deleteSection);
// router.put('/reorder', protect, authorize('INSTRUCTOR', 'ADMIN'), reorderSections);

// export default router;

import express from 'express';
import {
  createSection,
  getCourseSections,
  getSection,
  updateSection,
  deleteSection,
  reorderSections
} from '../controllers/sectionController.js';
import { protect, authorize } from '../middleware/auth.js';

// Import nested routes
import lessonRoutes from './lessonRoutes.js';

const router = express.Router({ mergeParams: true });

// Nested routes
router.use('/:sectionId/lessons', lessonRoutes);

/**
 * @swagger
 * /courses/{courseId}/sections:
 *   get:
 *     summary: Get all sections for a course
 *     tags: [Sections]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Sections retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     sections:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Section'
 */
router.get('/', getCourseSections);

/**
 * @swagger
 * /sections/{id}:
 *   get:
 *     summary: Get section by ID
 *     tags: [Sections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Section ID
 *     responses:
 *       200:
 *         description: Section retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', getSection);

/**
 * @swagger
 * /courses/{courseId}/sections:
 *   post:
 *     summary: Create a new section (Instructor only)
 *     tags: [Sections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Introduction to React
 *               description:
 *                 type: string
 *                 example: Learn the basics of React
 *               orderNumber:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Section created successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Course not found
 */
router.post('/', protect, authorize('INSTRUCTOR', 'ADMIN'), createSection);

/**
 * @swagger
 * /sections/{id}:
 *   put:
 *     summary: Update section (Instructor only)
 *     tags: [Sections]
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
 *               description:
 *                 type: string
 *               orderNumber:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Section updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), updateSection);

/**
 * @swagger
 * /sections/{id}:
 *   delete:
 *     summary: Delete section (Instructor only)
 *     tags: [Sections]
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
 *         description: Section deleted successfully
 *       400:
 *         description: Cannot delete section with lessons
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), deleteSection);

/**
 * @swagger
 * /courses/{courseId}/sections/reorder:
 *   put:
 *     summary: Reorder sections (Instructor only)
 *     tags: [Sections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
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
 *               sections:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sectionId:
 *                       type: string
 *                     orderNumber:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Sections reordered successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.put('/reorder', protect, authorize('INSTRUCTOR', 'ADMIN'), reorderSections);

export default router;