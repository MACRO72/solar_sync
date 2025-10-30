'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, getRedirectResult, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { app } from '@/firebase/config';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallbackPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processAuth = async () => {
        const auth = getAuth(app);
        
        try {
            const result = await getRedirectResult(auth);
            sessionStorage.removeItem('auth-in-progress');

            if (result && result.user && firestore) {
                const user = result.user;
                const userRef = doc(firestore, 'users', user.uid);
                const userDoc = await getDoc(userRef);

                if (!userDoc.exists()) {
                    await setDoc(userRef, {
                        name: user.displayName,
                        email: user.email,
                        photoURL: user.photoURL,
                    }, { merge: true });
                }

                const idToken = await user.getIdToken();
                const response = await fetch('/api/auth/callback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken }),
                });

                if (response.ok) {
                    router.push('/dashboard');
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Could not create a server session.');
                }
            } else if (!result) {
                // This can happen if the page is reloaded or visited directly.
                // If there's no user session, go to login.
                if (!auth.currentUser) {
                    router.push('/login');
                } else {
                    router.push('/dashboard');
                }
            }
        } catch (e: any) {
            console.error('Authentication callback error:', e);
            toast({
                variant: 'destructive',
                title: 'Authentication Failed',
                description: e.message || 'An unknown error occurred during sign-in.',
            });
            setError('Authentication failed. Please try again.');
            setTimeout(() => router.push('/login'), 3000);
        }
    };
    
    processAuth();
  }, [firestore, router, toast]);

  if (error) {
      return (
          <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <p className="text-destructive text-lg">{error}</p>
            <p className="text-muted-foreground">Redirecting to login...</p>
          </div>
      )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Finalizing authentication...</p>
      </div>
    </div>
  );
}
