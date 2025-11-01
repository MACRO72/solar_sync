'use client';
import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useFirebase } from '@/firebase/provider';
import type { Device } from '@/lib/types';
import { app } from '@/firebase/config';

export function useRealtimeData() {
  const [data, setData] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  
  // We don't need the full context, just the app instance to get the DB
  // This avoids dependency on the Firestore-specific provider context.
  
  useEffect(() => {
    setLoading(true);
    const db = getDatabase(app);
    const dataRef = ref(db, 'data');

    const unsubscribe = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        const rawData = snapshot.val();
        // Transform the object of objects into an array of devices
        const devicesArray: Device[] = Object.keys(rawData).map(key => {
          return {
            id: key,
            ...rawData[key]
          }
        });
        setData(devicesArray);
      } else {
        // Handle the case where there's no data at the '/data' path
        setData([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase Realtime Database read failed: ", error);
      // In a real app, you would want to emit this to a proper error handler
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { data, loading };
}
