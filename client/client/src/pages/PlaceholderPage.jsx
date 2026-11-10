import Icon from '../components/Icons.jsx'
import Sidebar from '../components/Sidebar.jsx'
import BottomNavigation from '../components/BottomNavigation.jsx'

const pageContent = {
  '/readings/new': { title: 'Add a reading', description: 'Your reading form will be available here in the next step.', icon: 'add' },
  '/history': { title: 'Reading history', description: 'Your complete reading history will be available here soon.', icon: 'history' },
  '/reports': { title: 'Reports', description: 'Your glucose reports will be available here soon.', icon: 'reports' },
}

export default function PlaceholderPage({ path, onNavigate, onLogout }) {
  const page = pageContent[path] || pageContent['/readings/new']
  return <div className="dashboard-shell"><Sidebar activePath={path} onNavigate={onNavigate} onLogout={onLogout} /><main className="dashboard-main placeholder-main"><header className="placeholder-header"><button className="back-link" type="button" onClick={() => onNavigate('/dashboard')}><span aria-hidden="true">←</span> Back to dashboard</button></header><section className="placeholder-content"><span className="placeholder-large-icon"><Icon name={page.icon} size={28} /></span><span className="card-eyebrow">COMING NEXT</span><h1>{page.title}</h1><p>{page.description}</p><button className="primary-action" type="button" onClick={() => onNavigate('/dashboard')}>Return to dashboard <Icon name="arrow" size={17} /></button></section></main><BottomNavigation activePath={path} onNavigate={onNavigate} /></div>
}
