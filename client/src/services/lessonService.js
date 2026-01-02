import api from './api';

const lessonService = {
  // Get section lessons
  getSectionLessons: async (courseId, sectionId) => {
    const response = await api.get(`/courses/${courseId}/sections/${sectionId}/lessons`);
    return response.data.data.lessons;
  },

  // Create lesson
  createLesson: async (courseId, sectionId, lessonData) => {
    const response = await api.post(`/courses/${courseId}/sections/${sectionId}/lessons`, lessonData);
    return response.data.data.lesson;
  },

  // Update lesson
  updateLesson: async (lessonId, lessonData) => {
    const response = await api.put(`/lessons/${lessonId}`, lessonData);
    return response.data.data.lesson;
  },

  // Delete lesson
  deleteLesson: async (lessonId) => {
    const response = await api.delete(`/lessons/${lessonId}`);
    return response.data;
  },

  // Upload lesson video
  uploadLessonVideo: async (lessonId, file, onProgress) => {
    const formData = new FormData();
    formData.append('video', file);
    
    const response = await api.post(`/upload/lesson/${lessonId}/video`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percentCompleted);
      }
    });
    return response.data;
  },

  // Upload lesson resources
  uploadLessonResources: async (lessonId, files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('resources', file);
    });
    
    const response = await api.post(`/upload/lesson/${lessonId}/resources`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export default lessonService;