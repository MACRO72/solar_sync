
"use client";

import { useState, useEffect } from "react";
import type { Device } from "@/lib/types";
import { format } from "date-fns";

export function useRealtimeData() {
  const [data, setData] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/data");
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        
        // Assuming the API returns a single device object
        const deviceData = json;

        if (typeof deviceData !== "object" || deviceData === null) {
          console.error("Invalid data format from API");
          if (data.length === 0) setLoading(false); // Only stop loading on first fail if no data
          return;
        }

        const voltage = parseFloat(deviceData.voltage ?? 0);
        const current = parseFloat(deviceData.current ?? 0);
        const power = voltage * current;
        const irradiance = parseFloat(deviceData.irradiance ?? 0);

        let efficiency = 0;
        const panelArea = 1.6; // m²
        if (irradiance > 0 && panelArea > 0 && power > 0) {
          efficiency = (power / (irradiance * panelArea)) * 100;
        }
        efficiency = Math.max(0, Math.min(efficiency, 25));

        const device: Device = {
          id: deviceData.id || "ESP32_Device",
          name: deviceData.name || `Solar Panel ${deviceData.id ?? "1"}`,
          status: "Online", // Assuming online if we get data
          lastSeen: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          power: isNaN(power) ? 0 : parseFloat(power.toFixed(2)),
          current: isNaN(current) ? 0 : current,
          temperature: parseFloat(deviceData.temperature ?? 0),
          voltage: isNaN(voltage) ? 0 : voltage,
          irradiance: isNaN(irradiance) ? 0 : irradiance,
          efficiency: parseFloat(efficiency.toFixed(2)),
          humidity: parseFloat(deviceData.humidity ?? 0),
          dustDensity: parseFloat(deviceData.dustDensity ?? 0),
        };
        
        setData([device]);
        setLoading(false);
      } catch (error) {
        console.error("🔥 API fetch failed:", error);
        if (data.length === 0) setLoading(false); // Stop loading on first fail
      }
    };

    fetchData(); // Fetch immediately on mount
    const intervalId = setInterval(fetchData, 5000); // Fetch every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [data.length]); // Re-run effect if data array becomes empty

  return { data, loading };
}
