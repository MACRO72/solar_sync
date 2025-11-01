
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
        
        if (typeof rawData === 'object' && rawData !== null) {
            const deviceData = rawData; 

            const voltage = parseFloat(deviceData.voltage || 0);
            const current = parseFloat(deviceData.current || 0);
            const power = voltage * current;

            const irradiance = parseFloat(deviceData.irradiance || 0);
            let efficiency = 0;
            // Assuming a standard panel area of 1.6 square meters for efficiency calculation
            const panelArea = 1.6; 
            if (irradiance > 0 && panelArea > 0 && power > 0) {
                efficiency = (power / (irradiance * panelArea)) * 100;
            }
            // Cap efficiency at a reasonable maximum, e.g., 25%
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
            
            // The dashboard expects an array of devices
            setData([device]);
        }
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
