import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api/warehouse',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    } else if (error.response?.status === 429) {
      // Handle rate limiting
      console.warn('Rate limit reached. Please slow down your requests.')
      // You could add a toast notification here
    }
    return Promise.reject(error)
  }
)

export default api
