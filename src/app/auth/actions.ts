
'use server';

import { redirect } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/firebase/server-init';

async function createUserProfile(user: any) {
  const userRef = doc(firestore, 'users', user.uid);
  const userData = {
    name: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(userRef, userData, { merge: true });
  } catch (error) {
    console.error("Error creating user profile:", error);
  }
}

export async function loginWithGoogle() {
  redirect('/auth/google');
}
