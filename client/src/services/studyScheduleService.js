import api from './api';

const studyScheduleService = {
    // Generate a new schedule
    generateSchedule: async (data) => {
        const response = await api.post('/study-schedules/generate', data);
        return response.data;
    },

    // Get existing schedule
    getSchedule: async (enrollmentId) => {
        const response = await api.get(`/study-schedules/${enrollmentId}`);
        return response.data;
    }
};

export default studyScheduleService;
