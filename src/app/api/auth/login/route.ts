'use server';

import { redirect } from 'next/navigation';

export async function GET(request: Request) {
    // This route is no longer needed with the client-side redirect flow.
    // It is kept to prevent 404 errors if old clients still try to access it.
    redirect('/login');
}
