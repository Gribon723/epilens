import useAuthStore from '../store/authStore'

export default function useAuth() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)
  const register = useAuthStore((s) => s.register)
  const clearError = useAuthStore((s) => s.clearError)

  return { user, token, isAuthenticated: !!token, loading, error, login, logout, register, clearError }
}
