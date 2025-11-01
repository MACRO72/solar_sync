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
    const dataRef = ref(db, "data"); 

    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        if (snapshot.exists()) {
            const rawData = snapshot.val();
            console.log("Last data from DB:", rawData);

            if (typeof rawData === "object" && rawData !== null) {
                const devices: Device[] = Object.keys(rawData).map((key) => {
                    const deviceData = rawData[key];
                    const voltage = parseFloat(deviceData.voltage || 0);
                    const current = parseFloat(deviceData.current || 0);
                    const power = voltage * current;
                    const irradiance = parseFloat(deviceData.irradiance || 0);

                    let efficiency = 0;
                    const panelArea = 1.6; // m²
                    if (irradiance > 0 && panelArea > 0 && power > 0) {
                      efficiency = (power / (irradiance * panelArea)) * 100;
                    }

                    efficiency = Math.max(0, Math.min(efficiency, 25));

                    return {
                      id: deviceData.id || key,
                      name: `Solar Panel ${deviceData.id || "Unknown"}`,
                      status: "Online",
                      lastSeen: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
                      power: isNaN(power) ? 0 : parseFloat(power.toFixed(2)),
                      current: isNaN(current) ? 0 : current,
                      temperature: parseFloat(deviceData.temperature || 0),
                      voltage: isNaN(voltage) ? 0 : voltage,
                      irradiance: isNaN(irradiance) ? 0 : irradiance,
                      efficiency: isNaN(efficiency) ? 0 : parseFloat(efficiency.toFixed(2)),
                      humidity: parseFloat(deviceData.humidity || 0),
                      dustDensity: parseFloat(deviceData.dustDensity || 0),
                    };
                });

                setData(devices);
            } else {
                 console.error("Invalid data format received from Firebase. Expected an object.", rawData);
            }
        } else {
            console.warn("No data found in Realtime Database at path: /data. Holding last known data.");
        }
        
        if (loading) {
            setLoading(false);
        }
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
