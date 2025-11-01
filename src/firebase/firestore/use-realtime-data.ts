
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

        // Handle incoming JSON data
        if (typeof rawData === 'object' && rawData !== null) {
            const deviceData = rawData; // Assuming rawData is the JSON object for one device

            // Calculate power = voltage * current
            const voltage = parseFloat(deviceData.voltage || 0);
            const current = parseFloat(deviceData.current || 0);
            const power = voltage * current;

            // Calculate efficiency
            const irradiance = parseFloat(deviceData.irradiance || 0);
            let efficiency = 0;
            // Efficiency = (Power Output / (Panel Area * Irradiance)) * 100
            // We'll assume a standard panel area of 1.6 m² for the calculation.
            const panelArea = 1.6;
            if (irradiance > 0 && panelArea > 0 && power > 0) {
                efficiency = (power / (irradiance * panelArea)) * 100;
            }
            // Cap efficiency at a realistic 25% and ensure it's not negative.
            efficiency = Math.max(0, Math.min(efficiency, 25));

            const device: Device = {
                id: deviceData.id || 'ESP32_Device',
                name: deviceData.name || `Solar Panel ${deviceData.id || '1'}`,
                status: deviceData.status || 'Online',
                lastSeen: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
                power: isNaN(power) ? 0 : parseFloat(power.toFixed(2)),
                current: isNaN(current) ? 0 : current,
                temperature: isNaN(parseFloat(deviceData.temperature)) ? 0 : parseFloat(deviceData.temperature),
                voltage: isNaN(voltage) ? 0 : voltage,
                irradiance: isNaN(irradiance) ? 0 : irradiance,
                efficiency: isNaN(efficiency) ? 0 : parseFloat(efficiency.toFixed(2)),
                humidity: isNaN(parseFloat(deviceData.humidity)) ? 0 : parseFloat(deviceData.humidity),
                dustDensity: isNaN(parseFloat(deviceData.dustDensity)) ? 0 : parseFloat(deviceData.dustDensity),
            };
            devicesArray.push(device);
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
