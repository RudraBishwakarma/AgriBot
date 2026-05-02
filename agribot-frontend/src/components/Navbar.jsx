import { useState, useEffect } from 'react'
import { User, Settings, Bell, Moon, Sun, Menu } from 'lucide-react'
import './Navbar.css'

export default function Navbar({ toggleMobileMenu }) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    // Read from local storage or default to light
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }
  return (
    <header className="navbar">
      <div className="navbar-logo">
        <button className="navbar-mobile-menu-btn" onClick={toggleMobileMenu}>
          <Menu size={24} />
        </button>
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
          <button className="navbar-icon-btn" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
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