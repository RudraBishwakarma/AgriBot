import React, { useState } from 'react';
import { alerts } from '../data/mockData';
import { AlertTriangle, Filter, CheckCircle2 } from 'lucide-react';
import './Alerts.css';

export default function Alerts() {
  const [filter, setFilter] = useState('all');

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.severity === filter;
  });

  const getAlertIcon = (severity) => {
    const color = severity === 'high' ? '#ef4444' : severity === 'medium' ? '#f59e0b' : '#3b82f6';
    return <AlertTriangle size={24} color={color} />;
  };

  return (
    <div className="alerts-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Alerts & Notifications</h1>
          <p className="page-subtitle">Recent system events and motion detections</p>
        </div>
        
        <div className="filter-group">
          <button className="filter-btn-icon"><Filter size={18} /></button>
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`filter-btn ${filter === 'high' ? 'active' : ''}`} onClick={() => setFilter('high')}>High</button>
          <button className={`filter-btn ${filter === 'medium' ? 'active' : ''}`} onClick={() => setFilter('medium')}>Medium</button>
          <button className={`filter-btn ${filter === 'low' ? 'active' : ''}`} onClick={() => setFilter('low')}>Low</button>
        </div>
      </div>

      <div className="alerts-container">
        {filteredAlerts.length === 0 ? (
          <div className="card empty-alerts">
            <CheckCircle2 size={48} color="var(--green-bright)" />
            <h3>No Alerts Found</h3>
            <p>There are no alerts matching the selected filter.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div key={alert.id} className={`card alert-card severity-${alert.severity}`}>
              <div className="alert-card-icon">
                {getAlertIcon(alert.severity)}
              </div>
              <div className="alert-card-content">
                <div className="alert-card-header">
                  <h3 className="alert-card-title">{alert.message}</h3>
                  <span className="alert-card-time">{alert.time}</span>
                </div>
                <div className="alert-card-meta">
                  <span className="meta-badge">Type: {alert.type}</span>
                  <span className={`meta-badge severity-${alert.severity}`}>Severity: {alert.severity}</span>
                </div>
                <div className="alert-card-actions">
                  <button className="btn-outline">Acknowledge</button>
                  <button className="btn-text">View Details</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}