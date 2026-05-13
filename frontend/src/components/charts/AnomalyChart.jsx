import {
  CartesianGrid, ComposedChart, Line, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
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

function AnomalyDot({ cx, cy, payload, anomalyYears }) {
  if (!anomalyYears.includes(payload?.year)) {
    return <circle cx={cx} cy={cy} r={2} fill="rgba(255,255,255,0.15)" />
  }
  return (
    <g>
      <circle cx={cx} cy={cy} r={14} fill="#e63946" opacity={0.06}>
        <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.06;0.02;0.06" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r={7} fill="#e63946" opacity={0.2} />
      <circle cx={cx} cy={cy} r={4} fill="#e63946" opacity={0.7} />
      <circle cx={cx} cy={cy} r={2} fill="#e63946" />
    </g>
  )
}

function AnomalyActiveDot({ cx, cy }) {
  return <circle cx={cx} cy={cy} r={5} fill="#e63946" stroke="#0f172a" strokeWidth={2} />
}

export default function AnomalyChart({ data, country, anomalyYears = [], height = 300 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: -8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="year"
          type="number"
          domain={['dataMin', 'dataMax']}
          tick={{ fill: '#475569', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
          tickLine={false}
          axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
          allowDecimals={false}
        />
        <YAxis
          tick={{ fill: '#475569', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
          tickLine={false}
          axisLine={false}
          width={52}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const isAnomaly = anomalyYears.includes(label)
            return (
              <div style={TOOLTIP_STYLE}>
                <p style={{ color: isAnomaly ? '#e63946' : '#94a3b8', marginBottom: 4 }}>
                  {label} {isAnomaly ? '⚠ anomaly' : ''}
                </p>
                {payload.map(p => (
                  <p key={p.dataKey} style={{ color: isAnomaly ? '#e63946' : '#f1f5f9' }}>
                    {p.dataKey}: {p.value?.toFixed(3)}
                  </p>
                ))}
              </div>
            )
          }}
        />

        {anomalyYears.map(year => (
          <ReferenceLine
            key={year}
            x={year}
            stroke="rgba(230,57,70,0.15)"
            strokeWidth={20}
          />
        ))}

        <Line
          type="monotone"
          dataKey={country}
          stroke="#00d4aa"
          strokeWidth={2}
          connectNulls
          dot={<AnomalyDot anomalyYears={anomalyYears} />}
          activeDot={<AnomalyActiveDot />}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
