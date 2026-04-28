import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { carPosition, gpsRoute } from '../data/mockData';
import { Navigation } from 'lucide-react';
import './MapPage.css';

// Fix for default Leaflet icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for the car
const carIcon = new L.DivIcon({
  className: 'car-marker',
  html: `<div class="car-marker-inner"><div class="car-marker-pulse"></div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

export default function MapPage() {
  return (
    <div className="map-page">
      <div className="page-header">
        <h1 className="page-title">GPS Map</h1>
        <p className="page-subtitle">Live location tracking and route mapping</p>
      </div>

      <div className="map-grid">
        <div className="card map-card">
          <MapContainer 
            center={carPosition} 
            zoom={18} 
            scrollWheelZoom={true} 
            className="leaflet-container-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <Polyline positions={gpsRoute} color="var(--green-bright)" weight={4} opacity={0.7} />
            
            <Marker position={carPosition} icon={carIcon}>
              <Popup>
                <strong>AgriBot</strong> <br /> Current Location
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        <div className="map-side-panel">
          <div className="card">
            <h3 style={{ marginBottom: '16px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={18} className="icon-green" /> 
              Navigation Status
            </h3>
            
            <div className="nav-stats">
              <div className="nav-stat-item">
                <div className="nav-stat-label">Mode</div>
                <div className="nav-stat-value" style={{ color: 'var(--green-bright)' }}>Autonomous</div>
              </div>
              <div className="nav-stat-item">
                <div className="nav-stat-label">Speed</div>
                <div className="nav-stat-value">1.2 m/s</div>
              </div>
              <div className="nav-stat-item">
                <div className="nav-stat-label">Zone</div>
                <div className="nav-stat-value">North Field</div>
              </div>
              <div className="nav-stat-item">
                <div className="nav-stat-label">Next Waypoint</div>
                <div className="nav-stat-value">12m ahead</div>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <button className="btn-primary" style={{ width: '100%', marginBottom: '10px' }}>
                Pause Navigation
              </button>
              <button className="btn-secondary" style={{ width: '100%' }}>
                Return to Base
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}