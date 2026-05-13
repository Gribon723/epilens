import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function Register() {
  const navigate = useNavigate()
  const { register, login, loading, error, token, clearError } = useAuthStore()

  const [form, setForm] = useState({ email: '', username: '', password: '', confirm: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true })
  }, [token, navigate])

  useEffect(() => {
    return () => clearError()
  }, [clearError])

  function validate() {
    const errs = {}
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address'
    if (!form.username.trim()) errs.username = 'Username is required'
    else if (form.username.length < 3) errs.username = 'Username must be at least 3 characters'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setFieldErrors({})
    try {
      await register({ email: form.email, username: form.username, password: form.password })
      await login({ username: form.username, password: form.password })
      navigate('/dashboard', { replace: true })
    } catch {
      // error is set in store
    }
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const inputClass = (field) =>
    `w-full bg-slate-800 rounded-lg px-4 py-2.5 text-slate-100 font-mono text-sm outline-none
     border ${fieldErrors[field] ? 'border-crimson' : 'border-slate-700'} focus:border-teal transition-colors`

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <h1 className="font-display text-4xl font-bold text-teal mb-2 text-center">EpiLens</h1>
        <p className="text-slate-400 text-center mb-8 font-sans">Create your account</p>

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
            <label className="block text-sm text-slate-300 mb-1 font-sans" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className={inputClass('email')}
            />
            {fieldErrors.email && (
              <p className="text-crimson text-xs mt-1 font-sans">{fieldErrors.email}</p>
            )}
          </div>

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
              className={inputClass('username')}
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
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className={inputClass('password')}
            />
            {fieldErrors.password && (
              <p className="text-crimson text-xs mt-1 font-sans">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1 font-sans" htmlFor="confirm">
              Confirm password
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={handleChange}
              className={inputClass('confirm')}
            />
            {fieldErrors.confirm && (
              <p className="text-crimson text-xs mt-1 font-sans">{fieldErrors.confirm}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal text-navy font-display font-bold py-2.5 rounded-lg
              hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-center text-sm text-slate-400 font-sans">
            Already have an account?{' '}
            <Link to="/login" className="text-teal hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
