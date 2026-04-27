import './Navbar.css'

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-logo">
        <span className="navbar-dot" />
        <span className="navbar-title">AgriBot</span>
        <span className="navbar-badge">v1.0</span>
      </div>

      <div className="navbar-status">
        <span className="status-pulse" />
        <span>Car online</span>
      </div>
    </header>
  )
}