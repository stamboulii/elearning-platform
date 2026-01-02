import api from './api';

const courseService = {
  // Get all courses (public)
  getAllCourses: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/courses?${params}`);
    return response.data;
  },

  // Get single course
  getCourse: async (courseId) => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data.data.course;
  },

  // Get instructor's courses
  getInstructorCourses: async () => {
    const response = await api.get('/courses/instructor/me');
    return response.data.data.courses;
  },

  // Create course
  createCourse: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data.data.course;
  },

  // Update course
  updateCourse: async (courseId, courseData) => {
    const response = await api.put(`/courses/${courseId}`, courseData);
    return response.data.data.course;
  },

  // Delete course
  deleteCourse: async (courseId) => {
    const response = await api.delete(`/courses/${courseId}`);
    return response.data;
  },

  // Add requirement
  addRequirement: async (courseId, requirement) => {
    const response = await api.post(`/courses/${courseId}/requirements`, { requirement });
    return response.data.data.requirement;
  },

  // Add outcome
  addOutcome: async (courseId, outcome) => {
    const response = await api.post(`/courses/${courseId}/outcomes`, { outcome });
    return response.data.data.outcome;
  },

  // Upload thumbnail
  uploadThumbnail: async (courseId, file) => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    const response = await api.post(`/upload/course/${courseId}/thumbnail`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Upload preview video
  uploadPreviewVideo: async (courseId, file) => {
    const formData = new FormData();
    formData.append('video', file);
    const response = await api.post(`/upload/course/${courseId}/preview-video`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export default courseService;