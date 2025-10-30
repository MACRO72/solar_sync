'use server';

import { redirect } from 'next/navigation';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/firebase/server-init';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const auth = getAuth(adminApp);

  const { idToken } = await request.json();

  if (!idToken) {
    console.error('No ID token found in request body');
    return new Response(JSON.stringify({ status: 'error', message: 'No ID token provided.' }), { status: 400 });
  }

  try {
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    cookies().set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });

  } catch (error) {
    console.error('Error creating session cookie:', error);
     return new Response(JSON.stringify({ status: 'error', message: 'Could not create session cookie.' }), { status: 500 });
  }
}
