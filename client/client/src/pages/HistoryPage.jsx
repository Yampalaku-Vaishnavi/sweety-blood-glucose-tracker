import { useEffect, useState } from 'react'
import BottomNavigation from '../components/BottomNavigation.jsx'
import Icon from '../components/Icons.jsx'
import Sidebar from '../components/Sidebar.jsx'
import { utcDateString } from '../services/dateUtils.js'
import { deleteReading, listReadings, updateReading } from '../services/readingService.js'
import './FeaturePages.css'

const timeSlots = ['Morning (fasting)', 'After breakfast', 'After lunch', 'After dinner']

function normalizeDate(value) {
  return String(value || '').slice(0, 10)
}

function formatDate(value) {
  const date = new Date(`${normalizeDate(value)}T00:00:00`)
  return Number.isNaN(date.getTime()) ? normalizeDate(value) : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function ReadingEditor({ reading, onSave, onCancel, saving }) {
  const [date, setDate] = useState(normalizeDate(reading.reading_date))
  const [slot, setSlot] = useState(reading.time_slot)
  const [value, setValue] = useState(String(reading.glucose_value))
  const [error, setError] = useState('')

  function submit(event) {
    event.preventDefault()
    const number = Number(value)
    if (!Number.isInteger(number) || number < 40 || number > 600) return setError('Enter a whole number between 40 and 600 mg/dL.')
    if (date > utcDateString()) return setError('A future date is not allowed.')
    onSave({ reading_date: date, time_slot: slot, glucose_value: number }, setError)
  }

  return <form className="inline-reading-editor" onSubmit={submit} noValidate>{error && <div className="feature-notice error" role="alert">{error}</div>}<label>Date<input type="date" value={date} max={utcDateString()} onChange={event => setDate(event.target.value)} required /></label><label>Time slot<select value={slot} onChange={event => setSlot(event.target.value)}>{timeSlots.map(item => <option key={item}>{item}</option>)}</select></label><label>Glucose (mg/dL)<input type="number" min="40" max="600" step="1" value={value} onChange={event => setValue(event.target.value)} required /></label><div className="editor-actions"><button className="feature-primary compact" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button><button className="feature-secondary compact" type="button" onClick={onCancel}>Cancel</button></div></form>
}

export default function HistoryPage({ onNavigate, onLogout }) {
  const [dateFilter, setDateFilter] = useState('')
  const [readings, setReadings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [pendingId, setPendingId] = useState(null)
  const [notice, setNotice] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let cancelled = false
    listReadings(dateFilter || undefined)
      .then(response => { if (!cancelled) setReadings((response.readings || []).map(reading => ({ ...reading, reading_date: normalizeDate(reading.reading_date), glucose_value: Number(reading.glucose_value) }))) })
      .catch(requestError => { if (!cancelled) setError(requestError.message || 'Unable to load readings.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [dateFilter, reload])

  async function saveEdit(id, values, setInlineError) {
    setPendingId(id)
    try {
      await updateReading(id, values)
      setEditing(null)
      setNotice('Reading updated.')
      setLoading(true)
      setReload(current => current + 1)
    } catch (requestError) {
      setInlineError(requestError.message || 'Unable to update this reading.')
    } finally {
      setPendingId(null)
    }
  }

  async function removeReading(reading) {
    if (!window.confirm(`Delete the ${reading.time_slot.toLowerCase()} reading from ${formatDate(reading.reading_date)}?`)) return
    setPendingId(reading.id)
    setError('')
    setNotice('')
    try {
      await deleteReading(reading.id)
      setNotice('Reading deleted.')
      setLoading(true)
      setReload(current => current + 1)
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete this reading.')
    } finally {
      setPendingId(null)
    }
  }

  return <div className="dashboard-shell"><Sidebar activePath="/history" onNavigate={onNavigate} onLogout={onLogout} /><main className="dashboard-main feature-main"><header className="feature-topbar"><button className="feature-back" type="button" onClick={() => onNavigate('/dashboard')}><Icon name="arrow" size={16} /> Back to dashboard</button><button className="feature-primary compact" type="button" onClick={() => onNavigate('/readings/new')}><Icon name="add" size={16} /> Add reading</button></header><section className="feature-content history-content" aria-labelledby="history-title"><span className="card-eyebrow">YOUR GLUCOSE LOG</span><h1 id="history-title">Reading history</h1><p className="feature-lead">Review and manage the readings in your account.</p><div className="history-toolbar"><label htmlFor="history-date">Filter by date</label><input id="history-date" type="date" value={dateFilter} onChange={event => { setLoading(true); setError(''); setDateFilter(event.target.value); setNotice('') }} /><button className="feature-secondary" type="button" onClick={() => { setLoading(true); setError(''); setDateFilter('') }} disabled={!dateFilter}>Clear filter</button><span className="history-count">{readings.length} {readings.length === 1 ? 'reading' : 'readings'}</span></div>{notice && <div className="feature-notice success" role="status">{notice}</div>}{error && <div className="feature-state error-state" role="alert"><span className="state-symbol">!</span><h2>We couldn't load your readings</h2><p>{error}</p><button className="feature-secondary" type="button" onClick={() => { setLoading(true); setError(''); setReload(value => value + 1) }}>Try again</button></div>}{loading && <div className="feature-state" role="status"><span className="loading-dot" /> Loading your readings…</div>}{!loading && !error && readings.length === 0 && <div className="feature-empty"><span className="empty-icon"><Icon name="history" size={24} /></span><h2>No readings yet</h2><p>{dateFilter ? 'There are no readings for this date. Try clearing the filter.' : 'Add your first reading to start building your personal history.'}</p><button className="feature-primary" type="button" onClick={() => onNavigate('/readings/new')}>Add a reading <Icon name="arrow" size={16} /></button></div>}{!loading && !error && readings.length > 0 && <div className="history-list">{readings.map(reading => <article className="history-card" key={reading.id}><div className="history-reading-icon"><Icon name="pulse" size={19} /></div><div className="history-reading-main"><strong>{reading.time_slot}</strong><span>{formatDate(reading.reading_date)}</span></div><div className="history-reading-value"><strong>{reading.glucose_value}</strong><span>mg/dL</span></div><div className="history-card-actions"><button type="button" className="icon-action" onClick={() => { setEditing(editing === reading.id ? null : reading.id); setNotice('') }} aria-label={`Edit ${reading.time_slot} reading`} title="Edit reading"><Icon name="edit" size={17} /></button><button type="button" className="icon-action danger" onClick={() => removeReading(reading)} disabled={pendingId === reading.id} aria-label={`Delete ${reading.time_slot} reading`} title="Delete reading"><Icon name="trash" size={17} /></button></div>{editing === reading.id && <ReadingEditor reading={reading} saving={pendingId === reading.id} onCancel={() => setEditing(null)} onSave={(values, setInlineError) => saveEdit(reading.id, values, setInlineError)} />}</article>)}</div>}</section></main><BottomNavigation activePath="/history" onNavigate={onNavigate} /></div>
}
