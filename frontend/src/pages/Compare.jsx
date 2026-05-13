import { useEffect, useMemo, useState } from 'react'
import { getIndicatorData, getIndicators } from '../api/indicators'
import { CHART_COLORS } from '../components/charts/TrendChart'
import TrendChart from '../components/charts/TrendChart'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'

const MAX_COUNTRIES = 8

export default function Compare() {
  const [indicators, setIndicators] = useState([])
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndicator, setSelectedIndicator] = useState(null)

  const [rawData, setRawData] = useState([])
  const [availableCountries, setAvailableCountries] = useState([])
  const [selectedCountries, setSelectedCountries] = useState([])
  const [yearMin, setYearMin] = useState(2000)
  const [yearMax, setYearMax] = useState(2023)
  const [dataYearBounds, setDataYearBounds] = useState([2000, 2023])

  const [loading, setLoading] = useState({ indicators: false, data: false })
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

  async function loadData(indicator) {
    setSelectedIndicator(indicator)
    setShowDropdown(false)
    setSearch(indicator.name)
    setRawData([])
    setSelectedCountries([])
    setError(null)
    setLoading(l => ({ ...l, data: true }))
    try {
      const data = await getIndicatorData(indicator.code)
      const countries = [...new Set(data.map(r => r.country))].filter(Boolean).sort()
      const years = data.map(r => r.year).filter(Boolean)
      const minY = Math.min(...years)
      const maxY = Math.max(...years)
      setRawData(data)
      setAvailableCountries(countries)
      setSelectedCountries(countries.slice(0, 4))
      setDataYearBounds([minY, maxY])
      setYearMin(minY)
      setYearMax(maxY)
    } catch (e) {
      setError(e.response?.data?.detail ?? 'Failed to load indicator data.')
    } finally {
      setLoading(l => ({ ...l, data: false }))
    }
  }

  function toggleCountry(c) {
    setSelectedCountries(prev =>
      prev.includes(c)
        ? prev.filter(x => x !== c)
        : prev.length < MAX_COUNTRIES ? [...prev, c] : prev
    )
  }

  // Build chart data
  const chartData = useMemo(() => {
    if (!rawData.length || !selectedCountries.length) return []
    const filtered = rawData.filter(r =>
      selectedCountries.includes(r.country) &&
      r.year >= yearMin && r.year <= yearMax
    )
    const map = {}
    for (const r of filtered) {
      if (!map[r.year]) map[r.year] = { year: r.year }
      map[r.year][r.country] = r.value
    }
    return Object.values(map).sort((a, b) => a.year - b.year)
  }, [rawData, selectedCountries, yearMin, yearMax])

  // Comparison stats table
  const comparisonStats = useMemo(() => {
    return selectedCountries.map((c, i) => {
      const values = rawData
        .filter(r => r.country === c && r.year >= yearMin && r.year <= yearMax)
        .map(r => r.value)
        .filter(v => v != null)
      if (!values.length) return null
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const min = Math.min(...values)
      const max = Math.max(...values)
      const sorted = rawData.filter(r => r.country === c).sort((a, b) => b.year - a.year)
      const latest = sorted[0]?.value
      return { country: c, mean, min, max, latest, color: CHART_COLORS[i % CHART_COLORS.length] }
    }).filter(Boolean)
  }, [rawData, selectedCountries, yearMin, yearMax])

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 pb-28 md:pb-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">Compare</h1>
        <p className="text-slate-400 font-sans text-sm">Compare one indicator across multiple countries side by side</p>
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

      {/* Indicator selector */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5">
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
              focus:border-teal/40 focus:shadow-[0_0_0_3px_rgba(0,212,170,0.07)] transition-all"
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

      {/* Controls */}
      {rawData.length > 0 && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5 space-y-4">
          <div>
            <p className="font-sans text-xs text-slate-500 mb-2.5 uppercase tracking-widest">
              Countries <span className="text-slate-700 normal-case">— up to {MAX_COUNTRIES}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {availableCountries.map(c => (
                <button
                  key={c}
                  onClick={() => toggleCountry(c)}
                  className={`font-mono text-xs px-2.5 py-1 rounded-lg border transition-all
                    ${selectedCountries.includes(c)
                      ? 'bg-teal/10 text-teal border-teal/30'
                      : 'text-slate-600 border-white/10 hover:border-white/20 hover:text-slate-300'}
                    ${!selectedCountries.includes(c) && selectedCountries.length >= MAX_COUNTRIES ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-sans text-xs text-slate-500 mb-2.5 uppercase tracking-widest">Year range</p>
            <div className="flex items-center gap-3">
              <input type="number" value={yearMin} min={dataYearBounds[0]} max={yearMax - 1}
                onChange={e => setYearMin(Number(e.target.value))}
                className="w-24 bg-slate-800/50 border border-white/10 rounded-lg px-3 py-1.5 font-mono text-sm
                  text-slate-100 outline-none focus:border-teal/40 transition-colors text-center" />
              <span className="text-slate-600 font-mono text-sm">–</span>
              <input type="number" value={yearMax} min={yearMin + 1} max={dataYearBounds[1]}
                onChange={e => setYearMax(Number(e.target.value))}
                className="w-24 bg-slate-800/50 border border-white/10 rounded-lg px-3 py-1.5 font-mono text-sm
                  text-slate-100 outline-none focus:border-teal/40 transition-colors text-center" />
            </div>
          </div>
        </div>
      )}

      {loading.data && (
        <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
          <Spinner />
          <span className="font-sans text-sm">Loading WHO data…</span>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && selectedCountries.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5">
            <p className="font-sans text-sm text-slate-400 mb-4">
              <span className="text-slate-200 font-medium">{selectedIndicator?.name}</span>
              <span className="ml-2 font-mono text-xs text-slate-600">{yearMin}–{yearMax}</span>
            </p>
            <TrendChart data={chartData} countries={selectedCountries} height={340} />
          </div>

          {/* Comparison table */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10">
                  <tr>
                    {['Country', 'Mean', 'Min', 'Max', 'Latest value'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-sans text-xs text-slate-500 font-medium uppercase tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {comparisonStats.map(s => (
                    <tr key={s.country} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                          <span className="font-mono text-slate-300 text-xs">{s.country}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300 text-xs">{s.mean.toFixed(3)}</td>
                      <td className="px-4 py-3 font-mono text-slate-500 text-xs">{s.min.toFixed(3)}</td>
                      <td className="px-4 py-3 font-mono text-slate-500 text-xs">{s.max.toFixed(3)}</td>
                      <td className="px-4 py-3 font-mono text-teal text-xs">{s.latest?.toFixed(3) ?? '–'}</td>
                    </tr>
                  ))}
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
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          }
          title="Pick an indicator"
          message="Select an indicator above, then choose countries to compare."
        />
      )}

      {showDropdown && <div className="fixed inset-0 z-20" onClick={() => setShowDropdown(false)} />}
    </div>
  )
}
