import { User, Settings, Bell } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-logo">
        <span className="navbar-dot" />
        <span className="navbar-title">AgriBot</span>
        <span className="navbar-badge">v1.0</span>
      </div>

      <div className="navbar-right">
        <div className="navbar-status">
          <span className="status-pulse" />
          <span>Car online</span>
        </div>
        
        <div className="navbar-actions">
          <button className="navbar-icon-btn">
            <Bell size={18} />
            <span className="navbar-notification-dot"></span>
          </button>
          <button className="navbar-icon-btn">
            <Settings size={18} />
          </button>
          <button className="navbar-icon-btn navbar-profile">
            <User size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}