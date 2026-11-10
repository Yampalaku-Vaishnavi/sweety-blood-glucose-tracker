import Icon from './Icons.jsx'

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T12:00:00`))
}

export default function GlucoseOverview({ reading }) {
  return (
    <section className="overview-card" aria-labelledby="latest-reading-title">
      <div className="overview-topline"><div><span className="card-eyebrow">GLUCOSE OVERVIEW</span><h2 id="latest-reading-title">Latest reading</h2></div><span className="overview-icon"><Icon name="pulse" size={21} strokeWidth={2} /></span></div>
      {reading ? <>
        <div className="latest-reading-value"><strong>{reading.glucose_value}</strong><span>mg/dL</span></div>
        <div className="latest-reading-meta"><span className="reading-meta-dot" /><span>{formatDate(reading.reading_date)}</span><span className="meta-divider">·</span><span>{reading.time_slot}</span></div>
      </> : <div className="overview-empty"><span className="empty-pulse"><Icon name="pulse" size={25} /></span><p>No glucose readings yet. Start tracking your glucose today.</p></div>}
    </section>
  )
}
