import api from './axios'

export const generateContent = (courseId) => api.post(`/study/${courseId}/generate/`)
export const getFlashcards = (courseId, dueOnly = false) =>
  api.get(`/study/${courseId}/flashcards/${dueOnly ? '?due=true' : ''}`)
export const reviewFlashcard = (courseId, flashcardId, quality) =>
  api.post(`/study/${courseId}/flashcards/${flashcardId}/review/`, { quality })
export const getQuizzes = (courseId) => api.get(`/study/${courseId}/quiz/`)
export const submitQuizAnswer = (courseId, quizId, selectedAnswer) =>
  api.post(`/study/${courseId}/quiz/submit/`, { quiz_id: quizId, selected_answer: selectedAnswer })
export const getWeakPoints = (courseId) => api.get(`/study/${courseId}/weak-points/`)
export const askProfessor = (courseId, question, history = []) =>
  api.post(`/study/${courseId}/professor/`, { question, history })
export const getRevisionPlan = (courseId) => api.get(`/study/${courseId}/revision-plan/`)
export const createRevisionPlan = (courseId, exam_date) =>
  api.post(`/study/${courseId}/revision-plan/`, { exam_date })
export const saveSession = (data) => api.post('/study/sessions/', data)
export const getSessions = () => api.get('/study/sessions/')
export const getHeatmap = () => api.get('/study/heatmap/')
export const getDueFlashcards = () => api.get('/study/due-flashcards/')
export const startExam = (courseId, difficulty) =>
  api.post(`/study/${courseId}/exam/start/`, { difficulty })
export const submitExam = (courseId, examId, answers, time_used_seconds) =>
  api.post(`/study/${courseId}/exam/${examId}/submit/`, { answers, time_used_seconds })
export const getExamHistory = (courseId) =>
  api.get(`/study/${courseId}/exam/history/`)