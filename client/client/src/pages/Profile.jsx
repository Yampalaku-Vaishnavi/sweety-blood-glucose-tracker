import BottomNavigation from '../components/BottomNavigation.jsx'
import Icon from '../components/Icons.jsx'
import Sidebar from '../components/Sidebar.jsx'
import './Profile.css'

function getInitial(name) {
  return name?.trim()?.[0]?.toUpperCase() || '?'
}

function ProfileDetail({ label, value, icon }) {
  return (
    <div className="profile-detail">
      <span className="profile-detail-icon"><Icon name={icon} size={17} /></span>
      <div className="profile-detail-copy"><span className="profile-detail-label">{label}</span><strong>{value || ''}</strong></div>
    </div>
  )
}

export default function ProfilePage({ session, onNavigate, onLogout }) {
  const user = session?.user || {}
  const initial = getInitial(user.name)

  return (
    <div className="dashboard-shell">
      <Sidebar activePath="/profile" onNavigate={onNavigate} onLogout={onLogout} />
      <main className="dashboard-main profile-main">
        <header className="profile-topbar">
          <button className="profile-back" type="button" onClick={() => onNavigate('/dashboard')}><Icon name="arrow" size={16} /> Back to Dashboard</button>
          <button className="profile-logout" type="button" onClick={onLogout}><Icon name="logout" size={17} /> Log out</button>
        </header>
        <section className="profile-content" aria-labelledby="profile-title">
          <span className="card-eyebrow">YOUR ACCOUNT</span>
          <h1 id="profile-title">User profile</h1>
          <p className="profile-intro">Your account details, all in one place.</p>

          <article className="profile-card">
            <div className="profile-identity">
              <div className="profile-avatar-large" aria-hidden="true">{initial}</div>
              <div className="profile-identity-copy"><h2>{user.name || ''}</h2><p>{user.email || ''}</p></div>
              <span className="read-only-pill"><Icon name="profile" size={14} /> Account</span>
            </div>
            <div className="profile-card-divider" />
            <div className="profile-section-heading"><div><span className="card-eyebrow">ACCOUNT INFORMATION</span><h3>Personal details</h3></div></div>
            <div className="profile-details-grid">
              <ProfileDetail label="Full name" value={user.name} icon="profile" />
              <ProfileDetail label="Email address" value={user.email} icon="mail" />
              <ProfileDetail label="Account ID" value={user.id} icon="id" />
            </div>
            <div className="profile-readonly-note"><span className="readonly-check"><Icon name="check" size={15} /></span><p>These details are read-only. Profile editing is not available yet.</p></div>
          </article>
          <button className="profile-logout-mobile" type="button" onClick={onLogout}><Icon name="logout" size={17} /> Log out</button>
        </section>
      </main>
      <BottomNavigation activePath="/profile" onNavigate={onNavigate} />
    </div>
  )
}
