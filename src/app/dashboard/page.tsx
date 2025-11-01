
'use client';
import { useRealtimeData } from "@/firebase/firestore/use-realtime-data";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardOverviewPage() {
  const { data: devices, loading } = useRealtimeData();
  const device = devices[0]; // We are expecting a single device object

  const StatCard = ({ label, value, unit, isLoading }: { label: string, value: any, unit: string, isLoading: boolean }) => (
    <div className="bg-[#1c2541] mx-auto my-4 p-5 rounded-lg w-[300px] shadow-[0px_0px_10px_#00d9ff44] text-lg">
      {label}: {' '}
      {isLoading ? (
        <Skeleton className="h-6 w-20 inline-block bg-gray-500" />
      ) : (
        <span className="font-bold text-[#00d9ff]">
          {value !== undefined && value !== null ? value : '--'}
        </span>
      )}
      {' '}{unit}
    </div>
  );

  return (
    <div className="text-center py-8">
      <h1 className="text-4xl font-bold text-[#00d9ff] mb-8">🌐 ESP32 LoRa Realtime Dashboard</h1>
      
      <StatCard 
        label="Voltage" 
        value={device?.voltage} 
        unit="V"
        isLoading={loading}
      />
      <StatCard 
        label="Current" 
        value={device?.current} 
        unit="A"
        isLoading={loading}
      />
      <StatCard 
        label="Power" 
        value={device?.power} 
        unit="W"
        isLoading={loading}
      />
      <StatCard 
        label="Temperature" 
        value={device?.temperature} 
        unit="°C"
        isLoading={loading}
      />
      <StatCard 
        label="Humidity" 
        value={device?.humidity} 
        unit="%"
        isLoading={loading}
      />
      <StatCard 
        label="Light Intensity" 
        value={device?.irradiance} 
        unit="lx"
        isLoading={loading}
      />
      <StatCard 
        label="ADC" 
        value={device?.dustDensity}
        unit=""
        isLoading={loading}
      />
    </div>
  );
}
