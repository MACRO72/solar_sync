
'use client';
import { app } from './config';
import { FirebaseProvider } from './provider';

import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  return (
    <FirebaseProvider app={app} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
}
