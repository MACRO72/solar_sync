'use client';

import { useState, useEffect } from 'react';
import { getDatabase, ref, query, limitToLast, onValue } from 'firebase/database';
import type { Device } from '@/lib/types';
import { app } from '@/firebase/config';

const PANEL_AREA_M2 = 0.05;

/**
 * useRealtimeData hook
 * Listens to the 'data/' path in Firebase Realtime Database.
 * Fetches the last 100 readings to populate charts immediately.
 */
export function useRealtimeData() {
  const [data, setData] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    try {
      const db = getDatabase(app);
      const dataRef = ref(db, 'data');
      
      // Query the last 100 readings to provide immediate historical context for graphs
      const recentDataQuery = query(dataRef, limitToLast(100));

      unsubscribe = onValue(recentDataQuery, (snapshot) => {
        try {
          if (snapshot.exists()) {
            const readings: Device[] = [];
            
            snapshot.forEach((childSnapshot) => {
              const rawData = childSnapshot.val();
              if (!rawData) return;

              const timestamp = rawData.Time || new Date().toISOString();

              const voltage = parseFloat(rawData.Voltage || '0');
              const currentMA = parseFloat(rawData.Current_mA || rawData.Current || '0');
              const currentA = Math.abs(currentMA / 1000); 
              
              const power = voltage * currentA;
              const temperature = parseFloat(rawData.Temperature || '0');
              const humidity = parseFloat(rawData.Humidity || '0');
              const irradiance = parseFloat(rawData.LightIntensity || '0');
              const dustDensity = parseFloat(rawData.ADC || '0');

              let efficiency = 0;
              if (irradiance > 0 && PANEL_AREA_M2 > 0) {
                  const inputPower = (irradiance / 10) * PANEL_AREA_M2; 
                  if (inputPower > 0) {
                       efficiency = (power / inputPower) * 100;
                  }
              }

              readings.push({
                id: childSnapshot.key as string,
                name: "SolarSync Node",
                lastSeen: timestamp,
                voltage,
                current: currentMA,
                power,
                temperature,
                humidity,
                irradiance,
                dustDensity,
                tiltAngle: 30.0,
                efficiency: Math.max(0, Math.min(100, efficiency)),
              } as any);
            });

            setData(readings.reverse());
          }
          setLoading(false);
        } catch (innerError: any) {
          console.error("❌ Error parsing Firebase data snapshot:", innerError.message);
          setLoading(false);
        }
      }, (error) => {
         console.error("🔥 Firebase Realtime Database read failed (Permission or Network):", error.message);
         setLoading(false);
      });
    } catch (outerError: any) {
      console.error("🚨 Failed to initialize Firebase Realtime Database connection:", outerError.message);
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  return { data, loading };
}
