import { useEffect, useRef } from "react";

/**
 * Draw bounding boxes on video overlay
 * Backend bbox format: [x1, y1, x2, y2]
 */
export default function BBoxOverlay({
  detections = [],
  classification,
  width = 640,
  height = 480,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Clear previous frame
    ctx.clearRect(0, 0, width, height);

    detections.forEach(({ label, confidence, bbox }) => {
      if (!bbox) return;

      // Backend format: [x1, y1, x2, y2]
      const [x1, y1, x2, y2] = bbox;

      const boxWidth = x2 - x1;
      const boxHeight = y2 - y1;

      // Color logic
      const isHealthy = classification?.label === "healthy";
      const color = isHealthy ? "#22c55e" : "#ef4444";

      // Draw box
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, boxWidth, boxHeight);

      // Draw label background
      const text = `${label} ${(confidence * 100).toFixed(0)}%`;
      ctx.font = "12px monospace";
      const textWidth = ctx.measureText(text).width;

      ctx.fillStyle = color;
      ctx.fillRect(x1, Math.max(0, y1 - 18), textWidth + 6, 16);

      // Draw text
      ctx.fillStyle = "#fff";
      ctx.fillText(text, x1 + 3, Math.max(12, y1 - 6));
    });
  }, [detections, classification, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}