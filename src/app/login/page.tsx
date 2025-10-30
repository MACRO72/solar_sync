'use client';

import { useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Chrome, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth, useFirestore } from '@/firebase/provider';
import { GoogleAuthProvider, getRedirectResult, signInWithRedirect } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const processRedirect = async () => {
      if (!auth || !firestore) return;
      
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
            setIsProcessing(false);
        }
      } catch (error: any) {
        console.error("Google sign-in error:", error);
        toast({
          variant: 'destructive',
          title: 'Sign in failed',
          description: error.message || 'An unexpected error occurred during sign-in.',
        });
        setIsProcessing(false);
      }
    };

    processRedirect();
  }, [auth, firestore, router, toast]);
  
  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  if (isProcessing) {
     return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm animate-energy-wave">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to SolarSync</CardTitle>
          <CardDescription>Sign in to access your solar dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
            >
                {isSigningIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Chrome className="mr-2 h-4 w-4" />}
                {isSigningIn ? 'Redirecting...' : 'Sign in with Google'}
            </Button>
          </div>
          <Separator className="my-4" />
           <div className="text-center text-sm text-muted-foreground">
              By signing in, you agree to our Terms of Service.
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
