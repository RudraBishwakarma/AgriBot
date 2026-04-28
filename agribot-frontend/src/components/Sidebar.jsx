import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Camera, Map, History, Stethoscope, MessageSquare, Bell } from 'lucide-react'
import './Sidebar.css'

const navItems = [
  {
    section: 'Monitor',
    links: [
      { to: '/',        label: 'Dashboard',       icon: LayoutDashboard },
      { to: '/camera',  label: 'Camera feed',     icon: Camera },
      { to: '/map',     label: 'GPS map',         icon: Map },
    ]
  },
  {
    section: 'Analyse',
    links: [
      { to: '/history',  label: 'History',        icon: History },
      { to: '/disease',  label: 'Disease checker', icon: Stethoscope },
    ]
  },
  {
    section: 'Assist',
    links: [
      { to: '/chat',    label: 'AI assistant',    icon: MessageSquare },
      { to: '/alerts',  label: 'Alerts',          icon: Bell },
    ]
  },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {navItems.map(group => (
        <div key={group.section}>
          <p className="sidebar-section">{group.section}</p>
          {group.links.map(link => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  'sidebar-link' + (isActive ? ' active' : '')
                }
              >
                <Icon size={16} className="sidebar-icon" />
                {link.label}
              </NavLink>
            )
          })}
        </div>
      ))}
    </aside>
  )
}