import api from './api';

const analyticsService = {
  // Get instructor courses with detailed analytics
  getCoursesWithAnalytics: async () => {
    const response = await api.get('/instructor-analytics/courses/instructor-analytics');
    return response.data;
  },

  // Get revenue analytics
  getRevenueAnalytics: async () => {
    const response = await api.get('/instructor-analytics/revenue');
    return response.data;
  },

  // Get enrollment statistics by course
  getEnrollmentStatistics: async () => {
    const response = await api.get('/instructor-analytics/enrollments');
    return response.data;
  },

  // Get pending payments
  getPendingPayments: async () => {
    const response = await api.get('/instructor-analytics/pending-payments');
    return response.data;
  },

  // Get top performing courses
  getTopPerformingCourses: async (limit = 5) => {
    const response = await api.get(`/instructor-analytics/top-courses?limit=${limit}`);
    return response.data;
  }
};

export default analyticsService;