import api from './axios'

export const generateContent = (courseId) => api.post(`/study/${courseId}/generate/`)
export const getFlashcards = (courseId) => api.get(`/study/${courseId}/flashcards/`)
export const getQuizzes = (courseId) => api.get(`/study/${courseId}/quiz/`)
export const askProfessor = (courseId, question) => api.post(`/study/${courseId}/professor/`, { question })
export const getRevisionPlan = (courseId) => api.get(`/study/${courseId}/revision-plan/`)
export const createRevisionPlan = (courseId, exam_date) => api.post(`/study/${courseId}/revision-plan/`, { exam_date })
export const saveSession = (data) => api.post('/study/sessions/', data)
export const getSessions = () => api.get('/study/sessions/')