import api from './api';

const sectionService = {
  // Get course sections
  getCourseSections: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/sections`);
    return response.data.data.sections;
  },

  // Create section
  createSection: async (courseId, sectionData) => {
    const response = await api.post(`/courses/${courseId}/sections`, sectionData);
    return response.data.data.section;
  },

  // Update section
  updateSection: async (sectionId, sectionData) => {
    const response = await api.put(`/sections/${sectionId}`, sectionData);
    return response.data.data.section;
  },

  // Delete section
  deleteSection: async (sectionId) => {
    const response = await api.delete(`/sections/${sectionId}`);
    return response.data;
  },

  // Reorder sections
  reorderSections: async (courseId, sections) => {
    const response = await api.put(`/courses/${courseId}/sections/reorder`, { sections });
    return response.data.data.sections;
  }
};

export default sectionService;