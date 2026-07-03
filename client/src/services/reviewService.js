import api from './api';

const reviewService = {
  submitReview: async (courseId, { rating, reviewText }) => {
    const response = await api.post(`/reviews/${courseId}`, { rating, reviewText });
    return response.data.data.review;
  },

  checkEligibility: async (courseId) => {
    const response = await api.get(`/reviews/${courseId}/eligibility`);
    return response.data.data; // { eligible, alreadyReviewed, existingReview }
  },

  deleteReview: async (courseId) => {
    const response = await api.delete(`/reviews/${courseId}`);
    return response.data;
  }
};

export default reviewService;