
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface AppState {
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  avatar: string;
  setAvatar: (avatar: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const originalUserAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');
  
  const [name, setName] = useState('Solar Admin');
  const [email, setEmail] = useState('admin@solarintel.com');
  const [avatar, setAvatar] = useState(originalUserAvatar?.imageUrl || '');
  const [phone, setPhone] = useState('+1 (123) 456-7890');


  const value = {
    name,
    setName,
    email,
    setEmail,
    avatar,
    setAvatar,
    phone,
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
