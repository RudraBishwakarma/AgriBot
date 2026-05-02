import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Camera from './pages/Camera'
import MapPage from './pages/MapPage'
import History from './pages/History'
import DiseaseChecker from './pages/DiseaseChecker'
import AIChat from './pages/AIChat'
import Alerts from './pages/Alerts'
import './App.css'

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar toggleMobileMenu={toggleMobileMenu} />
        <div className="app-body">
          <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
          <main className="main-content">
            <Routes>
              <Route path="/"        element={<Dashboard />} />
              <Route path="/camera"  element={<Camera />} />
              <Route path="/map"     element={<MapPage />} />
              <Route path="/history" element={<History />} />
              <Route path="/disease" element={<DiseaseChecker />} />
              <Route path="/chat"    element={<AIChat />} />
              <Route path="/alerts"  element={<Alerts />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}