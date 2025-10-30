
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { doc, onSnapshot } from 'firebase/firestore';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  phone: string;
}

interface AppState extends UserProfile {
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setAvatar: (avatar: string) => void;
  setPhone: (phone: string) => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    avatar: '',
    phone: '',
  });

  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setProfile({
            name: data.name || user.displayName || '',
            email: data.email || user.email || '',
            avatar: data.photoURL || user.photoURL || '',
            phone: data.phone || '',
          });
        }
      });

      return () => unsubscribe();
    } else if (!user) {
        setProfile({ name: '', email: '', avatar: '', phone: ''});
    }
  }, [user, firestore]);
  
  const setName = (name: string) => setProfile(p => ({...p, name}));
  const setEmail = (email: string) => setProfile(p => ({...p, email}));
  const setAvatar = (avatar: string) => setProfile(p => ({...p, avatar}));
  const setPhone = (phone: string) => setProfile(p => ({...p, phone}));


  const value = {
    ...profile,
    setName,
    setEmail,
    setAvatar,
    setPhone,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
