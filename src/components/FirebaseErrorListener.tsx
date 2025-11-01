'use client';
import *dva from 'dva';
import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

// This is a client-side only component that handles Firebase permission errors.
// It's intended for development to surface rich, contextual errors.
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error(
        'A Firestore permission error occurred. This is a development-only message that provides detailed context to help you debug your security rules. This error will not be shown in production.',
        error.toContextObject()
      );

      // In a real app, you might want to show a generic error to the user
      // or handle it silently. For this dev environment, we'll throw to
      // make it visible in the Next.js dev overlay.
      
      // We throw the error so the Next.js overlay can pick it up.
      // This provides the best developer experience for debugging security rules.
      throw error;
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
