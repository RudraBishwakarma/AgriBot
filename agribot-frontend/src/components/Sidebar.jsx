import { NavLink } from 'react-router-dom'
import './Sidebar.css'

const navItems = [
  {
    section: 'Monitor',
    links: [
      { to: '/',        label: 'Dashboard',      icon: '▦' },
      { to: '/camera',  label: 'Camera feed',     icon: '◎' },
      { to: '/map',     label: 'GPS map',         icon: '◈' },
    ]
  },
  {
    section: 'Analyse',
    links: [
      { to: '/history',  label: 'History',        icon: '↗' },
      { to: '/disease',  label: 'Disease checker', icon: '✦' },
    ]
  },
  {
    section: 'Assist',
    links: [
      { to: '/chat',    label: 'AI assistant',    icon: '◉' },
      { to: '/alerts',  label: 'Alerts',          icon: '◇' },
    ]
  },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {navItems.map(group => (
        <div key={group.section}>
          <p className="sidebar-section">{group.section}</p>
          {group.links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                'sidebar-link' + (isActive ? ' active' : '')
              }
            >
              <span className="sidebar-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </div>
      ))}
    </aside>
  )
}