import { useState } from 'react'
import { getCorrelation } from '../api/stats'
import ScatterPlot from '../components/charts/ScatterPlot'
import EmptyState from '../components/ui/EmptyState'
import IndicatorSearch from '../components/ui/IndicatorSearch'
import Spinner from '../components/ui/Spinner'
import StatBadge from '../components/ui/StatBadge'
import useIndicators from '../hooks/useIndicators'

function strengthLabel(r) {
  const abs = Math.abs(r)
  if (abs >= 0.9) return 'Very strong'
  if (abs >= 0.7) return 'Strong'
  if (abs >= 0.5) return 'Moderate'
  if (abs >= 0.3) return 'Weak'
  return 'Very weak'
}

export default function Correlate() {
  const { indicators, loading: loadingIndicators, fetchData } = useIndicators()

  const [xIndicator, setXIndicator] = useState(null)
  const [yIndicator, setYIndicator] = useState(null)
  const [xData, setXData] = useState([])
  const [yData, setYData] = useState([])
  const [corrResult, setCorrResult] = useState(null)
  const [loading, setLoading] = useState({ x: false, y: false, corr: false })
  const [error, setError] = useState(null)

  async function loadX(ind) {
    setXIndicator(ind)
    setXData([])
    setCorrResult(null)
    setLoading(l => ({ ...l, x: true }))
    try { setXData(await fetchData(ind.code)) }
    catch (e) { setError(e.response?.data?.detail ?? 'Failed to load X indicator.') }
    finally { setLoading(l => ({ ...l, x: false })) }
  }

  async function loadY(ind) {
    setYIndicator(ind)
    setYData([])
    setCorrResult(null)
    setLoading(l => ({ ...l, y: true }))
    try { setYData(await fetchData(ind.code)) }
    catch (e) { setError(e.response?.data?.detail ?? 'Failed to load Y indicator.') }
    finally { setLoading(l => ({ ...l, y: false })) }
  }

  async function runCorrelation() {
    if (!xData.length || !yData.length) return
    setError(null)
    setLoading(l => ({ ...l, corr: true }))
    try {
      setCorrResult(await getCorrelation(xData, yData))
    } catch (e) {
      setError(e.response?.data?.detail ?? 'Correlation failed. Ensure both indicators share common countries and years.')
    } finally {
      setLoading(l => ({ ...l, corr: false }))
    }
  }

  const scatterData = corrResult?.scatter_points ?? []
  const canRun = xData.length > 0 && yData.length > 0 && !loading.x && !loading.y

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 pb-28 md:pb-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">Correlate</h1>
        <p className="text-slate-400 font-sans text-sm">
          Discover relationships between two WHO indicators across countries
        </p>
      </div>

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

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <IndicatorSearch
            label="X axis indicator"
            indicators={indicators}
            loading={loadingIndicators}
            onSelect={loadX}
          />
          <IndicatorSearch
            label="Y axis indicator"
            indicators={indicators}
            loading={loadingIndicators}
            onSelect={loadY}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={runCorrelation}
            disabled={!canRun || loading.corr}
            className="inline-flex items-center gap-2 bg-teal text-navy font-display font-bold px-5 py-2.5
              rounded-xl hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all
              shadow-[0_0_16px_rgba(0,212,170,0.25)]"
          >
            {loading.corr && <Spinner size="sm" />}
            {loading.corr ? 'Computing…' : 'Compute Correlation'}
          </button>

          {(loading.x || loading.y) && (
            <span className="flex items-center gap-2 text-slate-500 text-sm font-sans">
              <Spinner size="sm" />
              Loading indicator data…
            </span>
          )}
        </div>
      </div>

      {corrResult && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBadge
              label="Pearson r"
              value={corrResult.pearson_r?.toFixed(4) ?? '–'}
              highlight={Math.abs(corrResult.pearson_r) >= 0.5}
            />
            <StatBadge
              label="Spearman r"
              value={corrResult.spearman_r?.toFixed(4) ?? '–'}
              highlight={Math.abs(corrResult.spearman_r) >= 0.5}
            />
            <StatBadge
              label="Strength"
              value={strengthLabel(corrResult.pearson_r ?? 0)}
              highlight={Math.abs(corrResult.pearson_r) >= 0.7}
            />
            <StatBadge
              label="Data points"
              value={corrResult.n_points ?? scatterData.length}
            />
          </div>

          {corrResult.pearson_r != null && (
            <div className={`px-4 py-3 rounded-xl border text-sm font-sans
              ${Math.abs(corrResult.pearson_r) >= 0.5
                ? 'bg-teal/5 border-teal/20 text-slate-300'
                : 'bg-white/[0.02] border-white/10 text-slate-500'}`}
            >
              <span className="font-medium text-slate-200">
                {corrResult.pearson_r > 0 ? 'Positive' : 'Negative'} {strengthLabel(corrResult.pearson_r).toLowerCase()} correlation
              </span>
              {' — '}as <em>{xIndicator?.name}</em> increases, <em>{yIndicator?.name}</em>{' '}
              {corrResult.pearson_r > 0 ? 'tends to increase' : 'tends to decrease'} (Pearson r = {corrResult.pearson_r?.toFixed(3)}).
            </div>
          )}

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5">
            <ScatterPlot
              data={scatterData}
              xLabel={xIndicator?.code ?? 'X'}
              yLabel={yIndicator?.code ?? 'Y'}
              height={360}
            />
          </div>
        </div>
      )}

      {!corrResult && !loading.corr && (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-7 h-7">
              <circle cx="7" cy="17" r="2" />
              <circle cx="12" cy="10" r="2" />
              <circle cx="17" cy="6" r="2" />
              <circle cx="9" cy="14" r="1.5" />
              <circle cx="15" cy="8" r="1.5" />
            </svg>
          }
          title="Select two indicators"
          message="Pick an X and a Y indicator above, then click Compute Correlation to discover the relationship."
        />
      )}
    </div>
  )
}
