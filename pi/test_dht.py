import time
import board
import adafruit_dht

# GPIO4
dht = adafruit_dht.DHT11(board.D4)

while True:
    try:
        temperature = dht.temperature
        humidity = dht.humidity

        print("🌡 Temperature:", temperature, "°C")
        print("💧 Humidity:", humidity, "%")
        print("--------------------------")

    except Exception as e:
        print("❌ Error:", e)

    time.sleep(2)