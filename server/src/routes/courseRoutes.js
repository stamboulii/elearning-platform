// import express from 'express';
// import {
//   createCourse,
//   getCourses,
//   getCourse,
//   updateCourse,
//   deleteCourse,
//   getInstructorCourses,
//   addCourseRequirement,
//   addCourseOutcome
// } from '../controllers/courseController.js';
// import { protect, authorize } from '../middleware/auth.js';

// // Import nested routes
// import sectionRoutes from './sectionRoutes.js';

// const router = express.Router();

// // Nested routes
// router.use('/:courseId/sections', sectionRoutes);

// // Public routes
// router.get('/', getCourses);
// router.get('/:id', getCourse);

// // Instructor routes
// router.get('/instructor/me', protect, authorize('INSTRUCTOR', 'ADMIN'), getInstructorCourses);
// router.post('/', protect, authorize('INSTRUCTOR', 'ADMIN'), createCourse);
// router.put('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), updateCourse);
// router.delete('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), deleteCourse);
// router.post('/:id/requirements', protect, authorize('INSTRUCTOR', 'ADMIN'), addCourseRequirement);
// router.post('/:id/outcomes', protect, authorize('INSTRUCTOR', 'ADMIN'), addCourseOutcome);

// export default router;

import express from 'express';
import {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getInstructorCourses,
  addCourseRequirement,
  addCourseOutcome
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/auth.js';
import sectionRoutes from './sectionRoutes.js';

const router = express.Router();

router.use('/:courseId/sections', sectionRoutes);

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [BEGINNER, INTERMEDIATE, ADVANCED, ALL_LEVELS]
 *         description: Filter by course level
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *           default: PUBLISHED
 *         description: Filter by course status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Course'
 */
router.get('/', getCourses);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course retrieved successfully
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
 *                     course:
 *                       $ref: '#/components/schemas/Course'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', getCourse);

/**
 * @swagger
 * /courses/instructor/me:
 *   get:
 *     summary: Get instructor's courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/instructor/me', protect, authorize('INSTRUCTOR', 'ADMIN'), getInstructorCourses);

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - title
 *               - slug
 *               - shortDescription
 *               - price
 *             properties:
 *               categoryId:
 *                 type: string
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               shortDescription:
 *                 type: string
 *               fullDescription:
 *                 type: string
 *               price:
 *                 type: number
 *               discountPrice:
 *                 type: number
 *               level:
 *                 type: string
 *                 enum: [BEGINNER, INTERMEDIATE, ADVANCED, ALL_LEVELS]
 *               language:
 *                 type: string
 *               estimatedDuration:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/', protect, authorize('INSTRUCTOR', 'ADMIN'), createCourse);

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Update course
 *     tags: [Courses]
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
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), updateCourse);

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete course
 *     tags: [Courses]
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
 *         description: Course deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), deleteCourse);

/**
 * @swagger
 * /courses/{id}/requirements:
 *   post:
 *     summary: Add course requirement
 *     tags: [Courses]
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
 *               requirement:
 *                 type: string
 *     responses:
 *       201:
 *         description: Requirement added successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/:id/requirements', protect, authorize('INSTRUCTOR', 'ADMIN'), addCourseRequirement);

/**
 * @swagger
 * /courses/{id}/outcomes:
 *   post:
 *     summary: Add course outcome
 *     tags: [Courses]
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
 *               outcome:
 *                 type: string
 *     responses:
 *       201:
 *         description: Outcome added successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/:id/outcomes', protect, authorize('INSTRUCTOR', 'ADMIN'), addCourseOutcome);

export default router;