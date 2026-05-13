import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAnalyses } from '../api/analyses'
import AnalysisCard from '../components/analysis/AnalysisCard'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'

export default function Dashboard() {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getAnalyses()
      .then(setAnalyses)
      .catch(() => setError('Could not load analyses. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-28 md:pb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-slate-400 font-sans text-sm">Your saved analyses</p>
        </div>
        <Link
          to="/explorer"
          className="shrink-0 inline-flex items-center gap-2 bg-teal text-navy font-display font-bold
            px-4 py-2.5 rounded-xl text-sm hover:bg-teal/90 transition-all
            shadow-[0_0_16px_rgba(0,212,170,0.2)]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="hidden sm:inline">New analysis</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-16 text-slate-500">
          <Spinner />
          <span className="font-sans text-sm">Loading analyses…</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 bg-crimson/10 border border-crimson/30 text-crimson rounded-xl px-4 py-3 text-sm font-sans">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mt-0.5 shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {!loading && !error && analyses.length === 0 && (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-7 h-7">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          }
          title="No saved analyses yet"
          message="Run an analysis in the Explorer and save it here for future reference."
          action={
            <Link
              to="/explorer"
              className="font-sans text-teal text-sm border border-teal/30 px-4 py-2 rounded-lg
                hover:bg-teal/10 transition-all"
            >
              Go to Explorer
            </Link>
          }
        />
      )}

      {!loading && analyses.length > 0 && (
        <>
          <p className="font-mono text-xs text-slate-600 mb-4">
            {analyses.length} analysis{analyses.length !== 1 ? 'es' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {analyses.map(a => (
              <AnalysisCard
                key={a.id}
                analysis={a}
                onDeleted={id => setAnalyses(prev => prev.filter(x => x.id !== id))}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
