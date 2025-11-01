
'use client';
import { useRealtimeData } from "@/firebase/firestore/use-realtime-data";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardOverviewPage() {
  const { data: devices, loading } = useRealtimeData();

  return (
    <div className="text-center py-8">
      <h1 className="text-4xl font-bold text-[#00d9ff] mb-8">🌐 ESP32 LoRa Live Data Feed</h1>
      
      <div className="overflow-x-auto rounded-lg shadow-[0px_0px_10px_#00d9ff44]">
        <table className="w-full border-collapse bg-[#1c2541] text-white">
          <thead>
            <tr>
              <th className="border-b border-[#3a506b] p-3 text-left bg-[#3a506b] text-[#00d9ff]">Time</th>
              <th className="border-b border-[#3a506b] p-3 text-left bg-[#3a506b] text-[#00d9ff]">Voltage (V)</th>
              <th className="border-b border-[#3a506b] p-3 text-left bg-[#3a506b] text-[#00d9ff]">Current (A)</th>
              <th className="border-b border-[#3a506b] p-3 text-left bg-[#3a506b] text-[#00d9ff]">Temp (°C)</th>
              <th className="border-b border-[#3a506b] p-3 text-left bg-[#3a506b] text-[#00d9ff]">Humidity (%)</th>
              <th className="border-b border-[#3a506b] p-3 text-left bg-[#3a506b] text-[#00d9ff]">Light (lx)</th>
              <th className="border-b border-[#3a506b] p-3 text-left bg-[#3a506b] text-[#00d9ff]">ADC</th>
            </tr>
          </thead>
          <tbody>
            {loading && devices.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-400">Listening for live data from your device...</td>
              </tr>
            )}
            {devices.map((device) => (
              <tr key={device.id} className="hover:bg-[#1f2a44]">
                <td className="border-b border-[#3a506b] p-3">{device.lastSeen}</td>
                <td className="border-b border-[#3a506b] p-3">{device.voltage ?? '--'}</td>
                <td className="border-b border-[#3a506b] p-3">{device.current ?? '--'}</td>
                <td className="border-b border-[#3a506b] p-3">{device.temperature ?? '--'}</td>
                <td className="border-b border-[#3a506b] p-3">{device.humidity ?? '--'}</td>
                <td className="border-b border-[#3a506b] p-3">{device.irradiance ?? '--'}</td>
                <td className="border-b border-[#3a506b] p-3">{device.dustDensity ?? '--'}</td>
              </tr>
            ))}
             {!loading && devices.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-400">No data received yet. Make sure your ESP32 is sending data.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
