import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const NAV = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: '/explorer',
    label: 'Explorer',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    to: '/compare',
    label: 'Compare',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    to: '/correlate',
    label: 'Correlate',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <circle cx="7" cy="17" r="2" />
        <circle cx="12" cy="10" r="2" />
        <circle cx="17" cy="6" r="2" />
        <circle cx="9" cy="13" r="1.5" />
        <circle cx="15" cy="8" r="1.5" />
      </svg>
    ),
  },
  {
    to: '/cluster',
    label: 'Cluster',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <circle cx="12" cy="12" r="3" />
        <circle cx="5" cy="6" r="2" />
        <circle cx="19" cy="6" r="2" />
        <circle cx="5" cy="18" r="2" />
        <circle cx="19" cy="18" r="2" />
        <line x1="7" y1="7" x2="10" y2="10" />
        <line x1="17" y1="7" x2="14" y2="10" />
        <line x1="7" y1="17" x2="10" y2="14" />
        <line x1="17" y1="17" x2="14" y2="14" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const [collapsed, setCollapsed] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* ── Desktop / tablet sidebar ── */}
      <aside
        className={`
          hidden md:flex flex-col h-screen sticky top-0
          bg-white/[0.03] backdrop-blur-md border-r border-white/10
          transition-all duration-300 ease-in-out z-40
          ${collapsed ? 'w-16' : 'w-60'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
          <span className="text-teal shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.3" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" />
              <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" />
              <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1.5" />
              <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
          {!collapsed && (
            <span className="font-display font-bold text-lg text-white tracking-wide">EpiLens</span>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {NAV.map(({ to, label, icon }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                title={collapsed ? label : undefined}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sans
                  transition-all duration-150 group relative
                  ${active
                    ? 'bg-teal/10 text-teal border border-teal/20 shadow-[0_0_12px_rgba(0,212,170,0.15)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'}
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <span className="shrink-0">{icon}</span>
                {!collapsed && <span>{label}</span>}
                {active && !collapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal shadow-[0_0_6px_#00d4aa]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User + collapse */}
        <div className="border-t border-white/10 p-3 space-y-2">
          {!collapsed && user && (
            <div className="px-3 py-2 rounded-xl bg-white/5">
              <p className="text-xs text-slate-400 font-sans truncate">{user.email}</p>
              <p className="text-sm text-slate-200 font-mono font-medium truncate">@{user.username}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Sign out"
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sans
              text-slate-400 hover:text-crimson hover:bg-crimson/10 border border-transparent
              hover:border-crimson/20 transition-all duration-150
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 shrink-0">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {!collapsed && <span>Sign out</span>}
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-full flex items-center justify-center py-1.5 rounded-lg text-slate-600 hover:text-slate-400 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
              {collapsed
                ? <polyline points="9 18 15 12 9 6" />
                : <polyline points="15 18 9 12 15 6" />}
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-navy/90 backdrop-blur-lg border-t border-white/10">
        <div className="flex items-center justify-around py-2 px-2">
          {NAV.map(({ to, label, icon }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`
                  flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-150
                  ${active ? 'text-teal' : 'text-slate-500 hover:text-slate-300'}
                `}
              >
                <span className={active ? 'drop-shadow-[0_0_6px_#00d4aa]' : ''}>{icon}</span>
                <span className="text-[10px] font-sans">{label}</span>
              </Link>
            )
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-slate-500 hover:text-crimson transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="text-[10px] font-sans">Out</span>
          </button>
        </div>
      </nav>
    </>
  )
}
