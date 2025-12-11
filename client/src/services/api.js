import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred'
    console.error('API Error:', message)
    return Promise.reject(new Error(message))
  }
)

// ============ Players API ============

export const playersApi = {
  getAll: (params) => api.get('/players', { params }),
  getById: (id) => api.get(`/players/${id}`),
  create: (data) => api.post('/players', data),
  update: (id, data) => api.put(`/players/${id}`, data),
  delete: (id) => api.delete(`/players/${id}`),
  search: (query) => api.get('/players/search', { params: { q: query } }),
  getStats: (id) => api.get(`/players/${id}/stats`),
}

// ============ Punishments API ============

export const punishmentsApi = {
  getAll: (params) => api.get('/punishments', { params }),
  getActive: () => api.get('/punishments/active'),
  getByPlayer: (playerId) => api.get(`/players/${playerId}/punishments`),
  create: (data) => api.post('/punishments', data),
  revoke: (id, reason) => api.post(`/punishments/${id}/revoke`, { reason }),
  getStats: () => api.get('/punishments/stats'),
}

// ============ Notes API ============

export const notesApi = {
  getByPlayer: (playerId) => api.get(`/players/${playerId}/notes`),
  create: (playerId, data) => api.post(`/players/${playerId}/notes`, data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
}

// ============ Activity API ============

export const activityApi = {
  getAll: (params) => api.get('/activity', { params }),
  getByPlayer: (playerId, params) => api.get(`/players/${playerId}/activity`, { params }),
  create: (data) => api.post('/activity', data),
}

// ============ Dashboard API ============

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getRecent: () => api.get('/dashboard/recent'),
}

export default api
