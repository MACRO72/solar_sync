
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
                // Correct mapping for: "253002,506322,0.00,-0.60,28.94,10.83,4095"
                // index 0: part of ID
                // index 1: part of ID
                // index 2: current (A)
                // index 3: power (W)
                // index 4: temperature (°C)
                // index 5: voltage (V)
                // index 6: irradiance raw value

                const current = parseFloat(values[2]);
                const power = parseFloat(values[3]);
                const temperature = parseFloat(values[4]);
                const voltage = parseFloat(values[5]);
                // The irradiance value seems to be an ADC reading, not W/m².
                // We'll scale it to a more realistic range, e.g., 0-1200 W/m².
                // Assuming 4095 is max reading.
                const irradiance = (parseFloat(values[6]) / 4095) * 1200;

                let efficiency = 0;
                // Efficiency = (Power Output / (Panel Area * Irradiance)) * 100
                // Assuming a standard panel area of 1.6 m² for calculation.
                const panelArea = 1.6;
                const absolutePower = Math.abs(power);
                if (irradiance > 0 && panelArea > 0 && absolutePower > 0) {
                    efficiency = (absolutePower / (irradiance * panelArea)) * 100;
                }
                // Cap efficiency at a realistic 25% and ensure it's not negative.
                efficiency = Math.max(0, Math.min(efficiency, 25));

                const device: Device = {
                    id: `ESP32_${values[0]}`,
                    name: `Solar Panel ${values[0]}`,
                    status: 'Online',
                    lastSeen: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
                    power: absolutePower, // Power should be positive
                    current: current,
                    temperature: temperature,
                    voltage: voltage,
                    irradiance: irradiance,
                    efficiency: efficiency,
                    humidity: 50, // Mock value
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
