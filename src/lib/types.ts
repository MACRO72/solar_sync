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
