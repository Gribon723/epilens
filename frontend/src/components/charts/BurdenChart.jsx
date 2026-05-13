import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const TOOLTIP_STYLE = {
  backgroundColor: '#0f172a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  fontFamily: 'IBM Plex Mono, monospace',
  fontSize: '12px',
  color: '#f1f5f9',
  padding: '10px 14px',
}

function barColor(score) {
  if (score >= 0.75) return '#e63946'
  if (score >= 0.5) return '#f59e0b'
  if (score >= 0.25) return '#60a5fa'
  return '#00d4aa'
}

export default function BurdenChart({ data, limit = 40 }) {
  const sorted = [...data]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(d => ({ ...d, country: d.country_code ?? d.country ?? '?' }))

  const chartHeight = Math.max(280, sorted.length * 26)

  return (
    <div style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 4, right: 32, bottom: 4, left: 8 }}
        >
          <XAxis
            type="number"
            domain={[0, 1]}
            tick={{ fill: '#475569', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            tickFormatter={v => v.toFixed(1)}
          />
          <YAxis
            dataKey="country"
            type="category"
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
            tickLine={false}
            axisLine={false}
            width={34}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value, name, props) => [
              value.toFixed(4),
              `Burden score — ${props.payload.country}`,
            ]}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={14}>
            {sorted.map(entry => (
              <Cell key={entry.country} fill={barColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
