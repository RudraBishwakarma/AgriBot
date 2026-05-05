from dht11 import read_dht11
import requests
import time

SERVER_URL = "http://10.39.201.66:5000/api/sensor"

while True:
    dht_data = read_dht11()

    data = {
        "deviceId": "agribot_01",
        "temperature": dht_data["temperature"],
        "humidity": dht_data["humidity"],
        "soilMoisture": 0,
        "gasLevel": 0,
        "gps": {
            "lat": 23.25,
            "lng": 77.41
        }
    }

    requests.post(SERVER_URL, json=data)

    print("Sent:", data)

    time.sleep(5)