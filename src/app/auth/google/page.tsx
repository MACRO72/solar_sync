
'use client';
import { useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
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

  useEffect(() => {
    const signIn = async () => {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user profile already exists
        const userRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
          // Create user profile if it doesn't exist
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
      } catch (error: any) {
        console.error("Google sign-in error:", error);
        toast({
          variant: 'destructive',
          title: 'Sign in failed',
          description: error.message || 'An unexpected error occurred.',
        });
        router.push('/login');
      }
    };
    signIn();
  }, [auth, firestore, router, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to Google Sign-In...</p>
      </div>
    </div>
  );
}
