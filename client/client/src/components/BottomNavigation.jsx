import Icon from './Icons.jsx'

const items = [
  { label: 'Home', path: '/dashboard', icon: 'home' },
  { label: 'Add', path: '/readings/new', icon: 'add' },
  { label: 'History', path: '/history', icon: 'history' },
  { label: 'Reports', path: '/reports', icon: 'reports' },
]

export default function BottomNavigation({ activePath, onNavigate }) {
  return (
    <nav className="bottom-navigation" aria-label="Mobile navigation">
      {items.map(item => <button className={`bottom-nav-item${activePath === item.path ? ' active' : ''}`} type="button" key={item.path} onClick={() => onNavigate(item.path)} aria-current={activePath === item.path ? 'page' : undefined}><Icon name={item.icon} size={20} /><span>{item.label}</span></button>)}
    </nav>
  )
}
