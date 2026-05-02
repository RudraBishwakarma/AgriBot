from ultralytics import YOLO

model = YOLO("yolov8n-cls.pt")  # downloads pretrained weights

model.train(
    data="dataset/",      # folder with train/ and val/ subdirs
    epochs=30,
    imgsz=224,
    batch=32,
    name="agribot_cls",
    patience=10           # early stopping
)
# Saves to runs/classify/agribot_cls/weights/best.pt