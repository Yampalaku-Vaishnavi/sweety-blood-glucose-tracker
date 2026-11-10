import { useEffect, useState } from 'react'
import BottomNavigation from '../components/BottomNavigation.jsx'
import GlucoseChart from '../components/GlucoseChart.jsx'
import Icon from '../components/Icons.jsx'
import Sidebar from '../components/Sidebar.jsx'
import { previousUtcMonthString, utcDateString } from '../services/dateUtils.js'
import { getDailyReport, getMonthToDateReport, getMonthlyReport } from '../services/reportService.js'
import './FeaturePages.css'

function formatDate(value) {
  const date = new Date(`${String(value || '').slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function formatPeriod(period) {
  if (!period?.startDate || !period?.endDate) return ''
  return period.startDate === period.endDate ? formatDate(period.startDate) : `${formatDate(period.startDate)} – ${formatDate(period.endDate)}`
}

function SummaryMetrics({ summary }) {
  const items = [
    ['Highest', summary?.highestGlucose, 'mg/dL'],
    ['Lowest', summary?.lowestGlucose, 'mg/dL'],
    ['Average', summary?.averageGlucose == null ? null : Number(summary.averageGlucose).toFixed(1), 'mg/dL'],
    ['Readings', summary?.totalReadings ?? 0, 'total'],
  ]
  return <div className="report-metrics">{items.map(([label, value, unit]) => <div className="report-metric" key={label}><span>{label}</span><strong>{value == null ? '—' : value}</strong><small>{unit}</small></div>)}</div>
}

function ReportState({ report, retry, emptyText }) {
  if (report.loading) return <div className="feature-state" role="status"><span className="loading-dot" /> Loading report…</div>
  if (report.error) return <div className="report-error" role="alert"><p>{report.error}</p><button className="feature-secondary" type="button" onClick={retry}>Try again</button></div>
  if (report.data?.summary?.totalReadings === 0) return <div className="report-empty"><span className="empty-icon"><Icon name="reports" size={20} /></span><p>{report.data.message || emptyText}</p></div>
  return null
}

function ReportCard({ title, eyebrow, report, retry, emptyText, children }) {
  return <article className="report-card"><div className="report-card-heading"><div><span className="card-eyebrow">{eyebrow}</span><h2>{title}</h2>{report.data?.period && <p>{formatPeriod(report.data.period)}</p>}</div><span className="report-card-icon"><Icon name="reports" size={19} /></span></div><ReportState report={report} retry={retry} emptyText={emptyText} />{!report.loading && !report.error && report.data?.summary?.totalReadings > 0 && <><SummaryMetrics summary={report.data.summary} />{children}</>}</article>
}

export default function ReportsPage({ onNavigate, onLogout }) {
  const today = utcDateString()
  const [dailyDate, setDailyDate] = useState(today)
  const [monthDate, setMonthDate] = useState(today)
  const [reportMonth, setReportMonth] = useState(previousUtcMonthString)
  const [reload, setReload] = useState(0)
  const [daily, setDaily] = useState({ loading: true, error: '', data: null })
  const [monthToDate, setMonthToDate] = useState({ loading: true, error: '', data: null })
  const [monthly, setMonthly] = useState({ loading: true, error: '', data: null })

  useEffect(() => {
    let cancelled = false
    const fetchReport = (request, setState) => {
      setState({ loading: true, error: '', data: null })
      request().then(data => { if (!cancelled) setState({ loading: false, error: '', data }) }).catch(error => { if (!cancelled) setState({ loading: false, error: error.message || 'Unable to load this report.', data: null }) })
    }
    fetchReport(() => getDailyReport(dailyDate), setDaily)
    fetchReport(() => getMonthToDateReport(monthDate), setMonthToDate)
    fetchReport(() => getMonthlyReport(reportMonth), setMonthly)
    return () => { cancelled = true }
  }, [dailyDate, monthDate, reportMonth, reload])

  const retry = () => setReload(value => value + 1)
  const maxDate = utcDateString()

  return <div className="dashboard-shell"><Sidebar activePath="/reports" onNavigate={onNavigate} onLogout={onLogout} /><main className="dashboard-main feature-main"><header className="feature-topbar"><button className="feature-back" type="button" onClick={() => onNavigate('/dashboard')}><Icon name="arrow" size={16} /> Back to dashboard</button></header><section className="feature-content reports-content" aria-labelledby="reports-title"><span className="card-eyebrow">YOUR HEALTH AT A GLANCE</span><div className="feature-title-line"><span className="feature-title-icon"><Icon name="reports" size={24} /></span><h1 id="reports-title">Glucose reports</h1></div><p className="feature-lead">Explore your recorded readings over time.</p><div className="report-controls"><label>Daily date<input type="date" value={dailyDate} max={maxDate} onChange={event => setDailyDate(event.target.value || today)} /></label><label>Month-to-date through<input type="date" value={monthDate} max={maxDate} onChange={event => setMonthDate(event.target.value || today)} /></label><label>Reporting month<input type="month" value={reportMonth} onChange={event => setReportMonth(event.target.value || previousUtcMonthString())} /></label></div><div className="reports-grid"><ReportCard title="Daily report" eyebrow="DAY SUMMARY" report={daily} retry={retry} emptyText="No readings found for this date. Try another day.">{daily.data?.readings?.length > 0 && <><GlucoseChart readings={daily.data.readings.map(reading => ({ ...reading, reading_date: String(reading.reading_date).slice(0, 10), glucose_value: Number(reading.glucose_value) }))} /><div className="report-reading-list"><h3>Individual readings</h3>{daily.data.readings.map(reading => <div className="report-reading-row" key={reading.id}><span>{reading.time_slot}</span><strong>{reading.glucose_value} <small>mg/dL</small></strong></div>)}</div></>}</ReportCard><ReportCard title="Month-to-date" eyebrow="MONTHLY PROGRESS" report={monthToDate} retry={retry} emptyText="No readings recorded in this month-to-date period.">{monthToDate.data?.readings?.length > 0 && <GlucoseChart readings={monthToDate.data.readings.map(reading => ({ ...reading, reading_date: String(reading.reading_date).slice(0, 10), glucose_value: Number(reading.glucose_value) }))} />}</ReportCard><ReportCard title="Previous-month report" eyebrow="MONTH AT A GLANCE" report={monthly} retry={retry} emptyText="No readings recorded for this month.">{monthly.data?.readings?.length > 0 && <GlucoseChart readings={monthly.data.readings.map(reading => ({ ...reading, reading_date: String(reading.reading_date).slice(0, 10), glucose_value: Number(reading.glucose_value) }))} />}</ReportCard></div></section></main><BottomNavigation activePath="/reports" onNavigate={onNavigate} /></div>
}
