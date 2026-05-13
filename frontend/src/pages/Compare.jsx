import { useMemo, useState } from 'react'
import { getBurden } from '../api/stats'
import BurdenChart from '../components/charts/BurdenChart'
import { CHART_COLORS } from '../components/charts/TrendChart'
import TrendChart from '../components/charts/TrendChart'
import EmptyState from '../components/ui/EmptyState'
import IndicatorSearch from '../components/ui/IndicatorSearch'
import Spinner from '../components/ui/Spinner'
import useIndicators from '../hooks/useIndicators'

const MAX_COUNTRIES = 8

export default function Compare() {
  const { indicators, loading: loadingIndicators, fetchData } = useIndicators()

  const [selectedIndicator, setSelectedIndicator] = useState(null)
  const [activeTab, setActiveTab] = useState('chart')
  const [burdenResult, setBurdenResult] = useState([])
  const [loadingBurden, setLoadingBurden] = useState(false)

  const [rawData, setRawData] = useState([])
  const [availableCountries, setAvailableCountries] = useState([])
  const [selectedCountries, setSelectedCountries] = useState([])
  const [yearMin, setYearMin] = useState(2000)
  const [yearMax, setYearMax] = useState(2023)
  const [dataYearBounds, setDataYearBounds] = useState([2000, 2023])

  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState(null)

  async function handleIndicatorSelect(indicator) {
    setSelectedIndicator(indicator)
    setRawData([])
    setSelectedCountries([])
    setBurdenResult([])
    setError(null)
    setLoadingData(true)
    try {
      const data = await fetchData(indicator.code)
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
      setLoadingData(false)
    }
  }

  function toggleCountry(c) {
    setSelectedCountries(prev =>
      prev.includes(c)
        ? prev.filter(x => x !== c)
        : prev.length < MAX_COUNTRIES ? [...prev, c] : prev
    )
  }

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

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5">
        <IndicatorSearch
          indicators={indicators}
          loading={loadingIndicators}
          onSelect={handleIndicatorSelect}
        />
      </div>

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

      {loadingData && (
        <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
          <Spinner />
          <span className="font-sans text-sm">Loading WHO data…</span>
        </div>
      )}

      {chartData.length > 0 && selectedCountries.length > 0 && (
        <div className="space-y-4">
          <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/10 rounded-xl w-full sm:w-fit">
            {[
              { key: 'chart', label: 'Line Chart' },
              { key: 'table', label: 'Stats Table' },
              { key: 'burden', label: 'Burden Index' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={async () => {
                  setActiveTab(key)
                  if (key === 'burden' && burdenResult.length === 0) {
                    setLoadingBurden(true)
                    try {
                      const filtered = rawData.filter(r =>
                        selectedCountries.includes(r.country) &&
                        r.year >= yearMin && r.year <= yearMax
                      )
                      setBurdenResult(await getBurden(filtered))
                    } catch { /* shown in UI */ }
                    finally { setLoadingBurden(false) }
                  }
                }}
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

          {activeTab === 'chart' && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5">
              <p className="font-sans text-sm text-slate-400 mb-4">
                <span className="text-slate-200 font-medium">{selectedIndicator?.name}</span>
                <span className="ml-2 font-mono text-xs text-slate-600">{yearMin}–{yearMax}</span>
              </p>
              <TrendChart data={chartData} countries={selectedCountries} height={340} />
            </div>
          )}

          {activeTab === 'table' && (
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
          )}

          {activeTab === 'burden' && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5">
              {loadingBurden ? (
                <div className="flex items-center justify-center gap-3 py-10 text-slate-500">
                  <Spinner />
                  <span className="font-sans text-sm">Computing burden index…</span>
                </div>
              ) : burdenResult.length > 0 ? (
                <>
                  <p className="font-sans text-sm text-slate-400 mb-1">
                    Relative burden score (0 = lowest, 1 = highest) across selected countries
                  </p>
                  <p className="font-mono text-xs text-slate-600 mb-4">
                    <span className="text-teal">■</span> low &nbsp;
                    <span className="text-blue-400">■</span> moderate &nbsp;
                    <span className="text-amber-400">■</span> high &nbsp;
                    <span className="text-crimson">■</span> very high
                  </p>
                  <BurdenChart data={burdenResult} />
                </>
              ) : (
                <p className="font-sans text-sm text-slate-500 py-8 text-center">
                  No burden data available.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {!loadingIndicators && !loadingData && !rawData.length && !error && (
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
    </div>
  )
}
