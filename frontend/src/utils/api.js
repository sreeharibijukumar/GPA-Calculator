import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// ── In-memory token store 
let _token = null
export const setToken  = (token) => { _token = token }
export const clearToken = () => { _token = null }
export const getToken  = () => _token

// ── Axios instance 
const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: attach JWT 
api.interceptors.request.use((config) => {
  if (_token) config.headers.Authorization = `Bearer ${_token}`
  return config
})

// ── Response interceptor: handle expired/invalid token globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    return Promise.reject(error)
  }
)

export default api

// ── Auth API 
export const authApi = {
  googleLogin: (credential) =>
    api.post('/auth/google', { credential }).then((r) => r.data),
  getMe: () => api.get('/auth/me').then((r) => r.data),
  logout: () => api.post('/auth/logout').catch(() => {}),
}

// ── Semesters API 
export const semestersApi = {

  list: () => api.get('/semesters').then((r) => r.data),

  get: (id) => api.get(`/semesters/${id}`).then((r) => r.data),

  create: (payload) => api.post('/semesters', payload).then((r) => r.data),

  update: (id, payload) => api.patch(`/semesters/${id}`, payload).then((r) => r.data),

  delete: (id) => api.delete(`/semesters/${id}`),

  getCgpa: () => api.get('/semesters/cgpa').then((r) => r.data),

  calculate: (payload) => api.post('/semesters/calculate', payload).then((r) => r.data),
}