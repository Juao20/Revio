import api from './axios'

export const createBugReport = (data) => api.post('/accounts/bugs/', data)
export const getBugReports = () => api.get('/accounts/bugs/')
export const getBugReport = (id) => api.get(`/accounts/bugs/${id}/`)
