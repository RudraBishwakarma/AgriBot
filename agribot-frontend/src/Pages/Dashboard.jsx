import React, { useState, useEffect } from 'react';
import { 
  Thermometer, Droplets, Sprout, Wind, CloudRain, Waves, 
  AlertTriangle, Wifi, Battery, MapPin
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { currentSensors, sensorHistory, alerts } from '../data/mockData';
import './Dashboard.css';

export default function Dashboard() {
  const [sensors, setSensors] = useState(currentSensors);
  const [isUpdating, setIsUpdating] = useState(false);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true);
      
      setSensors(prev => ({
        ...prev,
        temperature: +(prev.temperature + (Math.random() * 0.4 - 0.2)).toFixed(1),
        humidity: Math.max(0, Math.min(100, Math.round(prev.humidity + (Math.random() * 2 - 1)))),
        soilMoisture: Math.max(0, Math.min(100, Math.round(prev.soilMoisture + (Math.random() * 2 - 1)))),
        gasLevel: Math.max(0, Math.round(prev.gasLevel + (Math.random() * 2 - 1))),
      }));

      // Remove the animation class after a short delay so it can trigger again
      setTimeout(() => setIsUpdating(false), 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (type, severity) => {
    const color = severity === 'high' ? '#ef4444' : severity === 'medium' ? '#f59e0b' : '#3b82f6';
    return <AlertTriangle size={20} color={color} />;
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Real-time overview of AgriBot status and field conditions</p>
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-item">
          <div className="status-dot"></div>
          System Online
        </div>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div className="status-item"><Wifi size={16} /> Signal: Strong</div>
          <div className="status-item"><Battery size={16} /> Battery: 84%</div>
          <div className="status-item"><MapPin size={16} /> Zone A</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Sensors & Charts */}
        <div className="dashboard-main">
          
          {/* Sensor Cards */}
          <div className="sensor-grid">
            <div className="sensor-card">
              <div className="sensor-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                <Thermometer size={24} color="#ef4444" />
              </div>
              <div className="sensor-label">Temperature</div>
              <div className={`sensor-value ${isUpdating ? 'value-update' : ''}`}>
                {sensors.temperature.toFixed(1)} <span className="sensor-unit">°C</span>
              </div>
            </div>

            <div className="sensor-card">
              <div className="sensor-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                <Droplets size={24} color="#3b82f6" />
              </div>
              <div className="sensor-label">Air Humidity</div>
              <div className={`sensor-value ${isUpdating ? 'value-update' : ''}`}>
                {sensors.humidity} <span className="sensor-unit">%</span>
              </div>
            </div>

            <div className="sensor-card">
              <div className="sensor-icon-wrapper" style={{ background: 'rgba(74, 222, 128, 0.1)' }}>
                <Sprout size={24} color="#4ade80" />
              </div>
              <div className="sensor-label">Soil Moisture</div>
              <div className={`sensor-value ${isUpdating ? 'value-update' : ''}`}>
                {sensors.soilMoisture} <span className="sensor-unit">%</span>
              </div>
            </div>

            <div className="sensor-card">
              <div className="sensor-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
                <Wind size={24} color="#a855f7" />
              </div>
              <div className="sensor-label">Gas Level</div>
              <div className={`sensor-value ${isUpdating ? 'value-update' : ''}`}>
                {sensors.gasLevel} <span className="sensor-unit">ppm</span>
              </div>
            </div>

            <div className="sensor-card">
              <div className="sensor-icon-wrapper" style={{ background: 'rgba(14, 165, 233, 0.1)' }}>
                <Waves size={24} color="#0ea5e9" />
              </div>
              <div className="sensor-label">Water Tank</div>
              <div className="sensor-value">
                {sensors.waterLevel} <span className="sensor-unit">%</span>
              </div>
            </div>

            <div className="sensor-card">
              <div className="sensor-icon-wrapper" style={{ background: sensors.rainDetected ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg)' }}>
                <CloudRain size={24} color={sensors.rainDetected ? "#3b82f6" : "var(--text-muted)"} />
              </div>
              <div className="sensor-label">Rain Status</div>
              <div className="sensor-value" style={{ fontSize: '20px', marginTop: '8px' }}>
                {sensors.rainDetected ? 'Raining' : 'Clear'}
              </div>
            </div>
          </div>

          {/* Temperature Chart */}
          <div className="card">
            <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Temperature History</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensorHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Alerts */}
        <div className="dashboard-side">
          <div className="card" style={{ height: '100%' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Recent Alerts</h3>
            <div className="alerts-panel">
              {alerts.map((alert) => (
                <div key={alert.id} className={`alert-item severity-${alert.severity}`}>
                  <div className="alert-icon">
                    {getAlertIcon(alert.type, alert.severity)}
                  </div>
                  <div className="alert-content">
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-time">{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              style={{ 
                width: '100%', 
                marginTop: '20px', 
                padding: '12px', 
                background: 'var(--bg)', 
                border: '1px solid var(--border)', 
                borderRadius: '8px', 
                color: 'var(--text-primary)', 
                fontWeight: 500, 
                transition: 'background 0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={e => e.target.style.background = 'var(--border)'}
              onMouseOut={e => e.target.style.background = 'var(--bg)'}
            >
              View All Alerts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}