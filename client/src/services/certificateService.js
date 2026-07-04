import api from './api';

const certificateService = {
  getCertificate: async (id) => {
    const response = await api.get(`/certificates/${id}`);
    return response.data;
  },

  getMyCertificate: async (enrollmentId) => {
    const response = await api.get(`/certificates/enrollment/${enrollmentId}`);
    return response.data;
  },

  getMyCertificates: async () => {
    const response = await api.get(`/certificates/my/list`);
    return response.data.data.certificates;
  },

  generateCertificate: async (enrollmentId) => {
    const response = await api.post(`/certificates/generate/${enrollmentId}`);
    return response.data.data;
  },
};

export default certificateService;
