import { create } from 'zustand'
import { fetchMe, loginUser, registerUser } from '../api/auth'

const TOKEN_KEY = 'epilens_token'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY) ?? null,
  loading: false,
  error: null,

  register: async (credentials) => {
    set({ loading: true, error: null })
    try {
      await registerUser(credentials)
    } catch (err) {
      const msg = err.response?.data?.detail ?? 'Registration failed'
      set({ loading: false, error: msg })
      throw err
    }
    set({ loading: false })
  },

  login: async (credentials) => {
    set({ loading: true, error: null })
    try {
      const { access_token } = await loginUser(credentials)
      localStorage.setItem(TOKEN_KEY, access_token)
      const user = await fetchMe()
      set({ token: access_token, user, loading: false })
    } catch (err) {
      const msg = err.response?.data?.detail ?? 'Login failed'
      set({ loading: false, error: msg })
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ token: null, user: null, error: null })
  },

  hydrate: async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return
    try {
      const user = await fetchMe()
      set({ user, token })
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      set({ token: null, user: null })
    }
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore
