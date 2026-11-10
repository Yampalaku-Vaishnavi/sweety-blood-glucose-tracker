import { useEffect, useState } from 'react'
import BottomNavigation from '../components/BottomNavigation.jsx'
import Icon from '../components/Icons.jsx'
import Sidebar from '../components/Sidebar.jsx'
import { utcDateString } from '../services/dateUtils.js'
import { createReading, listReadings } from '../services/readingService.js'
import './FeaturePages.css'

const timeSlots = ['Morning (fasting)', 'After breakfast', 'After lunch', 'After dinner']

export default function AddReadingPage({ onNavigate, onLogout }) {
  const today = utcDateString()
  const [date, setDate] = useState(today)
  const [timeSlot, setTimeSlot] = useState(timeSlots[0])
  const [glucoseValue, setGlucoseValue] = useState('')
  const [dateReadings, setDateReadings] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    listReadings(date)
      .then(response => { if (!cancelled) setDateReadings(response.readings || []) })
      .catch(requestError => { if (!cancelled) setError(requestError.message) })
      .finally(() => { if (!cancelled) setLoadingSlots(false) })
    return () => { cancelled = true }
  }, [date])

  const existingSlots = new Set(dateReadings.map(reading => reading.time_slot))
  const slotExists = existingSlots.has(timeSlot)
  const atDailyLimit = dateReadings.length >= timeSlots.length

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    const value = Number(glucoseValue)
    if (!date) return setError('Choose a reading date.')
    if (date > utcDateString()) return setError('A future date is not allowed.')
    if (glucoseValue.trim() === '' || !Number.isInteger(value)) return setError('Enter a whole-number glucose value.')
    if (value < 40 || value > 600) return setError('Glucose value must be between 40 and 600 mg/dL.')
    if (slotExists) return setError('A reading already exists for this date and time slot.')
    if (atDailyLimit) return setError('You already have four readings for this date.')

    setSaving(true)
    try {
      await createReading({ reading_date: date, time_slot: timeSlot, glucose_value: value })
      setSuccess('Reading saved. Your dashboard will refresh when you return.')
      setGlucoseValue('')
      const response = await listReadings(date)
      setDateReadings(response.readings || [])
    } catch (requestError) {
      setError(requestError.message || 'Unable to save this reading. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dashboard-shell">
      <Sidebar activePath="/readings/new" onNavigate={onNavigate} onLogout={onLogout} />
      <main className="dashboard-main feature-main reading-main">
        <header className="feature-topbar"><button className="feature-back" type="button" onClick={() => onNavigate('/dashboard')}><Icon name="arrow" size={16} /> Back to dashboard</button></header>
        <section className="feature-content reading-content" aria-labelledby="add-reading-title">
          <span className="card-eyebrow">DAILY CHECK-IN</span>
          <div className="feature-title-line"><span className="feature-title-icon"><Icon name="add" size={25} /></span><h1 id="add-reading-title">Add a reading</h1></div>
          <p className="feature-lead">Record a glucose check to keep your health picture up to date.</p>
          <div className="reading-layout">
            <article className="feature-card reading-form-card">
              <div className="feature-card-heading"><span className="feature-heading-icon violet"><Icon name="pulse" size={21} /></span><div><h2>Reading details</h2><p>All values are recorded in mg/dL.</p></div></div>
              {error && <div className="feature-notice error" role="alert">{error}</div>}
              {success && <div className="feature-notice success" role="status">{success}<button className="success-return" type="button" onClick={() => onNavigate('/dashboard')}>Return to dashboard</button></div>}
              <form className="reading-form" onSubmit={handleSubmit} noValidate>
                <div className="feature-field"><label htmlFor="reading-date">Reading date</label><input id="reading-date" type="date" value={date} max={today} onChange={event => { setDate(event.target.value); setLoadingSlots(true); setError(''); setSuccess('') }} required /><small className="field-hint">Dates follow UTC to match the API's future-date validation.</small></div>
                <div className="feature-field"><label htmlFor="reading-slot">Time slot</label><select id="reading-slot" value={timeSlot} onChange={event => { setTimeSlot(event.target.value); setError(''); setSuccess('') }} required>{timeSlots.map(slot => <option key={slot} value={slot}>{slot}{existingSlots.has(slot) ? ' — already recorded' : ''}</option>)}</select>{loadingSlots && <small className="field-hint">Checking readings for this date…</small>}{slotExists && <small className="field-hint warning">This slot already has a reading.</small>}</div>
                <div className="feature-field"><label htmlFor="glucose-value">Blood glucose value <span>(mg/dL)</span></label><div className="number-input-wrap"><input id="glucose-value" type="number" min="40" max="600" step="1" inputMode="numeric" value={glucoseValue} onChange={event => { setGlucoseValue(event.target.value); setError(''); setSuccess('') }} placeholder="Enter glucose value" required /><span>mg/dL</span></div><small className="field-hint">Enter a whole number between 40 and 600.</small></div>
                <button className="feature-primary" type="submit" disabled={saving || loadingSlots || slotExists || atDailyLimit}>{saving ? 'Saving reading…' : 'Save reading'}<Icon name="arrow" size={17} /></button>
              </form>
              <p className="feature-footnote"><Icon name="check" size={15} /> Your reading is private to your account.</p>
            </article>
            <aside className="reading-side-rail" aria-label="Reading guidance">
              <article className="reading-meter-card"><div className="reading-meter-art" aria-hidden="true"><div><Icon name="pulse" size={34} /></div><span /><span /></div><span className="card-eyebrow">A MOMENT FOR YOURSELF</span><h2>One check-in at a time</h2><p>Your reading will be saved securely to your personal health log.</p></article>
              <article className="reading-range-card"><span className="reading-range-icon"><Icon name="drop" size={19} /></span><div><span className="card-eyebrow">ACCEPTED VALUE</span><h2>40–600 mg/dL</h2><p>Enter a whole-number reading within this range.</p></div></article>
              <article className="reading-tip-card"><span className="reading-tip-icon"><Icon name="calendar" size={19} /></span><div><h3>Keep your log clear</h3><p>Choose the date and time slot that match this check-in. Each slot can be recorded once per day.</p></div></article>
            </aside>
          </div>
        </section>
      </main>
      <BottomNavigation activePath="/readings/new" onNavigate={onNavigate} />
    </div>
  )
}
