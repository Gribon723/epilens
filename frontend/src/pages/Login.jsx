import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const { login, loading, error, token, clearError } = useAuthStore()

  const [form, setForm] = useState({ username: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true })
  }, [token, navigate])

  useEffect(() => {
    return () => clearError()
  }, [clearError])

  function validate() {
    const errs = {}
    if (!form.username.trim()) errs.username = 'Username is required'
    if (!form.password) errs.password = 'Password is required'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setFieldErrors({})
    try {
      await login(form)
      navigate('/dashboard', { replace: true })
    } catch {
      // error is set in store
    }
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy px-4">
      <div className="w-full max-w-md">
        <h1 className="font-display text-4xl font-bold text-teal mb-2 text-center">EpiLens</h1>
        <p className="text-slate-400 text-center mb-8 font-sans">Sign in to your account</p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-5"
        >
          {error && (
            <div className="bg-crimson/10 border border-crimson/40 text-crimson rounded-lg px-4 py-3 text-sm font-sans">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-300 mb-1 font-sans" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={handleChange}
              className={`w-full bg-slate-800 rounded-lg px-4 py-2.5 text-slate-100 font-mono text-sm outline-none
                border ${fieldErrors.username ? 'border-crimson' : 'border-slate-700'}
                focus:border-teal transition-colors`}
            />
            {fieldErrors.username && (
              <p className="text-crimson text-xs mt-1 font-sans">{fieldErrors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1 font-sans" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className={`w-full bg-slate-800 rounded-lg px-4 py-2.5 text-slate-100 font-mono text-sm outline-none
                border ${fieldErrors.password ? 'border-crimson' : 'border-slate-700'}
                focus:border-teal transition-colors`}
            />
            {fieldErrors.password && (
              <p className="text-crimson text-xs mt-1 font-sans">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal text-navy font-display font-bold py-2.5 rounded-lg
              hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-slate-400 font-sans">
            No account?{' '}
            <Link to="/register" className="text-teal hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
