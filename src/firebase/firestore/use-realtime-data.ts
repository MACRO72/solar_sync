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

    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const rawData = snapshot.val();
          console.log('Last data from DB:', rawData);

          if (typeof rawData === 'object' && rawData !== null) {
            const devices: Device[] = Object.keys(rawData).map((key, index) => {
              const deviceData = rawData[key];
              const voltage = deviceData.voltage || 0;
              const current = deviceData.current || 0;
              const power = voltage * current;
              const irradiance = deviceData.irradiance || 0;
              const temperature = deviceData.temperature || 0;
              const humidity = deviceData.humidity || 0;
              const dustDensity = deviceData.dustDensity || 0;

              let efficiency = 0;
              const panelArea = 1.6; // Standard panel area in m²
              if (irradiance > 0 && panelArea > 0 && power > 0) {
                efficiency = (power / (irradiance * panelArea)) * 100;
              }
              
              efficiency = Math.max(0, Math.min(efficiency, 25)); // Clamp efficiency

              return {
                id: key,
                name: `Solar Panel ${index + 1}`,
                status: 'Online',
                lastSeen: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                power: isNaN(power) ? 0 : parseFloat(power.toFixed(2)),
                current: isNaN(current) ? 0 : current,
                temperature: isNaN(temperature) ? 0 : temperature,
                voltage: isNaN(voltage) ? 0 : voltage,
                irradiance: isNaN(irradiance) ? 0 : irradiance,
                efficiency: isNaN(efficiency) ? 0 : parseFloat(efficiency.toFixed(2)),
                humidity: isNaN(humidity) ? 0 : humidity,
                dustDensity: isNaN(dustDensity) ? 0 : dustDensity,
              };
            });
            setData(devices);
          } else {
            console.error(
              'Invalid data format received from Firebase. Expected an object.',
              rawData
            );
          }
        } else {
          console.warn(
            'No data found in Realtime Database at path: /data. Holding last known data.'
          );
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

    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs only once on mount.

  return { data, loading };
}
