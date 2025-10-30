'use server';

import {auth} from '@/firebase/server-init';
import {GoogleAuthProvider, signInWithRedirect} from 'firebase/auth';
import {redirect} from 'next/navigation';
import {headers} from 'next/headers';

export async function GET() {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error('Error starting Google sign-in:', error);
    const headersList = headers();
    const origin = headersList.get('origin');
    if (origin) {
      redirect(`${origin}/login?error=true`);
    } else {
      redirect('/login?error=true');
    }
  }
}
