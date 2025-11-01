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
 * Utility to find a value in an object using a list of possible keys.
 */
function pickValue(obj: Record<string, any>, candidates: string[]): any {
  for (const key of candidates) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      if (val !== null && val !== undefined) return val;
    }
  }
  return null;
}

/**
 * Mapping of desired metric names to possible key names from the device.
 */
const KEY_MAP = {
  temperature: ["Temperature", "temperature", "temp"],
  humidity: ["Humidity", "humidity", "hum"],
  dustDensity: ["dustDensity", "dust_density", "Dust", "dust"],
  irradiance: ["Irradiance", "irradiance", "solar_irradiance"],
  voltage: ["Voltage", "voltage", "volt", "V"],
  current: ["Current", "current", "curr", "A"],
};

/**
 * Normalizes a raw device object from Firebase into a structured Device type.
 */
function normalizeDeviceData(key: string, rawData: any, index: number): Device {
    const voltage = parseAsNumber(pickValue(rawData, KEY_MAP.voltage));
    const current = parseAsNumber(pickValue(rawData, KEY_MAP.current));
    const irradiance = parseAsNumber(pickValue(rawData, KEY_MAP.irradiance));
    
    const power = voltage * current;
    
    let efficiency = 0;
    const panelArea = 1.6; // Standard panel area in m²
    if (irradiance > 0 && panelArea > 0 && power > 0) {
        efficiency = (power / (irradiance * panelArea)) * 100;
    }
    // Clamp efficiency to a realistic range (e.g., 0-25%)
    efficiency = Math.max(0, Math.min(efficiency, 25));

    return {
        id: key,
        name: rawData.name || `Solar Panel ${index + 1}`,
        status: 'Online',
        lastSeen: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        temperature: parseAsNumber(pickValue(rawData, KEY_MAP.temperature)),
        humidity: parseAsNumber(pickValue(rawData, KEY_MAP.humidity)),
        dustDensity: parseAsNumber(pickValue(rawData, KEY_MAP.dustDensity)),
        irradiance,
        voltage,
        current,
        power: parseFloat(power.toFixed(2)),
        efficiency: parseFloat(efficiency.toFixed(2)),
        location: rawData.location,
    };
}


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
               return normalizeDeviceData(key, rawData[key], index);
            });
            setData(devices);
          } else {
            console.error('Invalid data format received from Firebase. Expected an object of objects.', rawData);
          }
        } else {
          // If no data exists, don't clear the last known good state.
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
