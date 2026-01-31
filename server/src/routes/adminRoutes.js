import express from 'express';
import adminController from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics (Admin only)
 *     tags: [Admin - Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/dashboard/stats',
  protect,
  authorize('ADMIN'),
  adminController.getDashboardStats
);

/**
 * @swagger
 * /admin/courses:
 *   get:
 *     summary: Get all courses (Admin only)
 *     tags: [Admin - Courses]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/courses',
  protect,
  authorize('ADMIN'),
  adminController.getAllCourses
);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/users',
  protect,
  authorize('ADMIN'),
  adminController.getAllUsers
);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/users/:id',
  protect,
  authorize('ADMIN'),
  adminController.getUserById
);

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Update user (Admin only)
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/users/:id',
  protect,
  authorize('ADMIN'),
  adminController.updateUser
);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/users/:id',
  protect,
  authorize('ADMIN'),
  adminController.deleteUser
);

/**
 * @swagger
 * /admin/users/{id}/toggle-status:
 *   patch:
 *     summary: Toggle user active status (Admin only)
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/users/:id/toggle-status',
  protect,
  authorize('ADMIN'),
  adminController.toggleUserStatus
);

/**
 * @swagger
 * /admin/courses/{id}/approve:
 *   patch:
 *     summary: Approve a course (Admin only)
 *     tags: [Admin - Courses]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/courses/:id/approve',
  protect,
  authorize('ADMIN'),
  adminController.approveCourse
);

/**
 * @swagger
 * /admin/courses/{id}/reject:
 *   patch:
 *     summary: Reject a course (Admin only)
 *     tags: [Admin - Courses]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/courses/:id/reject',
  protect,
  authorize('ADMIN'),
  adminController.rejectCourse
);

export default router;
