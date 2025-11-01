
"use client";

import { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import type { Device } from "@/lib/types";
import { app } from "@/firebase/config";
import { format } from "date-fns";

export function useRealtimeData() {
  const [data, setData] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase(app);
    const dataRef = ref(db, "data"); // ✅ Change path if needed

    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          console.warn("No data found in Realtime Database");
          setData([]);
          setLoading(false);
          return;
        }

        const rawData = snapshot.val();
        if (typeof rawData !== "object" || rawData === null) {
          console.error("Invalid data format");
          setLoading(false);
          return;
        }

        const deviceData = rawData as any;
        const voltage = parseFloat(deviceData.voltage ?? 0);
        const current = parseFloat(deviceData.current ?? 0);
        const power = voltage * current;
        const irradiance = parseFloat(deviceData.irradiance ?? 0);

        // Default efficiency to 0
        let efficiency = 0;
        const panelArea = 1.6; // m²
        if (irradiance > 0 && panelArea > 0 && power > 0) {
          efficiency = (power / (irradiance * panelArea)) * 100;
        }

        // Clamp efficiency between 0 and 25%
        efficiency = Math.max(0, Math.min(efficiency, 25));

        const device: Device = {
          id: "ESP32_Device",
          name: `Solar Panel ${deviceData.id ?? "1"}`,
          status: "Online",
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

        // The dashboard expects an array of devices
        setData([device]);
        setLoading(false);
      },
      (error) => {
        console.error("🔥 Firebase Realtime Database read failed:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { data, loading };
}
