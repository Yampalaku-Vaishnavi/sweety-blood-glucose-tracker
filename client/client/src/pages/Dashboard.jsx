import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../services/api.js'
import BottomNavigation from '../components/BottomNavigation.jsx'
import DashboardHeader from '../components/DashboardHeader.jsx'
import DailySummary from '../components/DailySummary.jsx'
import GlucoseChart from '../components/GlucoseChart.jsx'
import GlucoseOverview from '../components/GlucoseOverview.jsx'
import Icon from '../components/Icons.jsx'
import Sidebar from '../components/Sidebar.jsx'
import { utcDateString } from '../services/dateUtils.js'
import './Dashboard.css'

const timeSlotOrder = ['Morning (fasting)', 'After breakfast', 'After lunch', 'After dinner']

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

function DashboardMetrics({ readings }) {
  const values = readings.map(reading => Number(reading.glucose_value)).filter(Number.isFinite)
  const average = values.length ? (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1) : null
  const metrics = [
    { label: 'Average', value: average, icon: 'drop', tone: 'blue' },
    { label: 'Highest', value: values.length ? Math.max(...values) : null, icon: 'trendUp', tone: 'rose' },
    { label: 'Lowest', value: values.length ? Math.min(...values) : null, icon: 'trendDown', tone: 'green' },
  ]
  return <div className="dashboard-metrics">{metrics.map(metric => <article className={`dashboard-metric ${metric.tone}`} key={metric.label}><span className="dashboard-metric-icon"><Icon name={metric.icon} size={20} /></span><span className="dashboard-metric-copy"><small>{metric.label}</small><strong>{metric.value == null ? '—' : metric.value}<em>mg/dL</em></strong></span></article>)}</div>
}

function HealthInsight({ readings }) {
  const count = readings.length
  return <article className="health-insight-card"><div className="health-insight-heading"><span className="health-insight-icon"><Icon name="pulse" size={20} /></span><div><span className="card-eyebrow">A SMALL DAILY HABIT</span><h2>Health insight</h2></div></div><p>{count ? `You have recorded ${count} ${count === 1 ? 'reading' : 'readings'} today. Keeping your log up to date helps you review your own patterns over time.` : 'Your daily summary will appear here after you add your first reading.'}</p><span className="insight-count"><Icon name="check" size={15} /> {count} of 4 daily slots recorded</span></article>
}

export default function Dashboard({ session, path, onNavigate, onLogout }) {
  const today = useMemo(() => utcDateString(), [])
  const currentDate = useMemo(() => new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(`${today}T12:00:00`)), [today])
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

  return <div className="dashboard-shell"><Sidebar activePath={path} onNavigate={onNavigate} onLogout={onLogout} /><main className="dashboard-main"><DashboardHeader name={session?.user?.name} currentDate={currentDate} onLogout={onLogout} onOpenProfile={() => onNavigate('/profile')} /><div className="dashboard-content-area">{status === 'loading' && <DashboardLoading />}{status === 'error' && <DashboardError message={error} onRetry={retry} />}{status === 'success' && dashboardData && <><QuickActions onNavigate={onNavigate} /><div className="dashboard-top-grid"><GlucoseOverview reading={latestReading} /><DailySummary readings={dashboardData.dailyReadings} /></div><div className="dashboard-lower-grid"><GlucoseChart readings={dashboardData.readings} /><div className="dashboard-side-insights"><DashboardMetrics readings={dashboardData.dailyReadings} /><HealthInsight readings={dashboardData.dailyReadings} /></div></div></>}</div></main><BottomNavigation activePath={path} onNavigate={onNavigate} /></div>
}
