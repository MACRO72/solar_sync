import { LucideIcon } from "lucide-react";

export type Device = {
  id: string;
  name: string;
  status: 'Online' | 'Offline' | 'Error';
  lastSeen: string;
  temperature: number;
  energyOutput: number;
  location: {
    lat: number;
    lng: number;
  };
};

export type Alert = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  severity: 'High' | 'Medium' | 'Low';
};

export type PerformanceData = {
  month: string;
  actual: number;
  predicted: number;
};

export type Stat = {
    title: string;
    value: string;
    icon: LucideIcon;
    change: string;
    color?: string;
}

export type HistoricalDataPoint = {
    day: number;
    value: number;
}

export type HistoricalData = {
    [key: string]: HistoricalDataPoint[];
}
