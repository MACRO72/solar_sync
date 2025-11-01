'use client';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { Device } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { SecurityRuleContext } from '@/firebase/errors';

export function useRealtimeData() {
  const [data, setData] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) {
        // Firestore might not be initialized yet
        return;
    };

    setLoading(true);
    
    const deviceDataCollection = collection(firestore, 'device-data');
    const q = query(deviceDataCollection);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const devices: Device[] = [];
      querySnapshot.forEach((doc) => {
        devices.push({ id: doc.id, ...doc.data() } as Device);
      });
      setData(devices);
      setLoading(false);
    }, (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: deviceDataCollection.path,
        operation: 'list',
      } satisfies SecurityRuleContext);

      errorEmitter.emit('permission-error', permissionError);

      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [firestore]);

  return { data, loading };
}
