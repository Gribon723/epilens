import {
  CartesianGrid, ResponsiveContainer, Scatter,
  ScatterChart, Tooltip, XAxis, YAxis,
} from 'recharts'

const TOOLTIP_STYLE = {
  backgroundColor: '#0f172a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  fontFamily: 'IBM Plex Mono, monospace',
  fontSize: '12px',
  color: '#f1f5f9',
  padding: '10px 14px',
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div style={TOOLTIP_STYLE}>
      <p className="text-slate-400 text-xs mb-1">{d.country} {d.year}</p>
      <p className="text-teal text-xs">x: {d.x?.toFixed(3)}</p>
      <p className="text-blue-400 text-xs">y: {d.y?.toFixed(3)}</p>
    </div>
  )
}

export default function ScatterPlot({ data, xLabel = 'X', yLabel = 'Y', height = 320 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 8, right: 8, bottom: 24, left: -8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="x"
          name={xLabel}
          type="number"
          tick={{ fill: '#475569', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
          tickLine={false}
          axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
          label={{ value: xLabel, position: 'insideBottom', offset: -12, fill: '#475569', fontSize: 11, fontFamily: 'IBM Plex Sans' }}
        />
        <YAxis
          dataKey="y"
          name={yLabel}
          type="number"
          tick={{ fill: '#475569', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
          tickLine={false}
          axisLine={false}
          width={52}
          label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 12, fill: '#475569', fontSize: 11, fontFamily: 'IBM Plex Sans' }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.08)' }} />
        <Scatter data={data} fill="#00d4aa" fillOpacity={0.65} r={4} />
      </ScatterChart>
    </ResponsiveContainer>
  )
}
