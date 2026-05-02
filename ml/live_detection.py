import cv2
from ultralytics import YOLO

model = YOLO("runs/classify/agribot_cls/weights/best.pt")
cap   = cv2.VideoCapture(0)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    results = model.predict(frame, verbose=False)
    probs   = results[0].probs
    label   = results[0].names[probs.top1]
    conf    = probs.top1conf.item()

    color = (0, 200, 0) if label == "healthy" else (0, 0, 220)
    cv2.putText(frame, f"{label}  {conf:.1%}", (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1.2, color, 2)
    cv2.imshow("AgriBot", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()