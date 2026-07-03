import api from './api';

const reviewService = {
  getStats: () => api.get('/reviews/stats'),
  getDueReviews: () => api.get('/reviews/due'),
  getSessionReviews: (enrollmentId) => api.get(`/reviews/session/${enrollmentId}`),
  submitReview: (lessonId, quality) =>
    api.post(`/reviews/lessons/${lessonId}/submit`, { quality }),
  generateFlashcardsForReview: (lessonId) =>
    api.post(`/flashcards/generate-for-review/${lessonId}`),
};

export default reviewService;