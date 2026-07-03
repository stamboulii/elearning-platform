import api from './api';

const skillService = {
  list: async (category) => {
    const response = await api.get('/skills', { params: category ? { category } : {} });
    return response.data.data.skills;
  },

  get: async (id) => {
    const response = await api.get(`/skills/${id}`);
    return response.data.data.skill;
  },

  create: async (data) => {
    const response = await api.post('/skills', data);
    return response.data.data.skill;
  },

  update: async (id, data) => {
    const response = await api.put(`/skills/${id}`, data);
    return response.data.data.skill;
  },

  delete: async (id, force = false) => {
    const response = await api.delete(`/skills/${id}`, { params: force ? { force: 'true' } : {} });
    return response.data;
  },

  createPrerequisite: async (skillId, prerequisiteId) => {
    const response = await api.post('/skill-prerequisites', { skillId, prerequisiteId });
    return response.data.data.prerequisite;
  },

  deletePrerequisite: async (id) => {
    const response = await api.delete(`/skill-prerequisites/${id}`);
    return response.data;
  },

  listCareerPaths: async () => {
    const response = await api.get('/career-paths');
    return response.data.data.careerPaths;
  },

  getCareerPath: async (id) => {
    const response = await api.get(`/career-paths/${id}`);
    return response.data.data.careerPath;
  },

  createCareerPath: async (data) => {
    const response = await api.post('/career-paths', data);
    return response.data.data.careerPath;
  },

  addSkillToCareerPath: async (careerPathId, skillId, orderNumber, isMandatory = true) => {
    const response = await api.post(`/career-paths/${careerPathId}/skills`, { skillId, orderNumber, isMandatory });
    return response.data.data.entry;
  },

  updateCareerPath: async (id, data) => {
    const response = await api.put(`/career-paths/${id}`, data);
    return response.data.data.careerPath;
  },

  deleteCareerPath: async (id) => {
    const response = await api.delete(`/career-paths/${id}`);
    return response.data;
  },

  removeSkillFromCareerPath: async (careerPathId, skillId) => {
    const response = await api.delete(`/career-paths/${careerPathId}/skills/${skillId}`);
    return response.data;
  },

  reorderCareerPathSkills: async (careerPathId, skillIds) => {
    const response = await api.put(`/career-paths/${careerPathId}/skills/reorder`, { skillIds });
    return response.data.data.skills;
  },

  getMyProgress: async (careerPathId) => {
    const response = await api.get(`/career-paths/${careerPathId}/my-progress`);
    return response.data.data.progress;
  },

  getMySkills: async () => {
    const response = await api.get('/auth/me/skills');
    return response.data.data.skills;
  },

  setLessonSkills: async (lessonId, skillIds) => {
    const response = await api.put(`/lessons/${lessonId}/skills`, { skillIds });
    return response.data.data.skills;
  },

  getLessonSkills: async (lessonId) => {
    const response = await api.get(`/lessons/${lessonId}/skills`);
    return response.data.data.skills;
  },
};

export default skillService;
