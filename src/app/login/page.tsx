'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, type User } from 'firebase/auth';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  email: z.string().email({ message: 'Valid email required.' }),
  password: z.string().min(6, { message: 'Min 6 chars.' }),
  phone: z.string().optional(),
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
    defaultValues: { email: '', password: '', phone: '' },
  });

  const handleUserSetup = async (user: User, phone?: string) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', user.uid);
    await setDoc(userRef, {
      name: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email,
      phone: phone || '',
    }, { merge: true });
  };

  const handleAuth = async (values: z.infer<typeof formSchema>) => {
    setIsProcessing(true);
    try {
      if (mode === 'signup') {
        if (!values.phone || values.phone.length < 10) {
            toast({ variant: 'destructive', title: 'Phone Required', description: 'Please enter a valid phone number for alerts.' });
            setIsProcessing(false);
            return;
        }
        const cred = await createUserWithEmailAndPassword(auth, values.email, values.password);
        await handleUserSetup(cred.user, values.phone);
      } else {
        await signInWithEmailAndPassword(auth, values.email, values.password);
      }
      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Logo className="size-16 text-primary" />
          <h1 className="mt-4 text-3xl font-bold animate-logo-text">SolarSync</h1>
          <p className="mt-2 text-muted-foreground">{mode === 'signin' ? 'Sign in' : 'Create an account'}</p>
        </div>
        <div className="mt-8 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAuth)} className="space-y-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input placeholder="name@example.com" {...field} disabled={isProcessing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              {mode === 'signup' && (
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (for SMS alerts)</FormLabel>
                    <FormControl><Input placeholder="+91 98765 43210" {...field} disabled={isProcessing} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <FormControl><Input type={showPassword ? 'text' : 'password'} {...field} disabled={isProcessing} /></FormControl>
                    <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'signin' ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>
          </Form>
          <div className="text-center text-sm">
            {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <Button variant="link" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>{mode === 'signin' ? 'Sign Up' : 'Sign In'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
