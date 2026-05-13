import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('epilens_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export async function registerUser({ email, username, password }) {
  const { data } = await api.post('/auth/register', { email, username, password })
  return data
}

export async function loginUser({ username, password }) {
  const { data } = await api.post('/auth/login', { username, password })
  return data
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me')
  return data
}

export default api
