import api from './api';

const progressService = {
  // Mark lesson as complete
  markLessonComplete: async (lessonId) => {
    const response = await api.post(`/progress/lessons/${lessonId}/complete`);
    return response.data.data.progress;
  },

  // Update video progress (for resume functionality)
  updateVideoProgress: async (lessonId, data) => {
    const response = await api.put(`/progress/lessons/${lessonId}/video`, data);
    return response.data.data.progress;
  },

  // Get lesson progress
  getLessonProgress: async (lessonId) => {
    const response = await api.get(`/progress/lessons/${lessonId}`);
    return response.data.data.progress;
  },

  // Get enrollment progress
  getEnrollmentProgress: async (enrollmentId) => {
    const response = await api.get(`/progress/enrollments/${enrollmentId}`);
    return response.data.data.progress;
  },

  // Reset lesson progress
  resetLessonProgress: async (lessonId) => {
    const response = await api.post(`/progress/lessons/${lessonId}/reset`);
    return response.data.data.progress;
  }
};

export default progressService;

