import { useCallback, useEffect, useState } from 'react'
import { clearSession, getSession, saveSession } from './services/authStorage.js'
import { login, register } from './services/authService.js'
import { resolveRouteRedirect } from './services/routeGuard.js'
import Dashboard from './pages/Dashboard.jsx'
import ProfilePage from './pages/Profile.jsx'
import AddReadingPage from './pages/AddReadingPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import Icon from './components/Icons.jsx'
import './App.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function useBrowserRouter() {
  const [location, setLocation] = useState(() => window.location.pathname + window.location.search)
  useEffect(() => {
    const onPopState = () => setLocation(window.location.pathname + window.location.search)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  const navigate = useCallback((path, replace = false) => {
    window.history[replace ? 'replaceState' : 'pushState']({}, '', path)
    setLocation(window.location.pathname + window.location.search)
  }, [])
  return { location, pathname: location.split('?')[0], navigate }
}

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none"><rect x="1" y="1" width="38" height="38" rx="13" fill="currentColor" /><path d="M8 20h6l3.1-6.2 5.2 13L26 18l2.2 2H33" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
}

function HealthIllustration() {
  return (
    <div className="health-illustration" aria-hidden="true">
      <div className="illustration-glow" />
      <div className="glucose-meter-illustration"><span className="meter-screen"><svg viewBox="0 0 48 25" fill="none"><path d="M2 14h9l5-10 7 18 6-13 5 7h12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg><small>mg/dL</small></span><span className="meter-button" /><span className="meter-side-button" /></div>
      <div className="insight-card">
        <div className="insight-heading"><span className="insight-icon"><span /></span><span>Daily rhythm</span><span className="insight-dots">•••</span></div>
        <div className="chart-area">
          <div className="chart-grid"><i /><i /><i /></div>
          <svg viewBox="0 0 360 118" preserveAspectRatio="none">
            <defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#8863d8" stopOpacity=".2" /><stop offset="1" stopColor="#8863d8" stopOpacity="0" /></linearGradient></defs>
            <path d="M0 84 C28 82 34 67 57 71 S88 91 112 72 S146 39 169 52 S204 87 226 67 S255 54 279 59 S314 38 336 45 S348 48 360 31 V118 H0Z" fill="url(#chart-fill)" />
            <path d="M0 84 C28 82 34 67 57 71 S88 91 112 72 S146 39 169 52 S204 87 226 67 S255 54 279 59 S314 38 336 45 S348 48 360 31" fill="none" stroke="#805dc3" strokeWidth="3" strokeLinecap="round" />
            <circle cx="336" cy="45" r="5" fill="white" stroke="#805dc3" strokeWidth="3" />
          </svg>
        </div>
        <div className="chart-labels"><span>Morning</span><span>Afternoon</span><span>Evening</span></div>
      </div>
      <div className="floating-note"><span className="note-check">✓</span><span><strong>Small steps</strong><small>add up over time</small></span></div>
    </div>
  )
}

function Field({ id, label, type = 'text', value, onChange, placeholder, autoComplete, error, inputMode, passwordVisible, onTogglePassword }) {
  const errorId = id + '-error'
  return (
    <div className={'form-field' + (error ? ' has-error' : '')}>
      <label htmlFor={id}>{label}</label>
      <div className={onTogglePassword ? 'form-input-wrap password-input-wrap' : 'form-input-wrap'}>
        <input id={id} name={id} type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} inputMode={inputMode} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} required />
        {onTogglePassword && <button className="password-toggle" type="button" onClick={onTogglePassword} aria-label={passwordVisible ? 'Hide password' : 'Show password'} aria-pressed={passwordVisible}><Icon name={passwordVisible ? 'eyeOff' : 'eye'} size={18} /></button>}
      </div>
      {error && <span className="field-error" id={errorId}>{error}</span>}
    </div>
  )
}

function AuthFrame({ children, onNavigate, mode = 'signup' }) {
  return (
    <main className={'auth-page ' + mode + '-page'}>
      <header className="topbar">
        <button className="brand-button" type="button" onClick={() => onNavigate('/')} aria-label="Sweety home"><BrandMark /><span className="brand-lockup"><span className="brand-name">Sweety<span>.</span></span><small>Blood Glucose Tracker</small></span></button>
        <div className="topbar-note"><span className="privacy-dot" /> Your health journey, kept personal</div>
      </header>
      <div className="auth-layout">
        <section className="welcome-panel" aria-labelledby="welcome-title">
          <div className="welcome-copy"><span className="eyebrow"><span className="eyebrow-line" /> A gentler way to track</span><h1 id="welcome-title">Feel more in tune with <em>you.</em></h1><p>Keep your blood glucose readings organized and make space for a clearer picture of your day.</p></div>
          <HealthIllustration />
          <div className="welcome-footnote"><span className="footnote-icon">✳</span> Simple tracking. A little more peace of mind.</div>
        </section>
        <section className="form-panel" aria-label="Account access">{children}</section>
      </div>
      <footer className="page-footer"><span>© {new Date().getFullYear()} Sweety</span><span>Made for your everyday wellbeing</span></footer>
    </main>
  )
}

function AuthHeading({ title, subtitle }) {
  return <div className="form-heading"><span className="form-kicker">WELCOME TO SWEETY</span><h2>{title}</h2><p>{subtitle}</p></div>
}

function SignupPage({ navigate }) {
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(event) {
    const { name, value } = event.target
    setValues(current => ({ ...current, [name]: value }))
    setErrors(current => ({ ...current, [name]: '' }))
    setNotice('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!values.name.trim()) nextErrors.name = 'Enter your full name.'
    if (!values.email.trim()) nextErrors.email = 'Enter your email address.'
    else if (!emailPattern.test(values.email.trim())) nextErrors.email = 'Enter a valid email address.'
    if (!values.password) nextErrors.password = 'Create a password.'
    else if (values.password.length < 8) nextErrors.password = 'Use at least 8 characters.'
    if (!values.confirmPassword) nextErrors.confirmPassword = 'Confirm your password.'
    else if (values.password !== values.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setIsSubmitting(true)
    setNotice('')
    try {
      await register({ name: values.name.trim(), email: values.email.trim(), password: values.password })
      navigate('/login?registered=1')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthFrame onNavigate={navigate} mode="signup">
      <AuthHeading title="Create your account" subtitle="Start building a clearer picture of your health." />
      {notice && <div className="notice notice-error" role="alert">{notice}</div>}
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Field id="name" label="Full name" value={values.name} onChange={updateField} placeholder="Your name" autoComplete="name" error={errors.name} />
        <Field id="email" label="Email address" type="email" value={values.email} onChange={updateField} placeholder="you@example.com" autoComplete="email" inputMode="email" error={errors.email} />
        <Field id="password" label="Password" type="password" value={values.password} onChange={updateField} placeholder="At least 8 characters" autoComplete="new-password" error={errors.password} />
        <Field id="confirmPassword" label="Confirm password" type="password" value={values.confirmPassword} onChange={updateField} placeholder="Enter your password again" autoComplete="new-password" error={errors.confirmPassword} />
        <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating account…' : 'Create account'}<span aria-hidden="true">→</span></button>
      </form>
      <p className="switch-auth">Already have an account? <button type="button" className="text-button" onClick={() => navigate('/login')}>Sign in</button></p>
      <p className="form-disclaimer"><span aria-hidden="true">▣</span> Your information stays private and secure.</p>
    </AuthFrame>
  )
}

function LoginPage({ navigate, location, onLogin }) {
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState(() => {
    const query = new URLSearchParams(location.split('?')[1] || '')
    if (query.get('registered') === '1') return { type: 'success', text: 'Your account is ready. Sign in to continue.' }
    if (query.get('expired') === '1') return { type: 'error', text: 'Your session has expired. Please sign in again.' }
    return null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function updateField(event) {
    const { name, value } = event.target
    setValues(current => ({ ...current, [name]: value }))
    setErrors(current => ({ ...current, [name]: '' }))
    setNotice(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!values.email.trim()) nextErrors.email = 'Enter your email address.'
    else if (!emailPattern.test(values.email.trim())) nextErrors.email = 'Enter a valid email address.'
    if (!values.password) nextErrors.password = 'Enter your password.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setIsSubmitting(true)
    setNotice(null)
    try {
      const response = await login({ email: values.email.trim(), password: values.password })
      const nextSession = { token: response.token, user: response.user }
      saveSession(nextSession)
      onLogin(nextSession)
      navigate('/dashboard', true)
    } catch (error) {
      setNotice({ type: 'error', text: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthFrame onNavigate={navigate} mode="login">
      <AuthHeading title="Welcome back" subtitle="Sign in to pick up where you left off." />
      {notice && <div className={'notice notice-' + notice.type} role={notice.type === 'error' ? 'alert' : 'status'}>{notice.text}</div>}
      <form className="auth-form login-form" onSubmit={handleSubmit} noValidate>
        <Field id="email" label="Email address" type="email" value={values.email} onChange={updateField} placeholder="you@example.com" autoComplete="email" inputMode="email" error={errors.email} />
        <Field id="password" label="Password" type={showPassword ? 'text' : 'password'} value={values.password} onChange={updateField} placeholder="Enter your password" autoComplete="current-password" error={errors.password} passwordVisible={showPassword} onTogglePassword={() => setShowPassword(value => !value)} />
        <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in'}<span aria-hidden="true">→</span></button>
      </form>
      <p className="switch-auth">New to Sweety? <button type="button" className="text-button" onClick={() => navigate('/signup')}>Create an account</button></p>
      <p className="form-disclaimer"><span aria-hidden="true">▣</span> Your information stays private and secure.</p>
    </AuthFrame>
  )
}

function App() {
  const router = useBrowserRouter()
  const [session, setSession] = useState(() => getSession())
  const { pathname, navigate, location } = router

  useEffect(() => {
    const target = resolveRouteRedirect(pathname, Boolean(session))
    if (target) window.location.replace(target)
  }, [pathname, session])

  useEffect(() => {
    const onUnauthorized = () => {
      clearSession()
      setSession(null)
      window.location.replace('/login?expired=1')
    }
    window.addEventListener('sweety:unauthorized', onUnauthorized)
    return () => window.removeEventListener('sweety:unauthorized', onUnauthorized)
  }, [])

  function logout() {
    clearSession()
    setSession(null)
    navigate('/login', true)
  }

  if (pathname === '/signup') return session ? null : <SignupPage navigate={navigate} />
  if (pathname === '/login') return session ? null : <LoginPage navigate={navigate} location={location} onLogin={setSession} />
  if (pathname === '/dashboard') return session ? <Dashboard session={session} path={pathname} onLogout={logout} onNavigate={navigate} /> : null
  if (pathname === '/profile') return session ? <ProfilePage session={session} onNavigate={navigate} onLogout={logout} /> : null
  if (pathname === '/readings/new') return session ? <AddReadingPage onNavigate={navigate} onLogout={logout} /> : null
  if (pathname === '/history') return session ? <HistoryPage onNavigate={navigate} onLogout={logout} /> : null
  if (pathname === '/reports') return session ? <ReportsPage onNavigate={navigate} onLogout={logout} /> : null
  return null
}

export default App
