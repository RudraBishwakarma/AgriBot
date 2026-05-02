import cv2
import time
from ultralytics import YOLO

# ── CONFIG ────────────────────────────────────────────────────────────────────

CAMERA_SOURCE          = 0        # 0=laptop, 1=USB/DroidCam, "http://...":IP cam
DISEASE_CONF_THRESHOLD = 0.80     # confidence to fire spray alert
OBJECT_CONF_THRESHOLD  = 0.45     # min confidence to draw an object box
LOG_FILE               = "agribot_log.txt"

# Classes that block disease inference when they dominate the frame
# (non-plant objects that fool the classifier)
NON_PLANT_BLOCKERS = {
    "person", "car", "truck", "motorcycle", "bicycle",
    "dog", "cat", "bird", "cow", "horse", "sheep",
    "bottle", "chair", "laptop", "cell phone",
}

# Classes that are field threats (trigger intruder alert)
THREAT_CLASSES = {
    "person", "car", "truck", "motorcycle",
    "dog", "cat", "cow", "horse", "sheep", "bird",
    "bottle",
}

# A detected object "dominates" if its box covers this fraction of the frame
BLOCKER_AREA_RATIO = 0.10   # 10% of frame area = blocker active

# ── EVENT STATE MACHINE ───────────────────────────────────────────────────────
# Each alert type has 3 states:
#   IDLE    → condition is false, no alert pending
#   ACTIVE  → condition became true, alert fired ONCE, waiting for reset
#   RESET   → condition cleared, next trigger will fire alert again (→ IDLE)

class AlertEvent:
    def __init__(self, name):
        self.name       = name
        self.state      = "IDLE"   # IDLE | ACTIVE
        self.fired_at   = 0

    def update(self, condition_true):
        """
        Call every frame with whether the alert condition is currently met.
        Returns True only on the FIRST frame the condition becomes true.
        """
        if condition_true:
            if self.state == "IDLE":
                self.state    = "ACTIVE"
                self.fired_at = time.time()
                return True          # fire alert exactly once
            return False             # already active, suppress repeat
        else:
            # Condition cleared → reset so next occurrence fires again
            self.state = "IDLE"
            return False

# One event per alert type
disease_event  = AlertEvent("disease")
intruder_event = AlertEvent("intruder")

# ── LOGGING ───────────────────────────────────────────────────────────────────

def log(msg):
    line = f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}"
    print(line)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")

def fire_spray_alert(label, conf):
    log(f"SPRAY ALERT — {label} detected at {conf:.1%}. Spray triggered.")

def fire_intruder_alert(threats):
    summary = ", ".join(f"{l} x{c}" for l, c in threats.items())
    log(f"FIELD ALERT — Unwanted objects: {summary}")

# ── LOAD MODELS ───────────────────────────────────────────────────────────────

disease_model = YOLO("runs/classify/agribot_cls/weights/best.pt")
object_model  = YOLO("yolov8n.pt")

cap = cv2.VideoCapture(CAMERA_SOURCE)
if not cap.isOpened():
    print("Camera not found. Update CAMERA_SOURCE.")
    exit()

frame_count = 0
fps         = 0.0
fps_timer   = time.time()

print("AgriBot Smart Monitor started. Press Q to quit.\n")

# ── MAIN LOOP ─────────────────────────────────────────────────────────────────

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        print("Frame not received.")
        break

    frame_count += 1
    now          = time.time()
    fh, fw       = frame.shape[:2]
    frame_area   = fw * fh

    # FPS counter
    if frame_count % 30 == 0:
        fps       = 30 / (now - fps_timer)
        fps_timer = now

    # ── STEP 1: RUN OBJECT DETECTOR (always, every frame) ────────────────────
    obj_results   = object_model.predict(frame, conf=OBJECT_CONF_THRESHOLD,
                                         verbose=False)
    detected_objs = []   # list of (x1,y1,x2,y2, label, conf, is_threat)
    blocker_active = False
    threats_found  = {}  # { "cow": 2 }

    for r in obj_results:
        for box in r.boxes:
            cls_id    = int(box.cls)
            obj_label = r.names[cls_id]
            obj_conf  = float(box.conf)
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            box_area  = (x2 - x1) * (y2 - y1)
            is_threat = obj_label in THREAT_CLASSES

            detected_objs.append((x1, y1, x2, y2, obj_label, obj_conf, is_threat))

            # Check if this non-plant object dominates the frame
            if obj_label in NON_PLANT_BLOCKERS:
                if box_area / frame_area >= BLOCKER_AREA_RATIO:
                    blocker_active = True

            if is_threat:
                threats_found[obj_label] = threats_found.get(obj_label, 0) + 1

    # ── STEP 2: DISEASE INFERENCE — only when frame is clear of blockers ──────
    dis_label  = "no plant"
    dis_conf   = 0.0
    dis_status = "BLOCKED"
    dis_color  = (120, 120, 120)
    plant_rois = []   # collected from object detector if plant boxes exist

    if not blocker_active:
        # Option A — if your object model detects plants/leaves as a class,
        # crop each plant ROI and run disease model on the crop only.
        # Option B (current, no plant detector) — run on full frame but
        # only when no non-plant blocker is present.
        # When you later add a plant-specific detector, swap in Option A.

        dis_results = disease_model.predict(frame, verbose=False)
        dis_probs   = dis_results[0].probs
        dis_label   = dis_results[0].names[dis_probs.top1]
        dis_conf    = dis_probs.top1conf.item()

        if dis_label == "diseased" and dis_conf >= DISEASE_CONF_THRESHOLD:
            dis_status = "DISEASED"
            dis_color  = (0, 0, 255)
        elif dis_label == "diseased":
            dis_status = "SUSPECTED"
            dis_color  = (0, 140, 255)
        else:
            dis_status = "HEALTHY"
            dis_color  = (0, 210, 80)
    else:
        # Frame has a non-plant blocker — skip disease, show reason
        dis_status = "SKIPPED (non-plant in frame)"
        dis_color  = (120, 120, 120)

    # ── STEP 3: EVENT STATE MACHINE — fire alerts once per event ─────────────

    # Disease alert: fires once when diseased, resets only when healthy returns
    disease_condition = (dis_label == "diseased" and
                         dis_conf >= DISEASE_CONF_THRESHOLD and
                         not blocker_active)
    if disease_event.update(disease_condition):
        fire_spray_alert(dis_label, dis_conf)

    # Intruder alert: fires once per unique threat group, resets when all clear
    intruder_condition = len(threats_found) > 0
    if intruder_event.update(intruder_condition):
        fire_intruder_alert(threats_found)

    # ── STEP 4: DRAW BOUNDING BOXES (always — display is never blocked) ───────
    for (x1, y1, x2, y2, obj_label, obj_conf, is_threat) in detected_objs:
        color = (0, 0, 220) if is_threat else (80, 200, 80)

        # Dim box if it is a blocker (to visually indicate why disease skipped)
        if obj_label in NON_PLANT_BLOCKERS:
            color = (0, 120, 255)

        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

        pill = f"{obj_label} {obj_conf:.0%}"
        (tw, th), _ = cv2.getTextSize(pill, cv2.FONT_HERSHEY_SIMPLEX, 0.52, 1)
        cv2.rectangle(frame, (x1, y1 - th - 10),
                      (x1 + tw + 8, y1), color, -1)
        cv2.putText(frame, pill, (x1 + 4, y1 - 4),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.52, (255, 255, 255), 1)

        # Orange dot on blocker boxes
        if obj_label in NON_PLANT_BLOCKERS:
            cv2.circle(frame, (x2 - 10, y1 + 10), 6, (0, 165, 255), -1)

    # ── STEP 5: HUD OVERLAY ───────────────────────────────────────────────────
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (fw, 115), (10, 10, 10), -1)
    cv2.addWeighted(overlay, 0.55, frame, 0.45, 0, frame)

    # Row 1 — title + FPS
    cv2.putText(frame, f"AgriBot Smart Monitor  |  FPS: {fps:.1f}",
                (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.52, (170, 170, 170), 1)

    # Row 2 — disease status
    cv2.putText(frame, f"PLANT: {dis_status}  {dis_conf:.1%}" if dis_conf > 0
                else f"PLANT: {dis_status}",
                (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.68, dis_color, 2)

    # Row 3 — disease event state
    d_state_color = (0, 200, 80) if disease_event.state == "IDLE" else (0, 0, 220)
    cv2.putText(frame, f"Disease event: {disease_event.state}",
                (10, 78), cv2.FONT_HERSHEY_SIMPLEX, 0.50, d_state_color, 1)

    # Row 4 — object / intruder status
    if threats_found:
        threat_text  = "THREAT: " + "  ".join(
            f"{l}:{c}" for l, c in threats_found.items())
        threat_color = (0, 60, 255)
        if int(now * 2) % 2 == 0:
            cv2.rectangle(frame, (2, 2), (fw - 2, fh - 2), (0, 0, 255), 3)
    else:
        threat_text  = "FIELD CLEAR"
        threat_color = (0, 200, 80)

    i_state_color = (0, 200, 80) if intruder_event.state == "IDLE" else (0, 100, 255)
    cv2.putText(frame, f"{threat_text}  |  Intruder event: {intruder_event.state}",
                (10, 103), cv2.FONT_HERSHEY_SIMPLEX, 0.50, i_state_color, 1)

    cv2.imshow("AgriBot Smart Monitor", frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
print("AgriBot stopped.")