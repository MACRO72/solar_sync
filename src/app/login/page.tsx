'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Chrome, Loader2 } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase/provider';
import { getRedirectResult } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [isProcessing, setIsProcessing] = useState(true);

  // This effect handles the result of the redirect from Google
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
        // Don't show a toast on page load if there's no user, it's confusing.
        // Only show if there's an actual error from the redirect.
        if (error.code && error.code !== 'auth/no-user-found') {
            toast({
              variant: 'destructive',
              title: 'Sign in failed',
              description: error.message || 'An unexpected error occurred during sign-in.',
            });
        }
        setIsProcessing(false);
      }
    };

    processRedirect();
  }, [auth, firestore, router, toast]);

  if (isProcessing) {
     return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="text-muted-foreground">Finalizing authentication...</p>
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
             {/* This is now a link styled as a button to force a top-level navigation */}
             <a
                href="/auth/redirect"
                target="_top"
                className={cn(
                    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                    "h-10 px-4 py-2 w-full"
                )}
            >
                <Chrome className="mr-2 h-4 w-4" />
                Sign in with Google
            </a>
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
