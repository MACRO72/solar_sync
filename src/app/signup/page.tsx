
'use client';

import { useFormStatus } from 'react-dom';
import { loginWithGoogle } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Chrome } from 'lucide-react';
import Link from 'next/link';

function GoogleButton() {
    const { pending } = useFormStatus();
    return (
        <form action={loginWithGoogle} className="w-full">
            <Button
                variant="outline"
                className="w-full"
                type="submit"
                disabled={pending}
            >
                <Chrome className="mr-2 h-4 w-4" />
                Sign up with Google
            </Button>
        </form>
    );
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm animate-energy-wave">
        <CardHeader>
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Join SolarSync to monitor your solar energy production.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <GoogleButton />
          </div>
           <Separator className="my-4" />
           <div className="text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline">
                Log in
              </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
