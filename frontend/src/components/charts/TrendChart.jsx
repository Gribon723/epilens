import {
  CartesianGrid, ComposedChart, Legend, Line,
  ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

export const CHART_COLORS = ['#00d4aa', '#60a5fa', '#f59e0b', '#a78bfa', '#fb7185', '#34d399', '#e2e8f0', '#94a3b8']

const TOOLTIP_STYLE = {
  backgroundColor: '#0f172a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  fontFamily: 'IBM Plex Mono, monospace',
  fontSize: '12px',
  color: '#f1f5f9',
  padding: '10px 14px',
}

export default function TrendChart({ data, countries, anomalyYears = [], height = 320 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
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
        <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#94a3b8', marginBottom: 4 }} />
        <Legend
          wrapperStyle={{ fontFamily: 'IBM Plex Sans', fontSize: '12px', color: '#94a3b8', paddingTop: 8 }}
        />

        {countries.map((c, i) => (
          <Line
            key={c}
            type="monotone"
            dataKey={c}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            connectNulls
          />
        ))}

        <Line
          type="monotone"
          dataKey="trend"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1.5}
          strokeDasharray="5 4"
          dot={false}
          name="Trend"
          legendType="plainline"
          connectNulls
        />

        {anomalyYears.map(year => (
          <ReferenceLine
            key={year}
            x={year}
            stroke="#e63946"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            label={{ value: '!', position: 'top', fill: '#e63946', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
