from ultralytics import YOLO

model = YOLO("runs/classify/agribot_cls/weights/best.pt")

results = model.predict("test_images/leaf.jpg", verbose=False)
for r in results:
    probs = r.probs
    label = r.names[probs.top1]
    conf  = probs.top1conf.item()
    print(f"Prediction: {label}  ({conf:.2%})")