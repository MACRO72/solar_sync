'use server';

import { z } from 'zod';
import { sendEmailInternal } from '@/ai/tools/send-notification';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';
import { randomInt } from 'crypto';

// Initialize a dedicated Firebase app for server actions using the client config
const app = getApps().find(a => a.name === 'server-actions')
  || initializeApp(firebaseConfig, 'server-actions');

const db = getFirestore(app);
const auth = getAuth(app);

export async function checkUserRegistered(email: string) {
  try {
    // FALLBACK: Use Firebase Auth REST API to check if email exists.
    // This avoids Firestore security rules in the "registration check" phase.
    const apiKey = firebaseConfig.apiKey;
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: email,
          continueUri: 'http://localhost', // Required but doesn't affect the check
        }),
      }
    );

    if (!response.ok) {
       const err = await response.json();
       throw new Error(err.error?.message || 'Auth API failed');
    }

    const data = await response.json();
    console.log('🔍 Auth API Response for', email, ':', JSON.stringify(data, null, 2));

    // data.registered is the standard flag for existing accounts
    const isRegistered = data.registered === true;

    return { 
      exists: isRegistered, 
      phone: null,
    };
  } catch (error: any) {
    console.error('❌ User Registration Check Failed (REST API):', error);
    throw new Error(`Registration verification error: ${error.message}`);
  }
}

/**
 * Generates and sends a 6-digit OTP to the user.
 */
export async function generateAndSendOTP(email: string) {
  const otpCode = randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  try {
    // Store OTP in Firestore
    const otpRef = doc(db, 'otps', email);
    await setDoc(otpRef, {
      code: otpCode,
      expiresAt: expiresAt,
    });

    // Send via Email
    const emailRes = await sendEmailInternal({
      subject: 'Your SolarSync Access Key OTP',
      message: `Your one-time passkey is: ${otpCode}. This code will expire in 5 minutes.`,
      recipientEmail: email,
    });

    if (emailRes.status !== 'success') {
      throw new Error(`Email delivery failed: ${emailRes.details}`);
    }

    return { status: 'success' };
  } catch (error: any) {
    console.error('❌ OTP Delivery Failed:', error);
    throw new Error(`Failed to send OTP: ${error.message || 'Check server configuration'}`);
  }
}

/**
 * Verifies the provided OTP code.
 */
export async function verifyOTPCode(email: string, code: string) {
  try {
    const otpRef = doc(db, 'otps', email);
    const otpDoc = await getDoc(otpRef);
    
    if (!otpDoc.exists()) return { verified: false, message: 'OTP not found or expired.' };

    const data = otpDoc.data();
    if (data?.code !== code) return { verified: false, message: 'Invalid code.' };
    if (Date.now() > data.expiresAt) return { verified: false, message: 'OTP expired.' };

    return { verified: true };
  } catch (error: any) {
    console.error('❌ OTP Verification System Error:', error);
    throw new Error(`Verification system error: ${error.message || 'Check server logs'}`);
  }
}

/**
 * Initiates a standard Firebase password reset email.
 * Note: Admin password update requires valid server-side credentials (service account).
 */
export async function initiatePasswordReset(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    
    // Clean up OTP if it exists
    const otpRef = doc(db, 'otps', email);
    await deleteDoc(otpRef);

    return { status: 'success' };
  } catch (error: any) {
    console.error('❌ Password Reset Initiation Failed:', error);
    throw new Error(`Fallback reset failed: ${error.message}`);
  }
}

/**
 * Updates the user's password. 
 * WARNING: This will likely fail on local dev without a service account if using Admin SDK.
 * We'll keep it as a placeholder or use a secure alternative.
 */
export async function updateUserPassword(email: string, newPassword: string) {
  // If we had firebase-admin correctly configured with a service account:
  /*
  const user = await adminAuth.getUserByEmail(email);
  await adminAuth.updateUser(user.uid, { password: newPassword });
  */
  
  // Since we are using client SDK on server, we can't directly update passwords 
  // without the user being signed in. We will use the standard reset email as a safe bridge.
  return initiatePasswordReset(email);
}
