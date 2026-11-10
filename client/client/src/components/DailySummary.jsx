import Icon from './Icons.jsx'

const slots = [
  { label: 'Morning (fasting)', icon: 'sunrise' },
  { label: 'After breakfast', icon: 'coffee' },
  { label: 'After lunch', icon: 'sun' },
  { label: 'After dinner', icon: 'moon' },
]

export default function DailySummary({ readings }) {
  const bySlot = new Map(readings.map(reading => [reading.time_slot, reading]))
  return (
    <section className="daily-card" aria-labelledby="daily-summary-title">
      <div className="section-heading"><div><span className="card-eyebrow">TODAY</span><h2 id="daily-summary-title">Daily summary</h2></div><span className="daily-count">{readings.length} of 4 recorded</span></div>
      <div className="daily-slot-list">
        {slots.map(slot => {
          const reading = bySlot.get(slot.label)
          return <div className={`daily-slot${reading ? ' recorded' : ''}`} key={slot.label}><span className="slot-icon"><Icon name={slot.icon} size={18} /></span><span className="slot-name">{slot.label}</span>{reading ? <span className="slot-reading"><strong>{reading.glucose_value}</strong><small>mg/dL</small></span> : <span className="slot-empty">Not recorded</span>}</div>
        })}
      </div>
    </section>
  )
}
