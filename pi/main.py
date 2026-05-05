# main.py

import time
import requests
from dht11 import read_dht11

SERVER_URL = "http://10.39.201.66:5000/api/sensor"
DEVICE_ID = "agribot_01"

while True:
    try:
        dht_data = read_dht11()

        data = {
            "deviceId": DEVICE_ID,
            "timestamp": time.strftime("%H:%M:%S"),

            # DHT11
            "temperature_c": dht_data["temperature_c"],
            "temperature_f": dht_data["temperature_f"],
            "humidity": dht_data["humidity"],
            "dht_status": dht_data["dht_status"],

            # Soil (future)
            "soil_moisture_pct": 0,
            "soil_raw": 0,
            "soil_status": "na",

            # Gas (future)
            "gas_ppm": 0,
            "gas_raw": 0,
            "gas_status": "na",

            # GPS (dummy for now)
            "gps": {
                "lat": 23.25,
                "lng": 77.41
            }
        }

        response = requests.post(SERVER_URL, json=data)

        print("📡 Sent:", data)

    except Exception as e:
        print("❌ Error:", e)

    time.sleep(5)