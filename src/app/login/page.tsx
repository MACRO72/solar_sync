
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { app } from '@/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/icons';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

function GoogleIcon() {
  return (
    <svg className="mr-2 h-5 w-5" viewBox="0 0 48 48">
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const auth = getAuth(app);

  useEffect(() => {
    const processRedirectResult = async () => {
      setIsProcessing(true);
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User successfully signed in.
          await handleUserSetup(result.user);
          router.push('/dashboard');
        } else {
          // No user signed in (e.g., page loaded directly).
          setIsProcessing(false);
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Sign-in Failed',
          description: error.message || 'Could not sign in with Google. Please try again.',
        });
        setIsProcessing(false);
      }
    };

    processRedirectResult();
  }, [auth, router, toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleUserSetup = async (user: User) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(
        userRef,
        {
          name: user.displayName || user.email,
          email: user.email,
          photoURL: user.photoURL,
        },
        { merge: true }
      );
    }
  };

  const handleGoogleSignIn = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const handleEmailAuth = async (values: z.infer<typeof formSchema>) => {
    setIsProcessing(true);
    try {
      let userCredential;
      if (mode === 'signup') {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        await handleUserSetup(userCredential.user);
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
      }
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: mode === 'signup' ? 'Sign-up Failed' : 'Sign-in Failed',
        description: error.message || 'An unexpected error occurred.',
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Signing in...</p>
          </div>
      ) : (
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Logo className="size-16 text-primary" />
          <h1 className="mt-4 text-3xl font-bold animate-logo-text">
            Welcome to SolarSync
          </h1>
          <p className="mt-2 text-muted-foreground">
            {mode === 'signin'
              ? 'Sign in to access your dashboard'
              : 'Create an account to get started'}
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleEmailAuth)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@example.com"
                        {...field}
                        disabled={isProcessing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isProcessing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isProcessing}>
                {isProcessing && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mode === 'signin' ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            className="w-full"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isProcessing}
          >
            <GoogleIcon />
            Sign in with Google
          </Button>
        </div>

        <div className="mt-6 text-center text-sm">
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <Button
                variant="link"
                className="p-0"
                onClick={() => setMode('signup')}
              >
                Sign Up
              </Button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Button
                variant="link"
                className="p-0"
                onClick={() => setMode('signin')}
              >
                Sign In
              </Button>
            </>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
