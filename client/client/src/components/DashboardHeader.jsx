import Icon from './Icons.jsx'

function initials(name) {
  return (name || 'Sweety').trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('')
}

export default function DashboardHeader({ name, currentDate, onLogout, onOpenProfile }) {
  return (
    <header className="dashboard-header">
      <div className="greeting-block">
        <p className="greeting-overline">YOUR PERSONAL OVERVIEW</p>
        <h1>Hello, {name || 'there'}</h1>
        <p className="greeting-subtitle">Here's your glucose overview</p>
      </div>
      <div className="header-actions">
        <div className="today-date"><Icon name="calendar" size={17} /><span>{currentDate}</span></div>
        <button className="profile-avatar" type="button" onClick={onOpenProfile} aria-label="Open user profile" title="Open profile">{initials(name)}</button>
        <button className="header-logout" type="button" onClick={onLogout} aria-label="Log out"><Icon name="logout" size={18} /><span>Log out</span></button>
      </div>
    </header>
  )
}
