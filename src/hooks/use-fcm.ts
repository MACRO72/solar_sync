
'use client';

import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { app } from '@/firebase/config';
import { firebaseConfig } from '@/firebase/config';
import { useUser } from '@/firebase/auth/use-user';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';

export function useFCM() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !user || !firestore) return;

    let unsubscribe: (() => void) | undefined;

    const setupMessaging = async () => {
      try {
        const supported = await isSupported();
        if (!supported) {
          console.warn('Firebase FCM is not supported in this environment.');
          return;
        }

        const messaging = getMessaging(app);
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          const token = await getToken(messaging, { vapidKey: firebaseConfig.vapidKey });
          if (token) {
            setFcmToken(token);
            const userRef = doc(firestore, 'users', user.uid);
            await setDoc(userRef, { fcmToken: token }, { merge: true });
          }
        }

        unsubscribe = onMessage(messaging, (payload) => {
          toast({
            title: payload.notification?.title || 'System Alert',
            description: payload.notification?.body || 'A new system event was detected.',
          });
        });
      } catch (error) {
        console.error('FCM Setup safely bypassed runtime error:', error);
      }
    };

    setupMessaging();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, firestore, toast]);

  return { fcmToken };
}
