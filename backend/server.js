require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connect (FIXED)
mongoose.connect("mongodb://127.0.0.1:27017/agribot")
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ MongoDB error:", err));

// Schema
const sensorSchema = new mongoose.Schema({
    deviceId: String,

    // DHT11
    temperature_c: Number,
    temperature_f: Number,
    humidity: Number,
    dht_status: String,

    // Soil
    soil_moisture_pct: Number,
    soil_raw: Number,
    soil_status: String,

    // Gas
    gas_ppm: Number,
    gas_raw: Number,
    gas_status: String,

    // GPS
    gps: {
        lat: Number,
        lng: Number
    },

    timestamp: { type: Date, default: Date.now }
});

const Sensor = mongoose.model("Sensor", sensorSchema);

// POST → receive data from Pi
app.post("/api/sensor", async (req, res) => {
    try {
        const newData = new Sensor(req.body);
        await newData.save();

        console.log("📡 Data received:", req.body);

        res.status(200).json({ message: "Data saved" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET → latest data
app.get("/api/sensor", async (req, res) => {
    try {
        const data = await Sensor.find()
            .sort({ timestamp: -1 })
            .limit(1);

        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server
app.listen(5000, () => {
    console.log("🚀 Server running on port 5000");
});