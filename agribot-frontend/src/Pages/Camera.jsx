import React, { useState, useEffect } from 'react';
import { Video, Play, Pause, Square, AlertCircle, Settings } from 'lucide-react';
import { cameraDetections } from '../data/mockData';
import './Camera.css';

export default function Camera() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [activeDetections, setActiveDetections] = useState([]);

  // Simulate detections popping in and out to make it feel "live"
  useEffect(() => {
    if (!isPlaying) {
      setActiveDetections([]);
      return;
    }
    
    // Show initial detections immediately when playing
    setActiveDetections(cameraDetections);
    
    const interval = setInterval(() => {
      // Randomly shuffle and pick a subset to simulate movement/recognition fluctuations
      const shuffled = [...cameraDetections].sort(() => 0.5 - Math.random());
      // Keep 1 or 2 detections active
      setActiveDetections(shuffled.slice(0, Math.floor(Math.random() * 2) + 1));
    }, 2500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="camera-page">
      <div className="page-header">
        <h1 className="page-title">Camera Feed</h1>
        <p className="page-subtitle">Live stream and AI object detection from AgriBot</p>
      </div>

      <div className="camera-container">
        {/* Left Side: Video Stream & Controls */}
        <div className="camera-main">
          <div className="card">
            <div className="video-feed-wrapper">
              {/* Fake Video Stream Background */}
              <div className="video-placeholder">
                <Video size={48} opacity={0.2} style={{ marginBottom: '16px' }} />
                <p style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>MJPEG Stream Placeholder</p>
                <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>Waiting for connection on /stream...</p>
              </div>

              {/* Overlays */}
              {isPlaying && (
                <div className="live-indicator">
                  <div className="live-dot"></div>
                  LIVE
                </div>
              )}
              
              {isRecording && (
                <div className="live-indicator" style={{ left: 'auto', right: '16px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                   REC
                </div>
              )}

              {/* Bounding Boxes */}
              {isPlaying && activeDetections.map((det) => (
                <div 
                  key={det.id} 
                  className="detection-box"
                  style={{
                    top: `${det.box.top}%`,
                    left: `${det.box.left}%`,
                    width: `${det.box.width}%`,
                    height: `${det.box.height}%`,
                    borderColor: det.color,
                    backgroundColor: `${det.color}33`, // Append 33 for 20% hex opacity
                  }}
                >
                  <div 
                    className="detection-box-inner-label" 
                    style={{ backgroundColor: det.color }}
                  >
                    {det.label} {Math.round(det.confidence * 100)}%
                  </div>
                </div>
              ))}
            </div>
            
            {/* Stream Controls */}
            <div className="controls-bar" style={{ marginTop: '16px' }}>
              <button 
                className={`control-btn ${isPlaying ? 'active-green' : ''}`} 
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? 'Pause Stream' : 'Play Stream'}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button 
                className={`control-btn ${isRecording ? 'active-red' : ''}`} 
                onClick={() => setIsRecording(!isRecording)}
                title={isRecording ? 'Stop Recording' : 'Start Recording'}
              >
                <Square size={16} fill={isRecording ? 'currentColor' : 'none'} />
              </button>
              <button className="control-btn" title="Settings">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Detection Logs Panel */}
        <div className="camera-side">
          <div className="card" style={{ height: '100%' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} className="icon-green" /> 
              Recent Detections
            </h3>
            <div className="log-list">
              {cameraDetections.map((det) => (
                <div key={det.id} className="log-item">
                  <div className="log-item-info">
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: det.color }}></div>
                    <span style={{ fontWeight: 500 }}>{det.label}</span>
                    <span style={{ color: 'var(--text-muted)' }}>({Math.round(det.confidence * 100)}%)</span>
                  </div>
                  <span className="log-time">{det.time}</span>
                </div>
              ))}
              <div className="log-item" style={{ opacity: 0.5 }}>
                <div className="log-item-info">
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#999' }}></div>
                  <span style={{ fontWeight: 500 }}>Tractor</span>
                  <span style={{ color: 'var(--text-muted)' }}>(88%)</span>
                </div>
                <span className="log-time">11:45 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}