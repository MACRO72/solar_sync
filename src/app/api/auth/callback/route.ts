'use server';

import { redirect } from 'next/navigation';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/firebase/server-init';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const auth = getAuth(adminApp);

  const idToken = request.headers.get('Authorization')?.split('Bearer ')[1] || '';

  if (!idToken) {
    console.error('No ID token found in Authorization header');
    return redirect('/login');
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    cookies().set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
    });

    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });

  } catch (error) {
    console.error('Error creating session cookie:', error);
    return redirect('/login');
  }
}
