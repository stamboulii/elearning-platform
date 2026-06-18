import api from './api';

export const generateQuiz = async (lessonId) => {
  const response = await api.post(`/quizzes/generate/${lessonId}`);
  return response.data;
};

export const getQuizByLesson = async (lessonId) => {
  const response = await api.get(`/quizzes/lesson/${lessonId}`);
  return response.data;
};

export const submitQuizAttempt = async (quizId, answers) => {
  const response = await api.post(`/quizzes/${quizId}/attempt`, { answers });
  return response.data;
};

export const createQuiz = async (lessonId, quizData) => {
  const response = await api.post(`/quizzes/manual/${lessonId}`, quizData);
  return response.data;
};

export default {
  generateQuiz,
  getQuizByLesson,
  submitQuizAttempt,
};