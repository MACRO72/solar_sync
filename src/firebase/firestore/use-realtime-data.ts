'use client';

import { useState, useEffect } from 'react';
import { getDatabase, ref, query, limitToLast, onValue } from 'firebase/database';
import type { Device } from '@/lib/types';
import { app } from '@/firebase/config';
import { useUser } from '@/firebase/auth/use-user';
import { getUserDevices } from '@/lib/device-service';

const PANEL_AREA_M2 = 0.05;

/**
 * useRealtimeData hook
 * Listens to the 'devices/{deviceId}/history' path in Firebase Realtime Database
 * for the user's first paired device.
 */
export function useRealtimeData() {
  const { user, loading: userLoading } = useUser();
  const [data, setData] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: () => void = () => {};

    if (userLoading) return;

    if (!user) {
        setData([]);
        setLoading(false);
        return;
    }

    const setupListener = async () => {
        try {
            const devices = await getUserDevices(user.uid);
            
            if (!isMounted) return;

            if (devices.length === 0) {
                setData([]);
                setLoading(false);
                return;
            }

            const targetDeviceId = devices[0].deviceId;
            const db = getDatabase(app);
            const dataRef = ref(db, `devices/${targetDeviceId}/history`);
            
            // Query the last 100 readings
            const recentDataQuery = query(dataRef, limitToLast(100));

            unsubscribe = onValue(recentDataQuery, (snapshot) => {
              if (!isMounted) return;
              
              try {
                if (snapshot.exists()) {
                  const rawReadings: any[] = [];
                  snapshot.forEach((childSnapshot) => {
                      rawReadings.push({ key: childSnapshot.key, val: childSnapshot.val() });
                  });

                  // Calculate time offset based on the last reading
                  let offsetMs = 0;
                  const nowMs = Date.now();
                  if (rawReadings.length > 0) {
                      const lastRaw = rawReadings[rawReadings.length - 1].val;
                      const dateStr = lastRaw.Date || '';
                      const timeStr = lastRaw.Time || '';
                      if (dateStr && timeStr) {
                          const parts = dateStr.split('/');
                          if (parts.length === 3) {
                              const paddedTime = timeStr.split(':').map((p: string) => p.padStart(2, '0')).join(':');
                              const isoStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}T${paddedTime}`;
                              const parsedDate = new Date(isoStr);
                              if (!isNaN(parsedDate.getTime())) {
                                  offsetMs = nowMs - parsedDate.getTime();
                              }
                          }
                      }
                  }

                  const readings: Device[] = rawReadings.map((item) => {
                    const rawData = item.val;
                    if (!rawData) return null;

                    // Parse Date and apply offset
                    const dateStr = rawData.Date || ''; 
                    const timeStr = rawData.Time || ''; 
                    let finalTimeMs = nowMs;
                    
                    if (dateStr && timeStr) {
                        const parts = dateStr.split('/');
                        if (parts.length === 3) {
                            const paddedTime = timeStr.split(':').map((p: string) => p.padStart(2, '0')).join(':');
                            const isoStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}T${paddedTime}`;
                            const parsedDate = new Date(isoStr);
                            if (!isNaN(parsedDate.getTime())) {
                                finalTimeMs = parsedDate.getTime() + offsetMs;
                            }
                        }
                    }

                    const timestamp = new Date(finalTimeMs).toISOString();

                    const voltage = parseFloat(rawData.Voltage || '0');
                    // Current is provided in Amperes in the new format (e.g. "0.20")
                    const currentA = Math.abs(parseFloat(rawData.Current || '0')); 
                    const currentMA = currentA * 1000;
                    
                    const power = voltage * currentA;
                    const temperature = parseFloat(rawData.Temperature || '0');
                    const humidity = parseFloat(rawData.Humidity || '0');
                    const irradiance = parseFloat(rawData.LightIntensity || '0');
                    
                    // Average DustBlack and DustWhite for dust density
                    const dustBlack = parseFloat(rawData.DustBlack || '0');
                    const dustWhite = parseFloat(rawData.DustWhite || '0');
                    const dustDensity = (dustBlack + dustWhite) / 2;

                    let efficiency = 0;
                    if (irradiance > 0 && PANEL_AREA_M2 > 0) {
                        // Assuming LightIntensity is given in W/m² directly.
                        const inputPower = irradiance * PANEL_AREA_M2; 
                        if (inputPower > 0) {
                             efficiency = (power / inputPower) * 100;
                        }
                    }

                    return {
                      id: item.key as string,
                      name: targetDeviceId,
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
                    } as any;
                  }).filter(Boolean);

                  setData(readings.reverse());
                } else {
                  setData([]);
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
            console.error("🚨 Failed to setup Firebase listener:", outerError.message);
            if (isMounted) setLoading(false);
        }
    };

    setupListener();

    return () => {
        isMounted = false;
        unsubscribe();
    };
  }, [user, userLoading]);

  return { data, loading };
}
