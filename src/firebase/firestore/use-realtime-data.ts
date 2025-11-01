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
        
        // Data is coming as a single CSV string: "253002,506322,0.00,-0.60,28.94,10.83,4095"
        // We need to parse it.
        const devicesArray: Device[] = [];

        if (typeof rawData === 'string') {
            const values = rawData.split(',');

            if (values.length >= 7) {
                const device: Device = {
                    id: `Device_${values[0]}`,
                    name: `Panel ${values[0]}`,
                    status: 'Online',
                    lastSeen: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
                    power: parseFloat(values[2]),
                    current: parseFloat(values[3]),
                    temperature: parseFloat(values[4]),
                    voltage: parseFloat(values[5]),
                    irradiance: parseFloat(values[6]),
                    // Calculate other values if possible
                    efficiency: (parseFloat(values[2]) / parseFloat(values[6])) * 100, // Example efficiency calc
                    humidity: 50, // Mock value
                    dustDensity: 120, // Mock value
                };
                devicesArray.push(device);
            }
        } else if (typeof rawData === 'object' && rawData !== null) {
            // Handle if data is structured JSON object (from previous attempts)
            Object.keys(rawData).forEach(key => {
                devicesArray.push({
                    id: key,
                    ...rawData[key]
                });
            });
        }
        setData(devicesArray);
      } else {
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
