from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64, json
import numpy as np
import cv2

from ultralytics import YOLO

# ── INIT ───────────────────────────────────────

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── LOAD MODELS ───────────────────────────────

disease_model = YOLO("../ml/runs/classify/agribot_cls/weights/best.pt")
object_model  = YOLO("yolov8n.pt")

# ── UTIL ─────────────────────────────────────

def decode_frame(b64_string: str):
    img_bytes = base64.b64decode(b64_string)
    arr = np.frombuffer(img_bytes, dtype=np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)

# ── PIPELINE ─────────────────────────────────

def run_pipeline(frame):

    # ── Disease detection ──
    dis_results = disease_model.predict(frame, verbose=False)
    probs = dis_results[0].probs
    dis_label = dis_results[0].names[probs.top1]
    dis_conf  = probs.top1conf.item()

    # ── Object detection ──
    obj_results = object_model.predict(frame, verbose=False)
    detections = []

    for r in obj_results:
        for box in r.boxes:
            cls_id = int(box.cls)
            label  = r.names[cls_id]
            conf   = float(box.conf)
            x1, y1, x2, y2 = map(int, box.xyxy[0])

            detections.append({
                "label": label,
                "confidence": conf,
                "bbox": [x1, y1, x2, y2]
            })

    # ── Decision logic ──
    decision = "NONE"

    if dis_label == "diseased" and dis_conf > 0.85:
        decision = "SPRAY"

    if any(d["label"] == "person" for d in detections):
        decision = "INTRUDER_ALERT"

    return {
        "classification": {
            "label": dis_label,
            "confidence": dis_conf
        },
        "detections": detections,
        "decision": decision
    }

# ── REST API ─────────────────────────────────

class AnalyzeRequest(BaseModel):
    frame: str

@app.post("/api/analyze")
async def analyze(body: AnalyzeRequest):
    frame = decode_frame(body.frame)
    return run_pipeline(frame)

@app.get("/api/health")
async def health():
    return {"status": "ok"}

# ── WEBSOCKET ────────────────────────────────

@app.websocket("/ws/stream")
async def stream(websocket: WebSocket):
    await websocket.accept()
    print("✅ WebSocket connected")

    try:
        while True:
            data = await websocket.receive_text()
            
            try:
                payload = json.loads(data)
                if "frame" in payload:
                    frame = decode_frame(payload["frame"])
                    result = run_pipeline(frame)
                    await websocket.send_json(result)
            except Exception as e:
                print(f"Error processing frame: {e}")

    except WebSocketDisconnect:
        print("❌ WebSocket disconnected")