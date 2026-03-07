'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type User,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { app } from '@/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/icons';
import { Loader2, Eye, EyeOff } from 'lucide-react';
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
  phone: z.string().optional().or(z.literal('')),
});


export default function LoginPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const auth = getAuth(app);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      phone: '',
    },
  });

  const handleUserSetup = async (user: User, phone: string) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', user.uid);
    
    await setDoc(
      userRef,
      {
        name: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email,
        photoURL: user.photoURL,
        phone: phone || '',
      },
      { merge: true }
    );
  };

  const handleEmailAuth = async (values: z.infer<typeof formSchema>) => {
    // Phone is only strictly required during signup for new users
    if (mode === 'signup' && (!values.phone || values.phone.length < 10)) {
        form.setError('phone', { message: 'Phone number must be at least 10 digits for sign up.' });
        return;
    }

    setIsProcessing(true);
    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        await handleUserSetup(userCredential.user, values.phone || '');
      } else {
        await signInWithEmailAndPassword(
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
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...field}
                          disabled={isProcessing}
                          className="pr-10"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute inset-y-0 right-0 h-full px-3"
                        onClick={() => setShowPassword((prev) => !prev)}
                        disabled={isProcessing}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        <span className="sr-only">
                          {showPassword ? 'Hide password' : 'Show password'}
                        </span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {mode === 'signup' && (
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+91 98765 43210"
                          {...field}
                          disabled={isProcessing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <Button type="submit" className="w-full" disabled={isProcessing}>
                {isProcessing && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mode === 'signin' ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>
          </Form>
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
    </div>
  );
}
