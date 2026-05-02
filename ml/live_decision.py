import cv2
import time
from ultralytics import YOLO

CONFIDENCE_THRESHOLD = 0.85
ALERT_COOLDOWN = 10  # seconds between repeated alerts for same label

def trigger_spray():
    print("🚿 SPRAY ACTIVATED")

def send_alert(label, conf):
    print(f"⚠️ ALERT: {label} ({conf:.2%})")

# ── Camera source ──────────────────────────────────────────────
# Option 1 - Laptop webcam:        0
# Option 2 - External/phone USB:   1
# Option 3 - IP Webcam (Android):  "http://192.168.1.X:8080/video"
# Option 4 - DroidCam:             "http://192.168.1.X:4747/video"
CAMERA_SOURCE = 0

model = YOLO("runs/classify/agribot_cls/weights/best.pt")
cap = cv2.VideoCapture(CAMERA_SOURCE)

if not cap.isOpened():
    print("❌ Camera not found. Change CAMERA_SOURCE and retry.")
    exit()

# Track last alert time per label to prevent repeated notifications
last_alert_time = {"diseased": 0, "healthy": 0}

print("✅ AgriBot Live started. Press 'q' to quit.")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        print("⚠️ Frame not received. Check camera connection.")
        break

    results = model.predict(frame, verbose=False)
    probs   = results[0].probs
    label   = results[0].names[probs.top1]
    conf    = probs.top1conf.item()
    now     = time.time()

    # ── Cooldown check: only alert once per window per label ──
    cooldown_passed = (now - last_alert_time[label]) > ALERT_COOLDOWN

    if label == "diseased" and conf >= CONFIDENCE_THRESHOLD:
        color = (0, 0, 255)  # Red
        if cooldown_passed:
            trigger_spray()
            send_alert(label, conf)
            last_alert_time[label] = now

    elif label == "diseased":
        color = (0, 165, 255)  # Orange — low confidence
        if cooldown_passed:
            send_alert(label, conf)
            last_alert_time[label] = now

    else:
        color = (0, 255, 0)   # Green — healthy

    # ── Cooldown countdown overlay ─────────────────────────────
    time_since = now - last_alert_time[label]
    cooldown_remaining = max(0, ALERT_COOLDOWN - time_since)
    status_text = (
        f"Next alert in {cooldown_remaining:.0f}s"
        if cooldown_remaining > 0 else "Ready to alert"
    )

    # ── Draw overlays ──────────────────────────────────────────
    cv2.putText(frame, f"{label}  {conf:.1%}",
                (20, 45), cv2.FONT_HERSHEY_SIMPLEX, 1.3, color, 2)
    cv2.putText(frame, status_text,
                (20, 85), cv2.FONT_HERSHEY_SIMPLEX, 0.65,
                (200, 200, 200), 1)

    cv2.imshow("AgriBot Live", frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
print("👋 AgriBot stopped.")