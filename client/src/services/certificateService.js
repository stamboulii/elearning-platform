import api from './api';

const certificateService = {
  getCertificate: async (id) => {
    const response = await api.get(`/certificates/${id}`);
    return response.data;
  },

  getMyCertificate: async (enrollmentId) => {
    const response = await api.get(`/certificates/enrollment/${enrollmentId}`);
    return response.data;
  }
};

export default certificateService;
