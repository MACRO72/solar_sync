import type { Device, Alert, PerformanceData, Stat, HistoricalData } from './types';
import { Gauge, Zap, Wind, Thermometer, HeartPulse } from "lucide-react";

export const stats: Stat[] = [
    { title: "System Efficiency", value: "98.7%", icon: Gauge, change: "+0.2%", color: "text-blue-500" },
    { title: "Energy Output", value: "3,450 kWh", icon: Zap, change: "+5%", color: "text-yellow-500" },
    { title: "Dust Index", value: "Low", icon: Wind, change: "Stable", color: "text-gray-400" },
    { title: "Avg. Temperature", value: "48°C", icon: Thermometer, change: "-1°C", color: "text-red-500" },
    { title: "System Health", value: "99.5%", icon: HeartPulse, change: "Excellent", color: "text-green-500" },
];

export const devices: Device[] = [
  { id: 'ESP32-A1', name: 'North Wing Panel A1', status: 'Online', lastSeen: '1 min ago', temperature: 45, energyOutput: 1.2, location: { lat: 34.0522, lng: -118.2437 } },
  { id: 'ESP32-A2', name: 'North Wing Panel A2', status: 'Online', lastSeen: '2 mins ago', temperature: 47, energyOutput: 1.3, location: { lat: 34.0532, lng: -118.2447 } },
  { id: 'ESP32-B1', name: 'South Wing Panel B1', status: 'Error', lastSeen: '5 mins ago', temperature: 55, energyOutput: 0.8, location: { lat: 34.0512, lng: -118.2427 } },
  { id: 'ESP32-B2', name: 'South Wing Panel B2', status: 'Offline', lastSeen: '1 hour ago', temperature: 30, energyOutput: 0, location: { lat: 34.0502, lng: -118.2417 } },
  { id: 'ESP32-C1', name: 'East Wing Panel C1', status: 'Online', lastSeen: '3 mins ago', temperature: 46, energyOutput: 1.25, location: { lat: 34.0522, lng: -118.2407 } },
  { id: 'ESP32-C2', name: 'East Wing Panel C2', status: 'Offline', lastSeen: '3 days ago', temperature: 25, energyOutput: 0, location: { lat: 34.0522, lng: -118.2397 } },
];

export const alerts: Alert[] = [
  { id: '1', title: 'Inverter Failure Predicted', description: 'AI predicts a potential failure in inverter #3 within the next 48 hours.', timestamp: '2 mins ago', severity: 'High' },
  { id: '2', title: 'Panel Dusting Required', description: 'High dust index on North Wing panels. Cleaning recommended to improve efficiency.', timestamp: '30 mins ago', severity: 'Medium' },
  { id: '3', title: 'Routine Checkup', description: 'System health check completed. All systems nominal.', timestamp: '1 hour ago', severity: 'Low' },
];

export const performanceData: PerformanceData[] = [
  { month: 'Jan', actual: 320, predicted: 300 },
  { month: 'Feb', actual: 350, predicted: 340 },
  { month: 'Mar', actual: 450, predicted: 460 },
  { month: 'Apr', actual: 510, predicted: 500 },
  { month: 'May', actual: 550, predicted: 560 },
  { month: 'Jun', actual: 580, predicted: 600 },
  { month: 'Jul', actual: 610, predicted: 620 },
  { month: 'Aug', actual: 590, predicted: 600 },
  { month: 'Sep', actual: 540, predicted: 550 },
  { month: 'Oct', actual: 480, predicted: 470 },
  { month: 'Nov', actual: 410, predicted: 400 },
  { month: 'Dec', actual: 360, predicted: 350 },
];

const generateHistoricalData = (base: number, volatility: number, days = 30) => {
    return Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        value: Math.round(base + (Math.random() - 0.5) * volatility * base),
    }));
};

export const historicalData: HistoricalData = {
    "System Efficiency": generateHistoricalData(98, 0.05),
    "Energy Output": generateHistoricalData(115, 0.2),
    "Dust Index": generateHistoricalData(5, 0.5),
    "Avg. Temperature": generateHistoricalData(48, 0.1),
    "System Health": generateHistoricalData(99, 0.02),
}
