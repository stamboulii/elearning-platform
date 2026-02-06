import api from './api';

const enrollmentService = {
  // Enroll in course
  enrollInCourse: async (courseId) => {
    const response = await api.post('/enrollments', { courseId });
    return response.data.data.enrollment;
  },

  // Get user's enrollments
  getMyEnrollments: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/enrollments/me?${params}`);
    return response.data;
  },

  // Get enrollment details
  getEnrollmentDetails: async (enrollmentId) => {
    const response = await api.get(`/enrollments/${enrollmentId}`);
    return response.data.data.enrollment;
  },

  // Check if enrolled
  checkEnrollment: async (courseId) => {
    const response = await api.get(`/enrollments/check/${courseId}`);
    return response.data.data;
  },

  // Get course enrollment stats (Instructor only)
  getCourseStats: async (courseId) => {
    const response = await api.get(`/enrollments/course/${courseId}/stats`);
    return response.data.data.stats;
  },

  // Get enrolled students for a course (Instructor only)
  getCourseStudents: async (courseId) => {
    const response = await api.get(`/enrollments/course/${courseId}/students`);
    return response.data.data.enrollments;
  }
};

export default enrollmentService;