'use server';

import { GoogleAuthProvider, getAuth, signInWithRedirect } from 'firebase/auth';
import { redirect } from 'next/navigation';
import { auth } from '@/firebase/server-init';

export async function GET(request: Request) {
    const provider = new GoogleAuthProvider();
    const authInstance = getAuth();
    // This server-side logic will initiate the redirect to Google's sign-in page.
    // As we are not in a browser context, we can't directly use signInWithRedirect.
    // The correct approach is to generate the sign-in URL and redirect.
    // However, the client-side SDK's signInWithRedirect handles this for us
    // if we trigger it from the client.
    
    // The core issue is breaking out of the iframe. Let's simplify the client to do this.
    // The server route is not necessary with the correct client-side implementation.
    // I will remove this file and correct the client page.
    // For now, redirecting to login to avoid a broken route.
    redirect('/login');
}
