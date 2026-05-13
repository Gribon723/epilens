import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createAnalysis } from '../api/analyses'
import { getIndicatorData, getIndicators } from '../api/indicators'
import { getAnomalies, getTrend } from '../api/stats'
import TrendChart from '../components/charts/TrendChart'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import StatBadge from '../components/ui/StatBadge'

const MAX_COUNTRIES = 6
const TREND_ICON = { increasing: '↑', decreasing: '↓', stable: '→' }

export default function Explorer() {
  const navigate = useNavigate()

  // Indicator picker
  const [indicators, setIndicators] = useState([])
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndicator, setSelectedIndicator] = useState(null)

  // Loaded data
  const [rawData, setRawData] = useState([])
  const [availableCountries, setAvailableCountries] = useState([])
  const [selectedCountries, setSelectedCountries] = useState([])
  const [yearMin, setYearMin] = useState(2000)
  const [yearMax, setYearMax] = useState(2023)
  const [dataYearBounds, setDataYearBounds] = useState([2000, 2023])

  // Analysis results
  const [trendResult, setTrendResult] = useState(null)
  const [anomalyResult, setAnomalyResult] = useState(null)
  const [activeTab, setActiveTab] = useState('trend')

  // UI state
  const [loading, setLoading] = useState({ indicators: false, data: false, analysis: false })
  const [error, setError] = useState(null)
  const [showSave, setShowSave] = useState(false)
  const [saveForm, setSaveForm] = useState({ title: '', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(l => ({ ...l, indicators: true }))
    getIndicators()
      .then(setIndicators)
      .catch(() => setError('Could not load indicators. Is the backend running at ' + (import.meta.env.VITE_API_URL ?? 'http://localhost:8000') + '?'))
      .finally(() => setLoading(l => ({ ...l, indicators: false })))
  }, [])

  // Filter indicator list as the user types
  const filteredIndicators = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return indicators.slice(0, 80)
    return indicators.filter(i =>
      i.name?.toLowerCase().includes(q) || i.code?.toLowerCase().includes(q)
    ).slice(0, 80)
  }, [indicators, search])

  async function loadIndicatorData(indicator) {
    setSelectedIndicator(indicator)
    setShowDropdown(false)
    setSearch(indicator.name)
    setRawData([])
    setSelectedCountries([])
    setTrendResult(null)
    setAnomalyResult(null)
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
      setSelectedCountries(countries.slice(0, 3))
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
    setTrendResult(null)
    setAnomalyResult(null)
  }

  async function runAnalysis() {
    const filtered = rawData.filter(r =>
      selectedCountries.includes(r.country) &&
      r.year >= yearMin && r.year <= yearMax
    )
    if (filtered.length < 3) {
      setError('Not enough data points. Try selecting more countries or a wider year range.')
      return
    }
    setError(null)
    setLoading(l => ({ ...l, analysis: true }))
    try {
      const [trend, anomaly] = await Promise.all([
        getTrend(filtered, 5),
        getAnomalies(filtered, 5),
      ])
      setTrendResult(trend)
      setAnomalyResult(anomaly)
      setActiveTab('trend')
    } catch (e) {
      setError(e.response?.data?.detail ?? 'Analysis failed. Check backend logs.')
    } finally {
      setLoading(l => ({ ...l, analysis: false }))
    }
  }

  // Build chart data: year-keyed object with one key per country + trend key
  const chartData = useMemo(() => {
    if (!rawData.length) return []
    const filtered = rawData.filter(r =>
      selectedCountries.includes(r.country) &&
      r.year >= yearMin && r.year <= yearMax
    )
    const map = {}
    for (const r of filtered) {
      if (!map[r.year]) map[r.year] = { year: r.year }
      map[r.year][r.country] = r.value
    }
    if (trendResult) {
      for (const t of trendResult.trend_line ?? []) {
        if (!map[t.year]) map[t.year] = { year: t.year }
        map[t.year].trend = t.value
      }
      for (const p of trendResult.projected ?? []) {
        if (!map[p.year]) map[p.year] = { year: p.year }
        map[p.year].trend = p.value
      }
    }
    return Object.values(map).sort((a, b) => a.year - b.year)
  }, [rawData, selectedCountries, yearMin, yearMax, trendResult])

  const anomalyYears = useMemo(
    () => anomalyResult?.anomalies?.map(a => a.year) ?? [],
    [anomalyResult]
  )

  const filteredRows = useMemo(() =>
    rawData
      .filter(r => selectedCountries.includes(r.country) && r.year >= yearMin && r.year <= yearMax)
      .sort((a, b) => b.year - a.year || a.country.localeCompare(b.country))
  , [rawData, selectedCountries, yearMin, yearMax])

  async function saveAnalysis() {
    setSaving(true)
    try {
      await createAnalysis({
        title: saveForm.title.trim(),
        description: saveForm.description.trim() || null,
        indicator_code: selectedIndicator.code,
        countries: selectedCountries,
        year_start: yearMin,
        year_end: yearMax,
        config: trendResult ?? {},
      })
      navigate('/dashboard')
    } catch (e) {
      setError(e.response?.data?.detail ?? 'Failed to save analysis.')
      setSaving(false)
    }
  }

  const hasResults = trendResult || anomalyResult

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 pb-28 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">Explorer</h1>
        <p className="text-slate-400 font-sans text-sm">
          Select any WHO indicator to visualise trends and detect anomalies
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2.5 bg-crimson/10 border border-crimson/30 text-crimson rounded-xl px-4 py-3 text-sm font-sans">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mt-0.5 shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* ── Indicator selector ── */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5">
        <label className="block font-sans text-xs text-slate-500 mb-2 uppercase tracking-widest">
          Indicator
        </label>
        <div className="relative">
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setShowDropdown(true) }}
            onFocus={() => setShowDropdown(true)}
            placeholder={loading.indicators ? 'Loading…' : 'Search by name or code (e.g. "malaria" or "MALARIA_EST_DEATHS")'}
            disabled={loading.indicators}
            className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm
              font-sans text-slate-100 placeholder:text-slate-600 outline-none
              focus:border-teal/40 focus:shadow-[0_0_0_3px_rgba(0,212,170,0.07)] transition-all"
          />
          {loading.indicators && (
            <Spinner size="sm" className="absolute right-3 top-1/2 -translate-y-1/2" />
          )}

          {showDropdown && filteredIndicators.length > 0 && !loading.indicators && (
            <div className="absolute z-30 mt-1.5 w-full bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
              <div className="max-h-56 overflow-y-auto divide-y divide-white/[0.04]">
                {filteredIndicators.map(ind => (
                  <button
                    key={ind.code}
                    onMouseDown={() => loadIndicatorData(ind)}
                    className="w-full text-left px-4 py-2.5 hover:bg-teal/10 transition-colors flex items-center gap-3"
                  >
                    <span className="font-mono text-[10px] text-teal shrink-0 bg-teal/10 border border-teal/20 rounded px-1.5 py-0.5 whitespace-nowrap">
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

      {/* ── Controls: countries + year range ── */}
      {rawData.length > 0 && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5 space-y-4">
          {/* Country chips */}
          <div>
            <p className="font-sans text-xs text-slate-500 mb-2.5 uppercase tracking-widest">
              Countries <span className="text-slate-700 normal-case">— select up to {MAX_COUNTRIES}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {availableCountries.map(c => (
                <button
                  key={c}
                  onClick={() => toggleCountry(c)}
                  className={`font-mono text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    selectedCountries.includes(c)
                      ? 'bg-teal/10 text-teal border-teal/30 shadow-[0_0_8px_rgba(0,212,170,0.12)]'
                      : 'text-slate-600 border-white/10 hover:border-white/20 hover:text-slate-300'
                  } ${!selectedCountries.includes(c) && selectedCountries.length >= MAX_COUNTRIES ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Year range */}
          <div>
            <p className="font-sans text-xs text-slate-500 mb-2.5 uppercase tracking-widest">Year range</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={yearMin}
                min={dataYearBounds[0]}
                max={yearMax - 1}
                onChange={e => { setYearMin(Number(e.target.value)); setTrendResult(null); setAnomalyResult(null) }}
                className="w-24 bg-slate-800/50 border border-white/10 rounded-lg px-3 py-1.5
                  font-mono text-sm text-slate-100 outline-none focus:border-teal/40 transition-colors text-center"
              />
              <span className="text-slate-600 font-mono text-sm">–</span>
              <input
                type="number"
                value={yearMax}
                min={yearMin + 1}
                max={dataYearBounds[1]}
                onChange={e => { setYearMax(Number(e.target.value)); setTrendResult(null); setAnomalyResult(null) }}
                className="w-24 bg-slate-800/50 border border-white/10 rounded-lg px-3 py-1.5
                  font-mono text-sm text-slate-100 outline-none focus:border-teal/40 transition-colors text-center"
              />
              <span className="text-slate-600 font-sans text-xs">
                ({dataYearBounds[0]}–{dataYearBounds[1]} available)
              </span>
            </div>
          </div>

          {/* Run button */}
          <button
            onClick={runAnalysis}
            disabled={!selectedCountries.length || loading.analysis}
            className="inline-flex items-center gap-2 bg-teal text-navy font-display font-bold px-5 py-2.5
              rounded-xl hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all
              shadow-[0_0_16px_rgba(0,212,170,0.25)]"
          >
            {loading.analysis && <Spinner size="sm" />}
            {loading.analysis ? 'Analysing…' : 'Run Analysis'}
          </button>
        </div>
      )}

      {/* Loading data spinner */}
      {loading.data && (
        <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
          <Spinner />
          <span className="font-sans text-sm">Loading WHO data…</span>
        </div>
      )}

      {/* ── Results ── */}
      {hasResults && (
        <div className="space-y-4">
          {/* Tab bar */}
          <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/10 rounded-xl w-full sm:w-fit">
            {[
              { key: 'trend', label: 'Trend Chart' },
              { key: 'anomalies', label: `Anomalies${anomalyYears.length ? ` (${anomalyYears.length})` : ''}` },
              { key: 'raw', label: 'Raw Data' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 sm:flex-none py-2 px-4 rounded-lg text-sm font-sans transition-all whitespace-nowrap ${
                  activeTab === key
                    ? 'bg-teal/10 text-teal border border-teal/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Trend tab */}
          {activeTab === 'trend' && trendResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatBadge
                  label="Direction"
                  value={`${TREND_ICON[trendResult.trend_direction] ?? '~'} ${trendResult.trend_direction}`}
                  highlight={trendResult.trend_direction === 'increasing'}
                />
                <StatBadge label="Slope / yr" value={trendResult.slope?.toFixed(4) ?? '–'} />
                <StatBadge
                  label="R² (fit quality)"
                  value={trendResult.r_squared?.toFixed(3) ?? '–'}
                  highlight={trendResult.r_squared > 0.7}
                />
                <StatBadge label="p-value" value={trendResult.p_value?.toFixed(4) ?? '–'} />
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <p className="font-sans text-sm text-slate-400">
                    <span className="text-slate-200 font-medium">{selectedIndicator?.name}</span>
                    <span className="ml-2 font-mono text-xs text-slate-600">{yearMin}–{yearMax}</span>
                  </p>
                  {anomalyYears.length > 0 && (
                    <span className="flex items-center gap-1.5 font-mono text-xs text-crimson">
                      <span className="w-4 border-t border-dashed border-crimson" />
                      anomaly years
                    </span>
                  )}
                </div>
                <TrendChart data={chartData} countries={selectedCountries} anomalyYears={anomalyYears} />
              </div>
            </div>
          )}

          {/* Anomalies tab */}
          {activeTab === 'anomalies' && anomalyResult && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5">
              {anomalyResult.anomalies?.length === 0 ? (
                <EmptyState
                  title="No anomalies detected"
                  message="The data shows no statistically significant deviations from the rolling 5-year baseline."
                />
              ) : (
                <div className="space-y-2">
                  <p className="font-sans text-sm text-slate-500 mb-3">
                    {anomalyResult.total_anomalies} anomalous year{anomalyResult.total_anomalies !== 1 ? 's' : ''} detected
                  </p>
                  {anomalyResult.anomalies.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 bg-crimson/5 border border-crimson/20 rounded-xl px-4 py-3
                        shadow-[0_0_12px_rgba(230,57,70,0.06)]"
                    >
                      <span className="font-mono font-medium text-crimson text-sm w-14 shrink-0">{a.year}</span>
                      {a.country && <span className="font-mono text-slate-500 text-xs">{a.country}</span>}
                      <span className="font-mono text-slate-300 text-sm">{a.value?.toFixed(3)}</span>
                      {a.deviation != null && (
                        <span className="ml-auto font-mono text-xs text-crimson shrink-0">
                          {a.deviation > 0 ? '+' : ''}{a.deviation.toFixed(2)} σ
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Raw data tab */}
          {activeTab === 'raw' && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/10">
                    <tr>
                      {['Country', 'Year', 'Value'].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-sans text-xs text-slate-500 font-medium uppercase tracking-widest">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredRows.map((r, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-2.5 font-mono text-slate-300 text-xs">{r.country}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-500 text-xs">{r.year}</td>
                        <td className="px-4 py-2.5 font-mono text-teal text-xs">{r.value?.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Save analysis */}
          {!showSave ? (
            <button
              onClick={() => setShowSave(true)}
              className="inline-flex items-center gap-2 text-sm font-sans text-slate-400 border border-white/10
                px-4 py-2.5 rounded-xl hover:text-teal hover:border-teal/30 hover:bg-teal/5 transition-all"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save this analysis
            </button>
          ) : (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
              <p className="font-display font-semibold text-white text-sm">Save analysis</p>
              <input
                value={saveForm.title}
                onChange={e => setSaveForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Give this analysis a title"
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm
                  font-sans text-slate-100 placeholder:text-slate-600 outline-none focus:border-teal/40 transition-all"
              />
              <textarea
                value={saveForm.description}
                onChange={e => setSaveForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional: describe what you found"
                rows={2}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm
                  font-sans text-slate-100 placeholder:text-slate-600 outline-none focus:border-teal/40 transition-all resize-none"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={saveAnalysis}
                  disabled={!saveForm.title.trim() || saving}
                  className="inline-flex items-center gap-2 bg-teal text-navy font-display font-bold px-4 py-2
                    rounded-lg text-sm hover:bg-teal/90 disabled:opacity-50 transition-all"
                >
                  {saving && <Spinner size="sm" />}
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => setShowSave(false)}
                  className="px-4 py-2 text-sm font-sans text-slate-500 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty prompt */}
      {!loading.indicators && !loading.data && !rawData.length && !error && (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-7 h-7">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          }
          title="Pick an indicator to start"
          message="Search any of the 2 000+ WHO Global Health Observatory indicators above to begin."
        />
      )}

      {/* Backdrop to close dropdown */}
      {showDropdown && (
        <div className="fixed inset-0 z-20" onClick={() => setShowDropdown(false)} />
      )}
    </div>
  )
}
