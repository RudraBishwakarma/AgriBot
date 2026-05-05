// api.js

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Convert canvas → base64 string
 * WHY: Backend needs image in string format
 */
export function frameToBase64(canvas, quality = 0.75) {
    try {
        return canvas.toDataURL("image/jpeg", quality).split(",")[1];
    } catch (err) {
        console.error("Frame conversion failed:", err);
        return null;
    }
}

/**
 * Send frame to backend ML model
 * WHY: This triggers AI detection
 */
export async function analyzeFrame(base64Frame) {
    try {
        const controller = new AbortController();

        // Timeout (5 sec safety)
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(`${BASE}/api/analyze`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ frame: base64Frame }),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();

        return data;

    } catch (error) {
        console.error("Analyze error:", error);
        return null;
    }
}

/**
 * Expected Response:
 * {
 *   classification: { label: "healthy/diseased", confidence: 0.92 },
 *   detections: [
 *     { label: "person", confidence: 0.88, bbox: [x1,y1,x2,y2] }
 *   ],
 *   decision: "SPRAY" | "INTRUDER_ALERT" | "NONE"
 * }
 */