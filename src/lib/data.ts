import type { Device, Alert, PerformanceData, Stat, HistoricalData, PowerData, DustData, TempData } from './types';
import { Gauge, Zap, Wind, Thermometer, Sun, Percent } from "lucide-react";

// This file is now empty of mock data.
// All components will rely on real-time data from Firestore.

export const stats: Stat[] = [];

export const devices: Device[] = [];

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
