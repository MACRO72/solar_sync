import type { Device, Alert, PerformanceData, Stat, HistoricalData, PowerData, DustData, TempData } from './types';
import { Gauge, Zap, Wind, Thermometer, Sun, Percent } from "lucide-react";

// This file contains mock data for demonstration purposes.
// In a real application, this data would be fetched from a live database.

export const stats: Stat[] = [];

export const devices: Device[] = [];

// Recent alerts are now generated dynamically in the RecentAlerts component
export const alerts: Alert[] = [];

export const performanceData = {
    '24h': [],
    '7d': [],
    '30d': [],
    '12m': [],
};

export const powerData = {
    '24h': [],
    '7d': [],
    '30d': [],
};

export const dustData = {
    '24h': [],
    '7d': [],
    '30d': [],
};

export const tempData = {
    '24h': [],
    '7d': [],
    '30d': [],
};

export const historicalData: HistoricalData = {};
