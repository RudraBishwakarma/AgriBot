import React from 'react';
import { cropHistory, cropSuggestions } from '../data/mockData';
import { TrendingUp, Award, Calendar, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import './History.css';

export default function History() {
  return (
    <div className="history-page">
      <div className="page-header">
        <h1 className="page-title">History & Yield Predictions</h1>
        <p className="page-subtitle">Past crop performance and AI-driven planting suggestions</p>
      </div>

      <div className="history-grid">
        <div className="history-main">
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="section-header">
              <h3 style={{ margin: 0, fontSize: '16px' }}>Yield Performance (Tons/Hectare)</h3>
              <div className="history-filters">
                <select className="history-select">
                  <option>All Seasons</option>
                  <option>Kharif Only</option>
                  <option>Rabi Only</option>
                </select>
              </div>
            </div>
            
            <div className="chart-container" style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cropHistory} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="season" axisLine={false} tickLine={false} stroke="var(--text-muted)" fontSize={12} tickMargin={10} />
                  <YAxis axisLine={false} tickLine={false} stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip 
                    cursor={{ fill: 'var(--bg)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                  <Bar dataKey="yield" radius={[4, 4, 0, 0]}>
                    {cropHistory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.season.includes('Kharif') ? 'var(--green-bright)' : '#0ea5e9'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Detailed History Log</h3>
            <div className="table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Season</th>
                    <th>Crop</th>
                    <th>Area (Acres)</th>
                    <th>Yield (T/Ha)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cropHistory.map((row, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={14} color="var(--text-muted)" />
                          {row.season}
                        </div>
                      </td>
                      <td>{row.crop}</td>
                      <td>{row.area}</td>
                      <td style={{ fontWeight: 600 }}>{row.yield}</td>
                      <td>
                        <span className="status-badge completed">{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="history-side">
          <div className="card" style={{ height: '100%' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} className="icon-green" /> 
              AI Crop Suggestions
            </h3>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
              Based on your soil history, moisture levels, and upcoming weather patterns, AgriBot recommends:
            </p>

            <div className="suggestions-list">
              {cropSuggestions.map((sugg, i) => (
                <div key={i} className="suggestion-card">
                  <div className="suggestion-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="rank-badge">#{i + 1}</div>
                      <h4 style={{ margin: 0, fontSize: '15px' }}>{sugg.crop}</h4>
                    </div>
                    <div className="confidence-score">
                      <Award size={14} /> {sugg.confidence}%
                    </div>
                  </div>
                  <p className="suggestion-reason">{sugg.reason}</p>
                  <button className="suggestion-btn">
                    View Planting Plan <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}