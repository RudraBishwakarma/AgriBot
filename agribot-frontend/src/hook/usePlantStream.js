import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws/stream";

export function usePlantStream({ onResult, enabled = false }) {
  const ws = useRef(null);
  const intervalRef = useRef(null);
  const reconnectRef = useRef(null);

  const [connected, setConnected] = useState(false);

  // ── CONNECT ─────────────────────────────
  const connect = useCallback(() => {
    if (ws.current) return;

    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log("WS connected");
      setConnected(true);
    };

    ws.current.onclose = () => {
      console.log("WS disconnected");
      setConnected(false);
      ws.current = null;

      // auto-reconnect after 2 sec
      reconnectRef.current = setTimeout(connect, 2000);
    };

    ws.current.onerror = (e) => {
      console.error("WS error", e);
    };

    ws.current.onmessage = (e) => {
      try {
        const result = JSON.parse(e.data);

        // FIX: directly pass result (no type check)
        onResult(result);

      } catch (err) {
        console.error("WS parse error", err);
      }
    };

  }, [onResult]);

  // ── DISCONNECT ─────────────────────────
  const disconnect = useCallback(() => {
    clearInterval(intervalRef.current);
    clearTimeout(reconnectRef.current);

    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  // ── START STREAMING ────────────────────
  const startStreaming = useCallback((videoEl, fps = 5) => {
    if (!videoEl) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    intervalRef.current = setInterval(() => {
      if (!videoEl.videoWidth) return; // FIX: wait for video ready
      if (ws.current?.readyState !== WebSocket.OPEN) return;

      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;

      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

      const base64 = canvas
        .toDataURL("image/jpeg", 0.7)
        .split(",")[1];

      ws.current.send(JSON.stringify({ frame: base64 }));

    }, 1000 / fps);

  }, []);

  // ── STOP STREAMING ────────────────────
  const stopStreaming = useCallback(() => {
    clearInterval(intervalRef.current);
  }, []);

  // ── EFFECT ───────────────────────────
  useEffect(() => {
    if (enabled) connect();
    return () => disconnect();
  }, [enabled, connect, disconnect]);

  return {
    connected,
    startStreaming,
    stopStreaming,
    disconnect,
  };
}