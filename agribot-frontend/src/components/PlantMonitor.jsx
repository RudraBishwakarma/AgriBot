import { useRef, useState, useCallback, useEffect } from "react";
import { usePlantStream } from "../hooks/usePlantStream";
import { analyzeFrame, frameToBase64 } from "../api/api";
import BBoxOverlay from "./BBoxOverlay";

export default function PlantMonitor() {
  const videoRef = useRef(null);

  const [streaming, setStreaming] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);

  const [result, setResult] = useState(null);
  const [snapResult, setSnapResult] = useState(null);

  const onResult = useCallback((data) => {
    setResult(data);
  }, []);

  const { connected, startStreaming, stopStreaming, disconnect } =
    usePlantStream({
      onResult,
      enabled: streaming,
    });

  // ── START CAMERA ─────────────────────
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraOn(true);
    } catch (err) {
      console.error("Camera error:", err);
    }
  }

  // ── STOP CAMERA ─────────────────────
  function stopCamera() {
    const tracks = videoRef.current?.srcObject?.getTracks();
    tracks?.forEach((t) => t.stop());
    setCameraOn(false);
  }

  // ── STREAM CONTROL ───────────────────
  function toggleStream() {
    if (!cameraOn) return alert("Start camera first!");

    if (!streaming) {
      startStreaming(videoRef.current, 5);
      setStreaming(true);
    } else {
      stopStreaming();
      setStreaming(false);
    }
  }

  // ── SNAPSHOT (REST) ─────────────────
  async function takeSnapshot() {
    try {
      const canvas = document.createElement("canvas");

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0);

      const base64 = frameToBase64(canvas);
      const res = await analyzeFrame(base64);

      setSnapResult(res);
    } catch (err) {
      console.error("Snapshot error:", err);
    }
  }

  // ── CLEANUP ─────────────────────────
  useEffect(() => {
    return () => {
      stopStreaming();
      stopCamera();
      disconnect();
    };
  }, []);

  const display = result || snapResult;
  const { classification, detections, decision } = display || {};

  return (
    <div style={{ display: "flex", gap: 24 }}>
      
      {/* VIDEO */}
      <div style={{ position: "relative", width: 640, height: 480 }}>
        <video
          ref={videoRef}
          width={640}
          height={480}
          muted
          style={{ display: "block" }}
        />

        {/* AI Overlay */}
        {detections && (
          <BBoxOverlay
            detections={detections}
            classification={classification}
            width={640}
            height={480}
          />
        )}
      </div>

      {/* SIDE PANEL */}
      <div style={{ minWidth: 280 }}>
        <p>WS: {connected ? "🟢 Live" : "⚫ Off"}</p>

        <button onClick={startCamera}>📷 Start Camera</button>
        <button onClick={stopCamera}>🛑 Stop Camera</button>

        <button onClick={toggleStream}>
          {streaming ? "⏹ Stop Stream" : "▶ Start Stream"}
        </button>

        <button onClick={takeSnapshot}>📸 Snapshot</button>

        {/* Classification */}
        {classification && (
          <div>
            <h3>Plant</h3>
            <p>
              {classification.label} —{" "}
              {(classification.confidence * 100).toFixed(1)}%
            </p>
          </div>
        )}

        {/* Detections */}
        {detections?.length > 0 && (
          <div>
            <h3>Objects ({detections.length})</h3>
            {detections.map((d, i) => (
              <p key={i}>
                {d.label} {(d.confidence * 100).toFixed(0)}%
              </p>
            ))}
          </div>
        )}

        {/* Decision */}
        {decision && (
          <div>
            <h3>Decision</h3>
            <p>{decision}</p>
          </div>
        )}
      </div>
    </div>
  );
}BBoxOverlay