import express from 'express';
import { protect } from '../middleware/auth.js';
const router = express.Router();
import {
  getInstructorCoursesWithAnalytics,
  getRevenueAnalytics,
  getEnrollmentStatistics,
  getPendingPayments,
  getTopPerformingCourses,
} from '../controllers/Instructoranalyticscontroller.js';


// Get instructor courses with detailed enrollment data
router.get('/courses/analytics', protect, getInstructorCoursesWithAnalytics);

// Get revenue analytics
router.get('/revenue', protect, getRevenueAnalytics);

// Get enrollment statistics by course
router.get('/enrollments', protect, getEnrollmentStatistics);

// Get pending payments
router.get('/pending-payments', protect, getPendingPayments);

// Get top performing courses
router.get('/top-courses', protect, getTopPerformingCourses);

export default router;