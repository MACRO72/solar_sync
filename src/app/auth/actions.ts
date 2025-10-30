
'use server';

import { redirect } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/firebase/server-init';
import { revalidatePath } from 'next/cache';
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
  // This function is tricky to implement on the server side with the client SDK.
  // We will redirect to a client page that handles the sign-in.
  redirect('/auth/google');
}

export async function signOut() {
  // This will be called from a client component
}
