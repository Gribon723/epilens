import { useEffect, useMemo, useState } from 'react'
import { getIndicatorData, getIndicators } from '../api/indicators'
import { getCluster } from '../api/stats'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import StatBadge from '../components/ui/StatBadge'

// Distinct colours for up to 8 clusters
const CLUSTER_COLORS = [
  { bg: 'bg-teal/10', border: 'border-teal/30', text: 'text-teal', dot: '#00d4aa' },
  { bg: 'bg-blue-400/10', border: 'border-blue-400/30', text: 'text-blue-400', dot: '#60a5fa' },
  { bg: 'bg-amber-400/10', border: 'border-amber-400/30', text: 'text-amber-400', dot: '#f59e0b' },
  { bg: 'bg-violet-400/10', border: 'border-violet-400/30', text: 'text-violet-400', dot: '#a78bfa' },
  { bg: 'bg-rose-400/10', border: 'border-rose-400/30', text: 'text-rose-400', dot: '#fb7185' },
  { bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', text: 'text-emerald-400', dot: '#34d399' },
  { bg: 'bg-orange-400/10', border: 'border-orange-400/30', text: 'text-orange-400', dot: '#fb923c' },
  { bg: 'bg-pink-400/10', border: 'border-pink-400/30', text: 'text-pink-400', dot: '#f472b6' },
]

export default function Cluster() {
  const [indicators, setIndicators] = useState([])
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndicator, setSelectedIndicator] = useState(null)

  const [rawData, setRawData] = useState([])
  const [nClusters, setNClusters] = useState(4)
  const [clusterResult, setClusterResult] = useState([])
  const [searchCountry, setSearchCountry] = useState('')

  const [loading, setLoading] = useState({ indicators: false, data: false, cluster: false })
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(l => ({ ...l, indicators: true }))
    getIndicators()
      .then(setIndicators)
      .catch(() => setError('Could not load indicators. Is the backend running?'))
      .finally(() => setLoading(l => ({ ...l, indicators: false })))
  }, [])

  const filteredIndicators = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return indicators.slice(0, 80)
    return indicators.filter(i =>
      i.name?.toLowerCase().includes(q) || i.code?.toLowerCase().includes(q)
    ).slice(0, 80)
  }, [indicators, search])

  async function loadData(ind) {
    setSelectedIndicator(ind)
    setShowDropdown(false)
    setSearch(ind.name)
    setRawData([])
    setClusterResult([])
    setError(null)
    setLoading(l => ({ ...l, data: true }))
    try {
      setRawData(await getIndicatorData(ind.code))
    } catch (e) {
      setError(e.response?.data?.detail ?? 'Failed to load indicator data.')
    } finally {
      setLoading(l => ({ ...l, data: false }))
    }
  }

  async function runClustering() {
    if (!rawData.length) return
    setError(null)
    setLoading(l => ({ ...l, cluster: true }))
    try {
      const result = await getCluster(rawData, nClusters)
      setClusterResult(result)
    } catch (e) {
      setError(e.response?.data?.detail ?? 'Clustering failed.')
    } finally {
      setLoading(l => ({ ...l, cluster: false }))
    }
  }

  // Summary: one entry per cluster
  const clusterSummary = useMemo(() => {
    const map = {}
    for (const r of clusterResult) {
      if (!map[r.cluster]) map[r.cluster] = { cluster: r.cluster, countries: [], means: [] }
      map[r.cluster].countries.push(r.country)
      map[r.cluster].means.push(r.mean_value)
    }
    return Object.values(map).sort((a, b) => a.cluster - b.cluster).map(c => ({
      ...c,
      avgMean: c.means.reduce((a, b) => a + b, 0) / c.means.length,
    }))
  }, [clusterResult])

  const filteredResults = useMemo(() => {
    const q = searchCountry.trim().toLowerCase()
    if (!q) return clusterResult
    return clusterResult.filter(r => r.country.toLowerCase().includes(q))
  }, [clusterResult, searchCountry])

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 pb-28 md:pb-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">Cluster</h1>
        <p className="text-slate-400 font-sans text-sm">
          Group countries by epidemiological similarity using K-Means clustering
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

      {/* Indicator selector + cluster controls */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5 space-y-4">
        <div>
          <label className="block font-sans text-xs text-slate-500 mb-2 uppercase tracking-widest">Indicator</label>
          <div className="relative">
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setShowDropdown(true) }}
              onFocus={() => setShowDropdown(true)}
              placeholder={loading.indicators ? 'Loading…' : 'Search indicator…'}
              disabled={loading.indicators}
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm
                font-sans text-slate-100 placeholder:text-slate-600 outline-none
                focus:border-teal/40 transition-all"
            />
            {loading.indicators && <Spinner size="sm" className="absolute right-3 top-1/2 -translate-y-1/2" />}

            {showDropdown && filteredIndicators.length > 0 && !loading.indicators && (
              <div className="absolute z-30 mt-1.5 w-full bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                <div className="max-h-52 overflow-y-auto divide-y divide-white/[0.04]">
                  {filteredIndicators.map(ind => (
                    <button
                      key={ind.code}
                      onMouseDown={() => loadData(ind)}
                      className="w-full text-left px-4 py-2.5 hover:bg-teal/10 transition-colors flex items-center gap-3"
                    >
                      <span className="font-mono text-[10px] text-teal shrink-0 bg-teal/10 border border-teal/20 rounded px-1.5 py-0.5">
                        {ind.code}
                      </span>
                      <span className="font-sans text-sm text-slate-300 truncate">{ind.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cluster count */}
        {rawData.length > 0 && (
          <div>
            <label className="block font-sans text-xs text-slate-500 mb-2.5 uppercase tracking-widest">
              Number of clusters: <span className="text-teal font-mono">{nClusters}</span>
            </label>
            <input
              type="range"
              min={2}
              max={8}
              value={nClusters}
              onChange={e => { setNClusters(Number(e.target.value)); setClusterResult([]) }}
              className="w-48 accent-teal cursor-pointer"
            />
            <div className="flex justify-between w-48 mt-1">
              {[2,3,4,5,6,7,8].map(n => (
                <span key={n} className="font-mono text-[10px] text-slate-700">{n}</span>
              ))}
            </div>
          </div>
        )}

        {rawData.length > 0 && (
          <button
            onClick={runClustering}
            disabled={loading.cluster}
            className="inline-flex items-center gap-2 bg-teal text-navy font-display font-bold px-5 py-2.5
              rounded-xl hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all
              shadow-[0_0_16px_rgba(0,212,170,0.25)]"
          >
            {loading.cluster && <Spinner size="sm" />}
            {loading.cluster ? 'Clustering…' : `Cluster into ${nClusters} groups`}
          </button>
        )}
      </div>

      {loading.data && (
        <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
          <Spinner />
          <span className="font-sans text-sm">Loading WHO data…</span>
        </div>
      )}

      {/* Results */}
      {clusterResult.length > 0 && (
        <div className="space-y-4">
          {/* Summary stat badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBadge label="Countries clustered" value={clusterResult.length} />
            <StatBadge label="Clusters" value={nClusters} highlight />
            <StatBadge label="Indicator" value={selectedIndicator?.code ?? '–'} />
            <StatBadge label="Algorithm" value="K-Means" />
          </div>

          {/* Cluster legend chips */}
          <div className="flex flex-wrap gap-2">
            {clusterSummary.map(cs => {
              const c = CLUSTER_COLORS[cs.cluster % CLUSTER_COLORS.length]
              return (
                <div key={cs.cluster} className={`flex items-center gap-2 ${c.bg} border ${c.border} rounded-xl px-3 py-2`}>
                  <span className={`font-mono text-xs font-bold ${c.text}`}>Cluster {cs.cluster + 1}</span>
                  <span className="font-mono text-xs text-slate-500">{cs.countries.length} countries</span>
                  <span className="font-mono text-xs text-slate-600">avg {cs.avgMean.toFixed(2)}</span>
                </div>
              )
            })}
          </div>

          {/* Country search filter */}
          <input
            value={searchCountry}
            onChange={e => setSearchCountry(e.target.value)}
            placeholder="Filter countries…"
            className="w-full sm:w-64 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-sm
              font-mono text-slate-100 placeholder:text-slate-600 outline-none focus:border-teal/40 transition-all"
          />

          {/* Results table */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10">
                  <tr>
                    {['Cluster', 'Country', 'Mean value', 'Trend slope', 'Std dev'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-sans text-xs text-slate-500 font-medium uppercase tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredResults.map((r, i) => {
                    const c = CLUSTER_COLORS[r.cluster % CLUSTER_COLORS.length]
                    return (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center gap-1.5 font-mono text-xs font-medium px-2 py-0.5 rounded-md ${c.bg} border ${c.border} ${c.text}`}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
                            {r.cluster + 1}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-slate-300 text-xs">{r.country}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-400 text-xs">
                          {r.mean_value?.toFixed(3) ?? '–'}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-slate-500 text-xs">
                          {r.trend_slope?.toFixed(4) ?? '–'}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-slate-500 text-xs">
                          {r.std_dev?.toFixed(3) ?? '–'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!loading.indicators && !loading.data && !rawData.length && !error && (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-7 h-7">
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
          }
          title="Pick an indicator"
          message="Select an indicator above to cluster all available countries by epidemiological similarity."
        />
      )}

      {showDropdown && <div className="fixed inset-0 z-20" onClick={() => setShowDropdown(false)} />}
    </div>
  )
}
