'use client';
import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import type { Device } from '@/lib/types';
import { app } from '@/firebase/config';
import { format } from 'date-fns';

export function useRealtimeData() {
  const [data, setData] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const db = getDatabase(app);
    const dataRef = ref(db, 'data');

    const unsubscribe = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        const rawData = snapshot.val();
        const devicesArray: Device[] = [];

        // Check if rawData is a string (our CSV format)
        if (typeof rawData === 'string') {
            const values = rawData.split(',');

            if (values.length >= 7) {
                // Correct mapping based on the provided CSV format:
                // "253002,506322,0.00,-0.60,28.94,10.83,4095"
                // index 0: part of ID
                // index 1: part of ID
                // index 2: current
                // index 3: power
                // index 4: temperature
                // index 5: voltage
                // index 6: irradiance

                const current = parseFloat(values[2]);
                const power = parseFloat(values[3]);
                const temperature = parseFloat(values[4]);
                const voltage = parseFloat(values[5]);
                const irradiance = parseFloat(values[6]);

                let efficiency = 0;
                // Avoid division by zero if irradiance is 0
                if (irradiance > 0) {
                    // A more realistic efficiency calculation would need panel area,
                    // but for a rough metric we'll use a simplified ratio.
                    // This is likely not the true efficiency but serves as a placeholder.
                    efficiency = (power / irradiance); 
                    if (efficiency > 1) efficiency = efficiency / 100; // Heuristic to scale it
                    if (efficiency > 0.25) efficiency = 0.25; // Cap at a realistic 25%
                    efficiency = efficiency * 100;
                }

                const device: Device = {
                    id: `ESP32_${values[0]}`,
                    name: `Solar Panel ${values[0]}`,
                    status: 'Online',
                    lastSeen: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
                    power: power,
                    current: current,
                    temperature: temperature,
                    voltage: voltage,
                    irradiance: irradiance,
                    efficiency: efficiency > 0 ? efficiency : 0, // Ensure efficiency is not negative
                    humidity: 50, // Mock value, as it's not in the CSV
                    dustDensity: 120, // Mock value
                };
                devicesArray.push(device);
            }
        } else if (typeof rawData === 'object' && rawData !== null) {
            // This handles cases where the database might have structured data
            Object.keys(rawData).forEach(key => {
                devicesArray.push({
                    id: key,
                    ...rawData[key]
                });
            });
        }
        
        setData(devicesArray);
      } else {
        // If snapshot doesn't exist, clear data
        setData([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase Realtime Database read failed: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { data, loading };
}
