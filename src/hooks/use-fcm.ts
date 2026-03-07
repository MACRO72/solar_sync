
'use client';

import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
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

    const messaging = getMessaging(app);

    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: firebaseConfig.vapidKey,
          });
          if (token) {
            setFcmToken(token);
            // Store token in Firestore for the user
            const userRef = doc(firestore, 'users', user.uid);
            setDoc(userRef, { fcmToken: token }, { merge: true });
          }
        }
      } catch (error) {
        console.error('An error occurred while retrieving token:', error);
      }
    };

    requestPermission();

    // Handle foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      toast({
        title: payload.notification?.title || 'System Alert',
        description: payload.notification?.body || 'A new system event was detected.',
      });
    });

    return () => unsubscribe();
  }, [user, firestore, toast]);

  return { fcmToken };
}
