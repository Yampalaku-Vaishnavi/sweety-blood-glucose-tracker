import Icon from './Icons.jsx'

const slotShortNames = { 'Morning (fasting)': 'Morning', 'After breakfast': 'Breakfast', 'After lunch': 'Lunch', 'After dinner': 'Dinner' }

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(`${value}T12:00:00`))
}

export default function GlucoseChart({ readings }) {
  const points = readings.slice(-7)
  if (!points.length) return <section className="trend-card" aria-labelledby="trend-title"><div className="section-heading"><div><span className="card-eyebrow">YOUR READINGS</span><h2 id="trend-title">Glucose trend</h2></div><span className="trend-unit">mg/dL</span></div><div className="chart-empty"><span className="chart-empty-icon"><Icon name="reports" size={22} /></span><p>Your glucose trend will appear here after your first reading.</p></div></section>

  const values = points.map(point => point.glucose_value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || Math.max(max * 0.1, 10)
  const width = 720
  const top = 22
  const bottom = 155
  const left = 34
  const right = 20
  const xStep = points.length > 1 ? (width - left - right) / (points.length - 1) : 0
  const coords = points.map((point, index) => ({ ...point, x: points.length > 1 ? left + index * xStep : width / 2, y: top + ((max - point.glucose_value) / range) * (bottom - top) }))
  const path = coords.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const areaPath = `${path} L ${coords[coords.length - 1].x} ${bottom + 4} L ${coords[0].x} ${bottom + 4} Z`
  const middle = Math.round((max + min) / 2)

  return (
    <section className="trend-card" aria-labelledby="trend-title">
      <div className="section-heading"><div><span className="card-eyebrow">YOUR READINGS</span><h2 id="trend-title">Glucose trend</h2></div><span className="trend-unit">mg/dL</span></div>
      <div className="chart-legend"><span className="legend-line" />Recorded readings</div>
      <div className="chart-scroll"><svg className="trend-svg" viewBox={`0 0 ${width} 225`} role="img" aria-label={`Glucose trend for ${points.length} recent readings`}>
        <defs><linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#8863d8" stopOpacity=".16" /><stop offset="1" stopColor="#8863d8" stopOpacity="0" /></linearGradient></defs>
        {[top, (top + bottom) / 2, bottom].map(y => <line key={y} x1={left} x2={width - right} y1={y} y2={y} className="chart-grid-line" />)}
        <text x="0" y={top + 4} className="chart-y-label">{max}</text><text x="0" y={(top + bottom) / 2 + 4} className="chart-y-label">{middle}</text><text x="0" y={bottom + 4} className="chart-y-label">{min}</text>
        <path d={areaPath} fill="url(#trend-fill)" /><path d={path} className="trend-line" />
        {coords.map((point, index) => {
          const anchor = index === 0 ? 'start' : index === coords.length - 1 ? 'end' : 'middle'
          return <g key={point.id || `${point.reading_date}-${point.time_slot}`}><circle cx={point.x} cy={point.y} r="6" className="trend-point-halo" /><circle cx={point.x} cy={point.y} r="3.5" className="trend-point" /><text x={point.x} y="187" textAnchor={anchor} className="chart-date-label">{formatDate(point.reading_date)}</text><text x={point.x} y="203" textAnchor={anchor} className="chart-slot-label">{slotShortNames[point.time_slot] || point.time_slot}</text></g>
        })}
      </svg></div>
      <p className="chart-caption">Showing your {points.length} most recent {points.length === 1 ? 'reading' : 'readings'}.</p>
    </section>
  )
}
