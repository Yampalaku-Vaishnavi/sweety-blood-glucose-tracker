import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../services/api.js'
import BottomNavigation from '../components/BottomNavigation.jsx'
import DashboardHeader from '../components/DashboardHeader.jsx'
import DailySummary from '../components/DailySummary.jsx'
import GlucoseChart from '../components/GlucoseChart.jsx'
import GlucoseOverview from '../components/GlucoseOverview.jsx'
import Icon from '../components/Icons.jsx'
import Sidebar from '../components/Sidebar.jsx'
import './Dashboard.css'

const timeSlotOrder = ['Morning (fasting)', 'After breakfast', 'After lunch', 'After dinner']

function localDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function normalizeReadings(readings) {
  return readings.map(reading => ({ ...reading, reading_date: String(reading.reading_date || '').slice(0, 10), glucose_value: Number(reading.glucose_value) })).sort((first, second) => {
    const byDate = first.reading_date.localeCompare(second.reading_date)
    return byDate || timeSlotOrder.indexOf(first.time_slot) - timeSlotOrder.indexOf(second.time_slot)
  })
}

function DashboardLoading() {
  return <div className="dashboard-loading" role="status" aria-label="Loading your glucose dashboard"><div className="loading-card loading-overview" /><div className="loading-card loading-daily" /><div className="loading-card loading-trend" /></div>
}

function DashboardError({ message, onRetry }) {
  return <div className="dashboard-error" role="alert"><span className="error-icon">!</span><h2>We couldn't load your readings</h2><p>{message}</p><button type="button" className="retry-button" onClick={onRetry}><Icon name="history" size={16} /> Try again</button></div>
}

function QuickActions({ onNavigate }) {
  const actions = [
    { label: 'Add Reading', detail: 'Log a new glucose check', icon: 'add', path: '/readings/new', tone: 'violet' },
    { label: 'View History', detail: 'See your past readings', icon: 'history', path: '/history', tone: 'rose' },
    { label: 'View Reports', detail: 'Explore your summaries', icon: 'reports', path: '/reports', tone: 'blue' },
  ]
  return <section className="quick-actions" aria-label="Quick actions">{actions.map(action => <button className="quick-action" type="button" key={action.path} onClick={() => onNavigate(action.path)}><span className={`quick-action-icon ${action.tone}`}><Icon name={action.icon} size={20} /></span><span className="quick-action-copy"><strong>{action.label}</strong><small>{action.detail}</small></span><span className="quick-action-arrow" aria-hidden="true">↗</span></button>)}</section>
}

export default function Dashboard({ session, path, onNavigate, onLogout }) {
  const today = useMemo(() => localDateString(new Date()), [])
  const currentDate = useMemo(() => new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()), [])
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [dashboardData, setDashboardData] = useState(null)

  useEffect(() => {
    let cancelled = false
    const query = encodeURIComponent(today)
    Promise.all([apiRequest('/readings'), apiRequest(`/reports/daily?date=${query}`)])
      .then(([readingResponse, dailyReport]) => {
        if (cancelled) return
        setDashboardData({ readings: normalizeReadings(readingResponse.readings || []), dailyReadings: normalizeReadings(dailyReport.readings || []) })
        setError('')
        setStatus('success')
      })
      .catch(requestError => {
        if (cancelled) return
        setError(requestError.message || 'Please check your connection and try again.')
        setStatus('error')
      })
    return () => { cancelled = true }
  }, [session.token, today, attempt])

  const latestReading = dashboardData?.readings.at(-1) || null

  function retry() {
    setError('')
    setStatus('loading')
    setAttempt(value => value + 1)
  }

  return <div className="dashboard-shell"><Sidebar activePath={path} onNavigate={onNavigate} onLogout={onLogout} /><main className="dashboard-main"><DashboardHeader name={session?.user?.name} currentDate={currentDate} onLogout={onLogout} onOpenProfile={() => onNavigate('/profile')} /><div className="dashboard-content-area">{status === 'loading' && <DashboardLoading />}{status === 'error' && <DashboardError message={error} onRetry={retry} />}{status === 'success' && dashboardData && <><QuickActions onNavigate={onNavigate} /><div className="dashboard-top-grid"><GlucoseOverview reading={latestReading} /><DailySummary readings={dashboardData.dailyReadings} /></div><GlucoseChart readings={dashboardData.readings} /></>}</div></main><BottomNavigation activePath={path} onNavigate={onNavigate} /></div>
}
