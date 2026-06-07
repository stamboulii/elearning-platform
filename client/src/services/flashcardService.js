import api from './api';

export const generateDeck = async (lessonId) => {
    const response = await api.post(`/flashcards/generate/${lessonId}`);
    return response.data;
};

export const getDeckByLesson = async (lessonId) => {
    const response = await api.get(`/flashcards/lesson/${lessonId}`);
    return response.data;
};

export const deleteDeck = async (lessonId) => {
    const response = await api.delete(`/flashcards/${lessonId}`);
    return response.data;
};

export default {
    generateDeck,
    getDeckByLesson,
    deleteDeck,
};
