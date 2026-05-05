import React, { useState, useEffect, useRef } from 'react';
import { Video, Play, Pause, Square, AlertCircle, Settings } from 'lucide-react';
import BBoxOverlay from '../components/BBoxOverlay';
import './Camera.css';

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws/stream";

export default function Camera() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeDetections, setActiveDetections] = useState([]);
  const [classification, setClassification] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const requestRef = useRef(null);
  const lastFrameTime = useRef(0);

  // Setup WebSocket and Webcam
  useEffect(() => {
    // Connect WebSocket
    wsRef.current = new WebSocket(WS_URL);
    
    wsRef.current.onopen = () => {
      console.log("WebSocket Connected");
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.detections) setActiveDetections(data.detections);
        if (data.classification) setClassification(data.classification);
        
        // Update logs (keep last 10)
        if (data.detections && data.detections.length > 0) {
          const newLogs = data.detections.map(d => ({
            id: Math.random().toString(36).substring(7),
            label: d.label,
            confidence: d.confidence,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
            color: d.label === 'person' ? '#ef4444' : '#3b82f6'
          }));
          setRecentLogs(prev => [...newLogs, ...prev].slice(0, 10));
        }
      } catch (err) {
        console.error("Error parsing WS message:", err);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    // Setup WebCam
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };
    setupCamera();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Frame Capture Loop
  const sendFrame = (time) => {
    if (!isPlaying) return;

    // Throttle to ~5 FPS (every 200ms)
    if (time - lastFrameTime.current > 200) {
      if (videoRef.current && canvasRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // get base64
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        const base64Str = dataUrl.split(',')[1];

        wsRef.current.send(JSON.stringify({ frame: base64Str }));
        lastFrameTime.current = time;
      }
    }
    requestRef.current = requestAnimationFrame(sendFrame);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(sendFrame);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && videoRef.current) {
      videoRef.current.play();
    } else if (isPlaying && videoRef.current) {
      videoRef.current.pause();
    }
  };

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
            <div className="video-feed-wrapper" style={{ position: 'relative', overflow: 'hidden', background: '#000', borderRadius: '8px' }}>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ width: '100%', display: 'block', aspectRatio: '4/3', objectFit: 'cover' }}
              />
              
              <canvas 
                ref={canvasRef} 
                width={640} 
                height={480} 
                style={{ display: 'none' }} 
              />

              {isPlaying && (
                <BBoxOverlay 
                  detections={activeDetections} 
                  classification={classification} 
                  width={640}
                  height={480} 
                />
              )}

              {/* Overlays */}
              {isPlaying && (
                <div className="live-indicator">
                  <div className="live-dot"></div>
                  LIVE
                </div>
              )}
              
              {!isPlaying && (
                <div className="video-placeholder" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', color: 'white' }}>
                  <Video size={48} opacity={0.5} style={{ marginBottom: '16px' }} />
                  <p style={{ fontWeight: 500 }}>Stream Paused</p>
                  <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>Click Play to resume</p>
                </div>
              )}

              {isRecording && (
                <div className="live-indicator" style={{ left: 'auto', right: '16px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                   REC
                </div>
              )}
            </div>
            
            {/* Stream Controls */}
            <div className="controls-bar" style={{ marginTop: '16px' }}>
              <button 
                className={`control-btn ${isPlaying ? 'active-green' : ''}`} 
                onClick={togglePlay}
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
              {recentLogs.map((log) => (
                <div key={log.id} className="log-item">
                  <div className="log-item-info">
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: log.color }}></div>
                    <span style={{ fontWeight: 500 }}>{log.label}</span>
                    <span style={{ color: 'var(--text-muted)' }}>({Math.round(log.confidence * 100)}%)</span>
                  </div>
                  <span className="log-time">{log.time}</span>
                </div>
              ))}
              {recentLogs.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
                  No detections yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}