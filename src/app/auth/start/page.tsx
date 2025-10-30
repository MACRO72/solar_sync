'use client';

import { useEffect } from 'react';
import { getAuth, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { app } from '@/firebase/config';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthStartPage() {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    
    // We don't need a session flag. signInWithRedirect handles the return trip.
    signInWithRedirect(auth, provider).catch(error => {
      console.error("Redirect sign-in error", error);
      // If there's an immediate error, redirect to login
      router.push('/login');
    });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to Google Sign-In...</p>
      </div>
    </div>
  );
}
