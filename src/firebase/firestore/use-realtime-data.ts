
'use client';

import { useState, useEffect } from 'react';
import { getDatabase, ref, onChildAdded, off } from 'firebase/database';
import type { Device } from '@/lib/types';
import { app } from '@/firebase/config';

const PANEL_AREA_M2 = 0.05;

export function useRealtimeData() {
  const [data, setData] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase(app);
    const dataRef = ref(db, 'data');

    const handleNewData = (snapshot: any) => {
      if (snapshot.exists()) {
        const rawData = snapshot.val();
        const timestamp = rawData.Time ? rawData.Time : new Date().toISOString();

        const voltage = parseFloat(rawData.Voltage || '0');
        // Handle Current_mA as requested
        const currentMA = parseFloat(rawData.Current_mA || rawData.Current || '0');
        const current = Math.abs(currentMA / 1000); // Convert mA to A for calculations
        
        const power = voltage * current;
        const temperature = parseFloat(rawData.Temperature || '0');
        const humidity = parseFloat(rawData.Humidity || '0');
        const irradiance = parseFloat(rawData.LightIntensity || '0');
        const dustDensity = parseFloat(rawData.ADC || '0');

        let efficiency = 0;
        if (irradiance > 0 && PANEL_AREA_M2 > 0) {
            const inputPower = irradiance * PANEL_AREA_M2;
            if (inputPower > 0) {
                 efficiency = (power / inputPower) * 100;
            }
        }

        const newDevice: Device = {
          id: snapshot.key as string,
          name: "ESP32 Node",
          status: 'Online',
          lastSeen: timestamp,
          voltage,
          current: currentMA,
          power,
          temperature,
          humidity,
          irradiance,
          dustDensity,
          efficiency: Math.max(0, Math.min(100, efficiency)),
        };
        
        setData((prevData) => [newDevice, ...prevData]);
      }
      if (loading) {
        setLoading(false);
      }
    };

    const listener = onChildAdded(dataRef, handleNewData, (error) => {
       console.error("🔥 Firebase Realtime Database read failed:", error);
       setLoading(false);
    });

    return () => {
      off(dataRef, 'child_added', listener);
    };
  }, []);

  return { data, loading };
}
