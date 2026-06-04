import api from './axios'

export const register = (data) => api.post('/auth/register/', data)
export const login = (data) => api.post('/auth/login/', data)
export const getProfile = () => api.get('/auth/profile/')
export const createCheckout = (plan) => api.post('/auth/checkout/', { plan })