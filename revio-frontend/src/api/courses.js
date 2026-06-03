import api from './axios'

export const getCourses = () => api.get('/courses/')
export const getCourse = (id) => api.get(`/courses/${id}/`)
export const deleteCourse = (id) => api.delete(`/courses/${id}/`)

export const uploadCourse = (formData) =>
  api.post('/courses/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })