'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { app } from '@/firebase/config';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 mr-2" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.319,44,30.023,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleUser = useCallback(async (user: User | null) => {
    if (user && firestore) {
      // Ensure user profile exists in Firestore
      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          phone: user.phoneNumber,
        }, { merge: true });
      }

      // Create server-side session
      const idToken = await user.getIdToken();
      const response = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
      
      if (response.ok) {
        router.push('/dashboard');
      } else {
         toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Could not create a server session. Please try again.',
        });
        setLoading(false);
        setIsSigningIn(false);
      }
    } else {
        setLoading(false);
        setIsSigningIn(false);
    }
  }, [firestore, router, toast]);

  // Effect to handle redirect result
  useEffect(() => {
    const auth = getAuth(app);
    setIsSigningIn(true); // Assume a sign-in process is happening
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // User is coming back from a successful redirect.
          // handleUser will be called by onAuthStateChanged.
        } else {
          // No redirect result, could be initial load or user is already logged in.
          // Let onAuthStateChanged handle it.
           setIsSigningIn(false); // No redirect result, so not actively signing in
        }
      })
      .catch((error) => {
        console.error('Error getting redirect result:', error);
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: `Error during sign-in: ${error.message}`,
        });
        setIsSigningIn(false);
      });
  }, [toast]);
  
  // Master effect to listen for any auth state change
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // A user is detected. Handle them.
        handleUser(user);
      } else {
        // No user is signed in. Stop loading.
        setLoading(false);
        setIsSigningIn(false);
      }
    });

    return () => unsubscribe();
  }, [handleUser]);

  
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  if (loading || isSigningIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Logo className="size-16 text-primary" />
          <h1 className="mt-4 text-3xl font-bold animate-logo-text">
            Welcome to SolarSync
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to access your dashboard.
          </p>
        </div>
        <div className="mt-8">
          <Button
            onClick={handleGoogleSignIn}
            className="w-full"
            variant="outline"
            disabled={isSigningIn}
          >
            <GoogleIcon />
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
