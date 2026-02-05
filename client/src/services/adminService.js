import api from './api';

const adminService = {
  // Dashboard Stats
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data.data;
  },

  // User Management
  getAllUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/admin/users?${params}`);
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data.data.user;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data.data.user;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  toggleUserStatus: async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/toggle-status`);
    return response.data.data.user;
  },

  // Course Management
  getAllCoursesAdmin: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/admin/courses?${params}`);
    return response.data;
  },

  approveCourse: async (courseId) => {
    const response = await api.patch(`/admin/courses/${courseId}/approve`);
    return response.data.data.course;
  },

  rejectCourse: async (courseId, reason) => {
    const response = await api.patch(`/admin/courses/${courseId}/reject`, { reason });
    return response.data.data.course;
  },

  // Category Management
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data.data.category;
  },

  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/categories/${categoryId}`, categoryData);
    return response.data.data.category;
  },

  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  },

  // Transaction Management
  getAllTransactions: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/admin/transactions?${params}`);
    return response.data;
  },

  refundTransaction: async (transactionId) => {
    const response = await api.post(`/admin/transactions/${transactionId}/refund`);
    return response.data;
  },

  // Enrollment Management
  getAllEnrollments: async (filters = {}) => {
    // Filter out undefined or null values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v != null)
    );
    const params = new URLSearchParams(cleanFilters).toString();
    const response = await api.get(`/admin/enrollments?${params}`);
    return response.data;
  },

  revokeEnrollment: async (enrollmentId) => {
    const response = await api.delete(`/admin/enrollments/${enrollmentId}`);
    return response.data;
  },

  // Review Management
  getAllReviews: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/admin/reviews?${params}`);
    return response.data;
  },

  approveReview: async (reviewId) => {
    const response = await api.patch(`/admin/reviews/${reviewId}/approve`);
    return response.data.data.review;
  },

  deleteReview: async (reviewId) => {
    const response = await api.delete(`/admin/reviews/${reviewId}`);
    return response.data;
  },

  // Coupon Management
  getAllCoupons: async () => {
    const response = await api.get('/admin/coupons');
    return response.data.data.coupons;
  },

  createCoupon: async (couponData) => {
    const response = await api.post('/admin/coupons', couponData);
    return response.data.data.coupon;
  },

  updateCoupon: async (couponId, couponData) => {
    const response = await api.put(`/admin/coupons/${couponId}`, couponData);
    return response.data.data.coupon;
  },

  deleteCoupon: async (couponId) => {
    const response = await api.delete(`/admin/coupons/${couponId}`);
    return response.data;
  },

  // Analytics
  getRevenueAnalytics: async (period = '30d') => {
    const response = await api.get(`/admin/analytics/revenue?period=${period}`);
    return response.data.data;
  },

  getUserAnalytics: async (period = '30d') => {
    const response = await api.get(`/admin/analytics/users?period=${period}`);
    return response.data.data;
  },

  getCourseAnalytics: async (period = '30d') => {
    const response = await api.get(`/admin/analytics/courses?period=${period}`);
    return response.data.data;
  }
};

export default adminService;