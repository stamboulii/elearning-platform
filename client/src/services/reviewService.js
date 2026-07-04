import api from './api';

const reviewService = {
  getStats: () => api.get('/reviews/stats'),
  getDueReviews: () => api.get('/reviews/due'),
  getSessionReviews: (enrollmentId) => api.get(`/reviews/session/${enrollmentId}`),
  submitLessonReview: (lessonId, quality) =>
    api.post(`/reviews/lessons/${lessonId}/submit`, { quality }),
  generateFlashcardsForReview: (lessonId) =>
    api.post(`/flashcards/generate-for-review/${lessonId}`),
  submitCourseReview: async (courseId, { rating, reviewText }) => {
    const response = await api.post(`/reviews/${courseId}`, { rating, reviewText });
    return response.data.data.review;
  },

  checkEligibility: async (courseId) => {
    const response = await api.get(`/reviews/${courseId}/eligibility`);
    return response.data.data;
  },

  deleteReview: async (courseId) => {
    const response = await api.delete(`/reviews/${courseId}`);
    return response.data;
  }
};

export default reviewService;