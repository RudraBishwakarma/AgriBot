import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { analyzeFrame } from '../api/api';
import './DiseaseChecker.css';

export default function DiseaseChecker() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile) => {
    setFile(selectedFile);
    setIsAnalyzing(true);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64String = e.target.result.split(',')[1];
      const data = await analyzeFrame(base64String);
      
      setIsAnalyzing(false);
      
      if (data && data.classification) {
        const isHealthy = data.classification.label === 'healthy';
        setResult({
          disease: isHealthy ? 'Healthy Crop' : data.classification.label,
          confidence: Math.round(data.classification.confidence * 100),
          severity: isHealthy ? 'None' : 'High',
          recommendation: data.decision === 'SPRAY' ? 'Apply appropriate treatment/spray.' : 'No immediate action required. Continue monitoring.',
        });
      } else {
        setResult({
          disease: 'Analysis Failed',
          confidence: 0,
          severity: 'Unknown',
          recommendation: 'Please try uploading another clear image.',
        });
      }
    };
    reader.onerror = () => {
      setIsAnalyzing(false);
      setResult({
        disease: 'File Read Error',
        confidence: 0,
        severity: 'Unknown',
        recommendation: 'Could not read the uploaded file.',
      });
    };
    
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="disease-page">
      <div className="page-header">
        <h1 className="page-title">Disease Checker</h1>
        <p className="page-subtitle">Upload crop imagery for AI-powered disease diagnosis</p>
      </div>

      <div className="disease-grid">
        <div className="card upload-card">
          <div 
            className={`upload-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isAnalyzing ? (
              <div className="upload-content">
                <Loader2 size={48} className="spinner icon-green" />
                <h3>Analyzing Image...</h3>
                <p>Running neural network models</p>
              </div>
            ) : file && !result ? (
              <div className="upload-content">
                <UploadCloud size={48} className="icon-green" />
                <h3>{file.name}</h3>
                <p>Ready to analyze</p>
              </div>
            ) : (
              <div className="upload-content">
                <UploadCloud size={48} color="var(--text-muted)" />
                <h3>Drag & Drop Image Here</h3>
                <p>or click to browse from your device</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="file-input"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>
        </div>

        <div className="card result-card">
          <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>Diagnosis Results</h3>
          
          {result ? (
            <div className="diagnosis-result">
              <div className="result-header">
                <div className="result-icon-wrapper">
                  <AlertTriangle size={24} color="#f59e0b" />
                </div>
                <div>
                  <div className="result-title">{result.disease}</div>
                  <div className="result-subtitle">{result.confidence}% Confidence</div>
                </div>
              </div>
              
              <div className="result-details">
                <div className="detail-item">
                  <span className="detail-label">Severity</span>
                  <span className="detail-value warning">{result.severity}</span>
                </div>
                <div className="detail-item action-plan">
                  <span className="detail-label">Recommended Action</span>
                  <p>{result.recommendation}</p>
                </div>
              </div>

              <button className="btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={() => { setFile(null); setResult(null); }}>
                Scan Another Image
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <CheckCircle size={40} color="var(--border)" style={{ marginBottom: '16px' }} />
              <p>Upload an image to see the AI diagnosis results here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}