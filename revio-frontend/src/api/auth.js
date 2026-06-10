import api from './axios'

export const register = (data) => api.post('/auth/register/', data)
export const login = (data) => api.post('/auth/login/', data)
export const getProfile = () => api.get('/auth/profile/')
export const createCheckout = (plan) => api.post('/auth/checkout/', { plan })
export const getNotifications = () => api.get('/auth/notifications/')
export const markNotificationRead = (id) => api.post(`/auth/notifications/${id}/read/`)
export const markAllNotificationsRead = () => api.post('/auth/notifications/read-all/')