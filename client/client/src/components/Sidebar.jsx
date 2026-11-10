import Icon from './Icons.jsx'

const items = [
  { label: 'Dashboard', path: '/dashboard', icon: 'home' },
  { label: 'Add Reading', path: '/readings/new', icon: 'add' },
  { label: 'History', path: '/history', icon: 'history' },
  { label: 'Reports', path: '/reports', icon: 'reports' },
]

function BrandMark() {
  return <span className="sidebar-brand-mark" aria-hidden="true"><Icon name="pulse" size={20} strokeWidth={2.2} /></span>
}

export default function Sidebar({ activePath, onNavigate, onLogout }) {
  return (
    <aside className="dashboard-sidebar">
      <button className="sidebar-brand" type="button" onClick={() => onNavigate('/dashboard')}><BrandMark /><span>Sweety<span className="brand-period">.</span></span></button>
      <p className="sidebar-label">YOUR SPACE</p>
      <nav className="sidebar-links" aria-label="Main navigation">
        {items.map(item => <button className={`sidebar-link${activePath === item.path ? ' active' : ''}`} type="button" key={item.path} onClick={() => onNavigate(item.path)} aria-current={activePath === item.path ? 'page' : undefined}><Icon name={item.icon} size={19} /><span>{item.label}</span>{activePath === item.path && <span className="active-indicator" />}</button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-tip"><span className="tip-sparkle">✦</span><strong>One day at a time</strong><span>Your small habits make a meaningful difference.</span></div>
        <button className="sidebar-link sidebar-logout" type="button" onClick={onLogout}><Icon name="logout" size={19} /><span>Log out</span></button>
      </div>
    </aside>
  )
}
