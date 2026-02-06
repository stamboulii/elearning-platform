// import express from 'express';
// import {
//   enrollInCourse,
//   getMyEnrollments,
//   getEnrollmentDetails,
//   checkEnrollment,
//   getCourseEnrollmentStats
// } from '../controllers/enrollmentController.js';
// import { protect, authorize } from '../middleware/auth.js';

// const router = express.Router();

// // All routes require authentication
// router.use(protect);

// // Student routes
// router.post('/', enrollInCourse);
// router.get('/me', getMyEnrollments);
// router.get('/check/:courseId', checkEnrollment);
// router.get('/:id', getEnrollmentDetails);

// // Instructor routes
// router.get(
//   '/course/:courseId/stats',
//   authorize('INSTRUCTOR', 'ADMIN'),
//   getCourseEnrollmentStats
// );

// export default router;

import express from 'express';
import {
  enrollInCourse,
  getMyEnrollments,
  getEnrollmentDetails,
  checkEnrollment,
  getCourseEnrollmentStats,
  getCourseEnrollments
} from '../controllers/enrollmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /enrollments:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully enrolled
 *       400:
 *         description: Already enrolled or course not available
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Course not found
 */
router.post('/', enrollInCourse);

/**
 * @swagger
 * /enrollments/me:
 *   get:
 *     summary: Get user's enrollments
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [IN_PROGRESS, COMPLETED]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Enrollments retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', getMyEnrollments);

/**
 * @swagger
 * /enrollments/check/{courseId}:
 *   get:
 *     summary: Check if enrolled in course
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enrollment status checked
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/check/:courseId', checkEnrollment);

/**
 * @swagger
 * /enrollments/{id}:
 *   get:
 *     summary: Get enrollment details
 *     tags: [Enrollments]
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
 *         description: Enrollment details retrieved
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', getEnrollmentDetails);

/**
 * @swagger
 * /enrollments/course/{courseId}/stats:
 *   get:
 *     summary: Get course enrollment statistics (Instructor only)
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/course/:courseId/stats', authorize('INSTRUCTOR', 'ADMIN'), getCourseEnrollmentStats);

/**
 * @swagger
 * /enrollments/course/{courseId}/students:
 *   get:
 *     summary: Get all students enrolled in a course (Instructor only)
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Students list retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/course/:courseId/students', authorize('INSTRUCTOR', 'ADMIN'), getCourseEnrollments);

export default router;