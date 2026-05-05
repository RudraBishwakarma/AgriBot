# dht11.py

import adafruit_dht
import board
import atexit
import time

dht = adafruit_dht.DHT11(board.D4)

# Cleanup
atexit.register(lambda: dht.exit())

def classify(temp, hum):
    if 18 <= temp <= 30 and 40 <= hum <= 70:
        return "optimal"
    elif temp > 35 or hum < 20:
        return "critical"
    elif temp < 10:
        return "too_cold"
    elif hum > 85:
        return "too_humid"
    else:
        return "suboptimal"

def read_dht11():
    """Returns sensor data (never returns None)"""

    for _ in range(3):
        try:
            temp = dht.temperature
            hum = dht.humidity

            if temp is not None and hum is not None:
                return {
                    "temperature": temp,
                    "humidity": hum,
                    "dhtStatus": classify(temp, hum)
                }

        except RuntimeError:
            time.sleep(1)

    # fallback (IMPORTANT)
    return {
        "temperature": 0,
        "humidity": 0,
        "dhtStatus": "error"
    }