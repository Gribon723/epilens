import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import AppLayout from './components/AppLayout'
import Cluster from './pages/Cluster'
import Compare from './pages/Compare'
import Correlate from './pages/Correlate'
import Dashboard from './pages/Dashboard'
import Explorer from './pages/Explorer'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import useAuthStore from './store/authStore'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('epilens_token')
  if (!token) return <Navigate to="/login" replace />
  return <AppLayout>{children}</AppLayout>
}

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/explorer" element={<ProtectedRoute><Explorer /></ProtectedRoute>} />
        <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
        <Route path="/correlate" element={<ProtectedRoute><Correlate /></ProtectedRoute>} />
        <Route path="/cluster" element={<ProtectedRoute><Cluster /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
