// Mock sensor data — this simulates what the real hardware will send later
// When we connect the actual RC car, we just replace this with live API data

export const currentSensors = {
    temperature: 32.4,
    humidity: 68,
    soilMoisture: 42,
    gasLevel: 15,
    rainDetected: false,
    waterLevel: 75,
  }
  
  export const sensorHistory = [
    { time: '10:00', temperature: 29, humidity: 65, soilMoisture: 38 },
    { time: '10:15', temperature: 30, humidity: 66, soilMoisture: 39 },
    { time: '10:30', temperature: 31, humidity: 67, soilMoisture: 40 },
    { time: '10:45', temperature: 31, humidity: 68, soilMoisture: 41 },
    { time: '11:00', temperature: 32, humidity: 68, soilMoisture: 42 },
    { time: '11:15', temperature: 33, humidity: 70, soilMoisture: 44 },
    { time: '11:30', temperature: 32, humidity: 69, soilMoisture: 43 },
    { time: '11:45', temperature: 34, humidity: 71, soilMoisture: 45 },
    { time: '12:00', temperature: 33, humidity: 70, soilMoisture: 44 },
  ]
  
  export const alerts = [
    { id: 1, type: 'animal',  message: 'Animal detected near north zone',  time: '11:42 AM', severity: 'high'   },
    { id: 2, type: 'human',   message: 'Human motion detected — east side', time: '10:58 AM', severity: 'high'   },
    { id: 3, type: 'sensor',  message: 'Soil moisture dropping below 35%',  time: '10:30 AM', severity: 'medium' },
    { id: 4, type: 'system',  message: 'GPS signal weak — reconnecting',    time: '09:15 AM', severity: 'low'    },
  ]
  
  export const cropHistory = [
    { season: 'Kharif 2023', crop: 'Rice',   yield: 4.2, area: 2.5, status: 'completed' },
    { season: 'Rabi 2023',   crop: 'Wheat',  yield: 3.8, area: 2.0, status: 'completed' },
    { season: 'Kharif 2024', crop: 'Maize',  yield: 5.1, area: 3.0, status: 'completed' },
    { season: 'Rabi 2024',   crop: 'Wheat',  yield: 4.0, area: 2.5, status: 'completed' },
    { season: 'Kharif 2025', crop: 'Soybean',yield: 2.9, area: 2.0, status: 'completed' },
  ]
  
  export const cropSuggestions = [
    { crop: 'Wheat',   confidence: 92, reason: 'High yield history in Rabi season for this area' },
    { crop: 'Mustard', confidence: 85, reason: 'Soil moisture and temperature are ideal'          },
    { crop: 'Gram',    confidence: 78, reason: 'Good rotation after Kharif soybean'               },
  ]
  
  export const gpsRoute = [
    [23.2599, 77.4126],
    [23.2601, 77.4130],
    [23.2605, 77.4135],
    [23.2608, 77.4140],
    [23.2610, 77.4145],
  ]
  
  export const carPosition = [23.2610, 77.4145]
  
  export const cameraDetections = [
    { id: 1, label: 'Person', confidence: 0.94, box: { top: 25, left: 30, width: 15, height: 45 }, color: '#4ade80', time: '12:01 PM' },
    { id: 2, label: 'Dog', confidence: 0.82, box: { top: 60, left: 65, width: 12, height: 20 }, color: '#facc15', time: '12:02 PM' },
  ]