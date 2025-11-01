'use client';

import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import type { Device } from '@/lib/types';
import { app } from '@/firebase/config';
import { format } from 'date-fns';

/**
 * Utility to safely parse a value into a number.
 * Returns the number or a default value (0).
 */
function parseAsNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}


/**
 * A hook to get real-time device data from Firebase Realtime Database.
 * This hook assumes the 'data' path in Firebase contains a single object
 * with all the latest sensor readings for one device.
 */
export function useRealtimeData() {
  const [data, setData] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase(app);
    const dataRef = ref(db, 'data');

    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const rawData = snapshot.val();
          console.log('Last data from DB:', rawData);

          // Check if the received data is a single object
          if (typeof rawData === 'object' && rawData !== null && !Array.isArray(rawData)) {
            
            const voltage = parseAsNumber(rawData.Voltage);
            const current = parseAsNumber(rawData.Current);
            const irradiance = parseAsNumber(rawData.LightIntensity); // Assuming LightIntensity is irradiance
            const power = voltage * current;

            let efficiency = 0;
            const panelArea = 1.6; // Standard panel area in m²
            if (irradiance > 0 && panelArea > 0 && power > 0) {
                efficiency = (power / (irradiance * panelArea)) * 100;
            }
            // Clamp efficiency to a realistic range (e.g., 0-25%)
            efficiency = Math.max(0, Math.min(efficiency, 25));

            const device: Device = {
                id: rawData.id || "ESP32_Device", // Use an ID from data or a fallback
                name: "Live Solar Panel",
                status: 'Online',
                lastSeen: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                temperature: parseAsNumber(rawData.Temperature),
                humidity: parseAsNumber(rawData.Humidity),
                dustDensity: parseAsNumber(rawData.ADC), // Assuming ADC is dust density
                irradiance: irradiance,
                voltage: voltage,
                current: current,
                power: parseFloat(power.toFixed(2)),
                efficiency: parseFloat(efficiency.toFixed(2)),
            };
            
            // Set state with an array containing the single device
            setData([device]);

          } else {
            console.error('Invalid data format received from Firebase. Expected a single object.', rawData);
          }
        } else {
          // If no data exists, we don't clear the last state to keep the UI "sticky"
          console.warn('No data found in Realtime Database at path: /data. Holding last known data.');
        }

        if (loading) {
          setLoading(false);
        }
      },
      (error) => {
        console.error('🔥 Firebase Realtime Database read failed:', error);
        setLoading(false);
      }
    );

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this effect runs only once

  return { data, loading };
}
