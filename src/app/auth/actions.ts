'use server';

import { redirect } from 'next/navigation';

export async function login(prevState: any, formData: FormData) {
  // This is a placeholder. In a real app, you'd validate credentials.
  console.log('Logging in with:', formData.get('email'));
  redirect('/dashboard');
}

export async function signup(prevState: any, formData: FormData) {
  // This is a placeholder. In a real app, you'd create a new user.
  console.log('Signing up with:', formData.get('email'));
  redirect('/dashboard');
}

export async function loginWithGoogle() {
  // This is a placeholder.
  console.log('Logging in with Google');
  redirect('/dashboard');
}
