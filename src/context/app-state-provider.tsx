
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
    name: 'Solar Admin',
    email: 'admin@solarintel.com',
    avatar: '',
    phone: '+1 (123) 456-7890',
  });
  
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
