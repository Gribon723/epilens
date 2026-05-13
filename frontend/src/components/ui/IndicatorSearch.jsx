import { useMemo, useState } from 'react'
import useDebounce from '../../hooks/useDebounce'
import Spinner from './Spinner'

export default function IndicatorSearch({
  indicators,
  loading,
  onSelect,
  label = 'Indicator',
  placeholder = 'Search indicator…',
  className = '',
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const debounced = useDebounce(query, 200)

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase()
    if (!q) return indicators.slice(0, 80)
    return indicators
      .filter((i) => i.name?.toLowerCase().includes(q) || i.code?.toLowerCase().includes(q))
      .slice(0, 80)
  }, [indicators, debounced])

  function handleSelect(ind) {
    setQuery(ind.name)
    setOpen(false)
    onSelect(ind)
  }

  return (
    <div className={`flex-1 min-w-0 ${className}`}>
      {label && (
        <label className="block font-sans text-xs text-slate-500 mb-2 uppercase tracking-widest">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={loading ? 'Loading…' : placeholder}
          disabled={loading}
          className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm
            font-sans text-slate-100 placeholder:text-slate-600 outline-none
            focus:border-teal/40 focus:shadow-[0_0_0_3px_rgba(0,212,170,0.07)] transition-all"
        />
        {loading && <Spinner size="sm" className="absolute right-3 top-1/2 -translate-y-1/2" />}

        {open && filtered.length > 0 && !loading && (
          <div className="absolute z-30 mt-1.5 w-full bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            <div className="max-h-52 overflow-y-auto divide-y divide-white/[0.04]">
              {filtered.map((ind) => (
                <button
                  key={ind.code}
                  onMouseDown={() => handleSelect(ind)}
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

      {open && <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />}
    </div>
  )
}
