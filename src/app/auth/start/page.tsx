'use client';

import { useEffect } from 'react';
import { getAuth, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { app } from '@/firebase/config';
import { Loader2 } from 'lucide-react';

export default function AuthStartPage() {
  useEffect(() => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to Google Sign-In...</p>
      </div>
    </div>
  );
}

    