from ultralytics import YOLO

CONFIDENCE_THRESHOLD = 0.85

# --- Dummy functions (for testing) ---
def trigger_spray():
    print("🚿 SPRAY ACTIVATED")

def send_alert(label, conf):
    print(f"⚠️ ALERT: {label} ({conf:.2%})")


# --- Decision Function ---
def agribot_decision(image_path, model):
    results = model.predict(image_path, verbose=False)

    probs = results[0].probs
    label = results[0].names[probs.top1]
    conf  = probs.top1conf.item()

    decision = {
        "label": label,
        "confidence": round(conf, 4),
        "action": None
    }

    if label == "diseased" and conf >= CONFIDENCE_THRESHOLD:
        decision["action"] = "SPRAY"
        trigger_spray()
        send_alert(label, conf)

    elif label == "diseased":
        decision["action"] = "ALERT_LOW_CONF"
        send_alert(label, conf)

    else:
        decision["action"] = "NONE"
        print("✅ Plant is healthy")

    return decision