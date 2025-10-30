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
    // After sign-in, Firebase will redirect to the page it was initiated from.
    // In our case, this page. The logic to handle the result is on the callback page.
    // So we add a flag to sessionStorage to let the callback page know we've started.
    sessionStorage.setItem('auth-in-progress', 'true');
    signInWithRedirect(auth, provider).catch(error => {
      console.error("Redirect sign-in error", error);
      // If there's an immediate error, redirect to login
      router.push('/login');
    });
  }, [router]);

  // This page will redirect to Google. If the user comes back to it,
  // we check if they are being redirected back from Google.
  // The actual result handling is done on the callback page.
  useEffect(() => {
    const auth = getAuth(app);
    const inProgress = sessionStorage.getItem('auth-in-progress');
    if (inProgress) {
        // We are likely on the return trip from Google.
        // Let's go to the callback page to handle the result.
        router.replace('/auth/callback');
    }
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
