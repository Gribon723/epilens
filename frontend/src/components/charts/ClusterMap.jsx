import { geoNaturalEarth1, geoPath } from 'd3-geo'
import isoCountries from 'i18n-iso-countries'
import { useMemo, useRef, useState } from 'react'
import { feature } from 'topojson-client'
import worldData from 'world-atlas/countries-110m.json'

const CLUSTER_FILLS = [
  'rgba(0,212,170,0.55)',
  'rgba(96,165,250,0.55)',
  'rgba(245,158,11,0.55)',
  'rgba(167,139,250,0.55)',
  'rgba(251,113,133,0.55)',
  'rgba(52,211,153,0.55)',
  'rgba(251,146,60,0.55)',
  'rgba(244,114,182,0.55)',
]
const CLUSTER_STROKES = [
  '#00d4aa', '#60a5fa', '#f59e0b', '#a78bfa',
  '#fb7185', '#34d399', '#fb923c', '#f472b6',
]

const WORLD_W = 960
const WORLD_H = 480

const countriesGeo = feature(worldData, worldData.objects.countries)

function numericToAlpha3(numericId) {
  const padded = String(numericId).padStart(3, '0')
  return isoCountries.numericToAlpha3(padded)
}

export default function ClusterMap({ clusterData }) {
  const svgRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)

  const alpha3Map = useMemo(() => {
    const map = {}
    for (const r of clusterData) map[r.country] = r
    return map
  }, [clusterData])

  const projection = useMemo(
    () => geoNaturalEarth1().fitSize([WORLD_W, WORLD_H], countriesGeo),
    []
  )

  const pathGen = useMemo(() => geoPath().projection(projection), [projection])

  function getFill(numericId) {
    const a3 = numericToAlpha3(numericId)
    const d = alpha3Map[a3]
    return d ? CLUSTER_FILLS[d.cluster % CLUSTER_FILLS.length] : 'rgba(255,255,255,0.04)'
  }

  function getStroke(numericId) {
    const a3 = numericToAlpha3(numericId)
    const d = alpha3Map[a3]
    return d ? CLUSTER_STROKES[d.cluster % CLUSTER_STROKES.length] : 'rgba(255,255,255,0.08)'
  }

  function getStrokeWidth(numericId) {
    const a3 = numericToAlpha3(numericId)
    return alpha3Map[a3] ? 0.7 : 0.3
  }

  function handleMouseMove(e, geo) {
    const a3 = numericToAlpha3(geo.id)
    const d = alpha3Map[a3]
    if (!d) { setTooltip(null); return }
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      country: a3,
      cluster: d.cluster,
      mean: d.mean_value,
    })
  }

  const clusterCount = new Set(clusterData.map(d => d.cluster)).size

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
      {/* Legend */}
      <div className="flex flex-wrap gap-2 px-4 pt-4 pb-2">
        {Array.from({ length: clusterCount }, (_, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: CLUSTER_STROKES[i % CLUSTER_STROKES.length] }}
            />
            <span className="font-mono text-xs text-slate-400">Cluster {i + 1}</span>
          </div>
        ))}
        <span className="ml-auto flex items-center gap-1.5 font-mono text-xs text-slate-600">
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          No data
        </span>
      </div>

      {/* Map */}
      <div className="relative px-2 pb-2">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
          className="w-full h-auto"
          onMouseLeave={() => setTooltip(null)}
        >
          {countriesGeo.features.map(geo => (
            <path
              key={geo.id}
              d={pathGen(geo) ?? ''}
              fill={getFill(geo.id)}
              stroke={getStroke(geo.id)}
              strokeWidth={getStrokeWidth(geo.id)}
              style={{ cursor: alpha3Map[numericToAlpha3(geo.id)] ? 'pointer' : 'default' }}
              onMouseMove={e => handleMouseMove(e, geo)}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}
        </svg>

        {tooltip && (
          <div
            className="absolute pointer-events-none z-20 bg-slate-900/95 border border-white/10
              rounded-xl px-3 py-2 shadow-xl backdrop-blur-sm"
            style={{ left: Math.min(tooltip.x + 14, WORLD_W - 120), top: tooltip.y - 60 }}
          >
            <p className="font-mono text-xs text-slate-200 font-medium">{tooltip.country}</p>
            <p className="font-mono text-xs mt-0.5" style={{ color: CLUSTER_STROKES[tooltip.cluster % CLUSTER_STROKES.length] }}>
              Cluster {tooltip.cluster + 1}
            </p>
            <p className="font-mono text-xs text-slate-500">
              Mean: {tooltip.mean?.toFixed(3) ?? '–'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
