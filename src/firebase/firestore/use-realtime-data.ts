
'use client';

import { useState, useEffect } from 'react';
import { getDatabase, ref, onChildAdded, off } from 'firebase/database';
import type { Device } from '@/lib/types';
import { app } from '@/firebase/config';

// --- Panel Configuration ---
// You can adjust this value to match the surface area of your solar panel in square meters.
// Example: A 20cm x 25cm panel has an area of 0.20 * 0.25 = 0.05 m².
const PANEL_AREA_M2 = 0.05;


/**
 * A hook to get a real-time feed of device data from Firebase Realtime Database.
 * This hook listens for new children added to the 'data' path and prepends them to a list.
 */
export function useRealtimeData() {
  const [data, setData] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase(app);
    const dataRef = ref(db, 'data');

    const handleNewData = (snapshot: any) => {
      if (snapshot.exists()) {
        const rawData = snapshot.val();
        // Use ISO string for full date context, fallback to rawData.Time if it exists
        const timestamp = rawData.Time ? rawData.Time : new Date().toISOString();

        const voltage = parseFloat(rawData.Voltage || '0');
        const current = Math.abs(parseFloat(rawData.Current || '0'));
        const power = voltage * current; // Calculate power from V * I
        const temperature = parseFloat(rawData.Temperature || '0');
        const humidity = parseFloat(rawData.Humidity || '0');
        const irradiance = parseFloat(rawData.LightIntensity || '0');
        const dustDensity = parseFloat(rawData.ADC || '0');

        // Calculate Efficiency
        let efficiency = 0;
        if (irradiance > 0 && PANEL_AREA_M2 > 0) {
            const inputPower = irradiance * PANEL_AREA_M2;
            if (inputPower > 0) {
                 efficiency = (power / inputPower) * 100;
            }
        }

        const newDevice: Device = {
          id: snapshot.key as string,
          name: "ESP32 Node", // Name can be static if there's only one source
          status: 'Online',
          lastSeen: timestamp,
          voltage,
          current,
          power,
          temperature,
          humidity,
          irradiance,
          dustDensity,
          efficiency: Math.max(0, Math.min(100, efficiency)), // Clamp efficiency between 0 and 100
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

    // Cleanup subscription on component unmount
    return () => {
      off(dataRef, 'child_added', listener);
    };
  }, []); // Empty dependency array ensures this effect runs only once

  return { data, loading };
}
