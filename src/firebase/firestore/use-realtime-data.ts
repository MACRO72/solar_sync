
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
    // The data is at the root 'data' path in the Realtime Database.
    const dataRef = ref(db, 'data');

    const unsubscribe = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        const rawData = snapshot.val();
        const devicesArray: Device[] = [];

        // The data arrives as a single CSV string: "253002,506322,0.00,-0.60,28.94,10.83,4095"
        if (typeof rawData === 'string') {
            const values = rawData.split(',');

            if (values.length >= 7) {
                // Correct mapping based on the CSV format:
                // index 0: 253002 (ID part 1)
                // index 1: 506322 (ID part 2)
                // index 2: 0.00   (Current)
                // index 3: -0.60  (Power)
                // index 4: 28.94  (Temperature)
                // index 5: 10.83  (Voltage)
                // index 6: 4095   (Raw Irradiance ADC)

                const current = parseFloat(values[2]);
                const power = parseFloat(values[3]);
                const temperature = parseFloat(values[4]);
                const voltage = parseFloat(values[5]);
                
                // The irradiance value (4095) is a raw ADC reading from the sensor.
                // We need to scale it to a realistic range, like 0-1200 W/m².
                // Assuming 4095 is the maximum possible reading.
                const irradiance = (parseFloat(values[6]) / 4095) * 1200;

                let efficiency = 0;
                // Efficiency = (Power Output / (Panel Area * Irradiance)) * 100
                // We'll assume a standard panel area of 1.6 m² for the calculation.
                const panelArea = 1.6;
                // Power might be negative, but for efficiency, we should use its magnitude.
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
                    // Ensure power is stored as a positive value for display.
                    power: absolutePower,
                    current: current,
                    temperature: temperature,
                    voltage: voltage,
                    irradiance: isNaN(irradiance) ? 0 : parseFloat(irradiance.toFixed(2)),
                    efficiency: isNaN(efficiency) ? 0 : parseFloat(efficiency.toFixed(2)),
                    // These values are not in the CSV, so we provide mock data.
                    humidity: 50, 
                    dustDensity: 120,
                };
                devicesArray.push(device);
            }
        } else if (typeof rawData === 'object' && rawData !== null) {
            // This fallback handles cases where data might already be in a structured format.
            Object.keys(rawData).forEach(key => {
                devicesArray.push({
                    id: key,
                    ...rawData[key]
                });
            });
        }
        
        setData(devicesArray);
      } else {
        // If snapshot doesn't exist, clear data to show "Waiting for data...".
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
