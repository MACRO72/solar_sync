
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET() {
  // Note: This only clears a potential server-side cookie.
  // The client-side state is managed by the Firebase SDK.
  cookies().delete('session');
  return redirect('/login');
}
