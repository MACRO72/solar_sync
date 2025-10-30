
'use client';
import { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function GoogleSignInPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        
        if (result && result.user) {
          const user = result.user;
          const userRef = doc(firestore, 'users', user.uid);
          const docSnap = await getDoc(userRef);

          if (!docSnap.exists()) {
            const userData = {
              name: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              createdAt: serverTimestamp(),
            };
            await setDoc(userRef, userData, { merge: true });
          }
          
          toast({
            title: 'Sign in successful',
            description: `Welcome back, ${user.displayName}!`,
          });

          router.push('/dashboard');
        } else {
          // If there's no result, it means we need to initiate the redirect.
           const provider = new GoogleAuthProvider();
           await signInWithRedirect(auth, provider);
        }
      } catch (error: any) {
        console.error("Google sign-in error:", error);
        toast({
          variant: 'destructive',
          title: 'Sign in failed',
          description: error.message || 'An unexpected error occurred.',
        });
        setIsProcessing(false);
        router.push('/login');
      }
    };

    processRedirect();
  }, [auth, firestore, router, toast]);

  if (!isProcessing) {
    // This will only be shown if an error occurs before redirect.
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
                <p className="text-destructive">Sign-in failed.</p>
                <p className="text-muted-foreground">Redirecting back to login...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to Google Sign-In...</p>
      </div>
    </div>
  );
}
