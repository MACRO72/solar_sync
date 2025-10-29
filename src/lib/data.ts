import type { Device, Alert, PerformanceData, Stat, HistoricalData } from './types';
import { Gauge, Zap, Wind, Thermometer, HeartPulse, Wrench } from "lucide-react";

export const stats: Stat[] = [
    { title: "System Efficiency", value: "98.7%", icon: Gauge, change: "+0.2%", color: "text-primary" },
    { title: "Energy Output", value: "3,450 kWh", icon: Zap, change: "+5%", color: "text-orange-500" },
    { title: "Dust Index", value: "Low", icon: Wind, change: "Stable", color: "text-status-neutral" },
    { title: "Avg. Temperature", value: "48°C", icon: Thermometer, change: "-1°C", color: "text-destructive" },
    { title: "System Health", value: "99.5%", icon: HeartPulse, change: "Excellent", color: "text-status-positive" },
    { title: "Maintenance", value: "None Due", icon: Wrench, change: "All systems normal", color: "text-primary" },
];

export const devices: Device[] = [
  { id: 'north-wing-panel-a1', name: 'North Wing Panel A1', status: 'Online', lastSeen: '1 min ago', temperature: 45, energyOutput: 1.2, location: { lat: 34.0522, lng: -118.2437 } },
  { id: 'north-wing-panel-a2', name: 'North Wing Panel A2', status: 'Online', lastSeen: '2 mins ago', temperature: 47, energyOutput: 1.3, location: { lat: 34.0532, lng: -118.2447 } },
  { id: 'south-wing-panel-b1', name: 'South Wing Panel B1', status: 'Error', lastSeen: '5 mins ago', temperature: 55, energyOutput: 0.8, location: { lat: 34.0512, lng: -118.2427 } },
  { id: 'south-wing-panel-b2', name: 'South Wing Panel B2', status: 'Online', lastSeen: '1 hour ago', temperature: 30, energyOutput: 1.0, location: { lat: 34.0502, lng: -118.2417 } },
  { id: 'east-wing-panel-c1', name: 'East Wing Panel C1', status: 'Online', lastSeen: '3 mins ago', temperature: 46, energyOutput: 1.25, location: { lat: 34.0522, lng: -118.2407 } },
  { id: 'east-wing-panel-c2', name: 'East Wing Panel C2', status: 'Offline', lastSeen: '3 days ago', temperature: 25, energyOutput: 0, location: { lat: 34.0522, lng: -118.2397 } },
];

export const alerts: Alert[] = [
  { id: '1', title: 'Inverter Failure Predicted', description: 'AI predicts a potential failure in inverter #3 within the next 48 hours.', timestamp: '2 mins ago', severity: 'High' },
  { id: '2', title: 'Panel Dusting Required', description: 'High dust index on North Wing panels. Cleaning recommended to improve efficiency.', timestamp: '30 mins ago', severity: 'Medium' },
  { id: '3', title: 'Routine Checkup', description: 'System health check completed. All systems nominal.', timestamp: '1 hour ago', severity: 'Low' },
];

const generatePerformanceData = (points: number, period: 'hour' | 'day' | 'month') => {
  let data = [];
  const now = new Date();

  for (let i = 0; i < points; i++) {
    let label = '';
    const date = new Date(now);
    
    if (period === 'hour') {
      date.setHours(now.getHours() - (points - 1 - i));
      label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (period === 'day') {
      date.setDate(now.getDate() - (points - 1 - i));
      label = date.toLocaleDateString([], { day: '2-digit', month: 'short' });
    } else if (period === 'month') {
      date.setMonth(now.getMonth() - (points - 1 - i));
      label = date.toLocaleDateString([], { month: 'short', year: '2-digit'});
    }

    const baseActual = 300 + Math.sin(i / 5) * 50 + Math.random() * 50;
    const actual = Math.max(0, baseActual + Math.random() * 30);
    const predicted = Math.max(0, baseActual + (Math.random() - 0.5) * 40);

    data.push({ time: label, actual: Math.round(actual), predicted: Math.round(predicted) });
  }
  return data;
};


export const performanceData = {
    '24h': generatePerformanceData(24, 'hour'),
    '7d': generatePerformanceData(7, 'day'),
    '30d': generatePerformanceData(30, 'day'),
    '12m': generatePerformanceData(12, 'month'),
};

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
