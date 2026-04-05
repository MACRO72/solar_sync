'use server';

import { z } from 'zod';
import { getAdminDb, getAdminAuth as getAdminAuthLib, getAdminFirestore } from '@/lib/firebase-admin';
import { randomInt, createHash } from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import { sendBrevoEmail } from '@/lib/brevo';

const adminDb = getAdminDb();
const adminAuth = getAdminAuthLib();

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set.');
  return new TextEncoder().encode(secret);
};

async function lookupUserByEmail(emailInput: string) {
  const email = emailInput.toLowerCase().trim();
  
  // PERFORMANT: Optimized lookup using indexed queries instead of scanning all users
  const snapshot = await adminDb.ref('users').orderByChild('email').equalTo(email).limitToFirst(1).once('value');
  const users = snapshot.val() || {};

  let foundUser = null;
  let userId = null;

  for (let id in users) {
    foundUser = users[id];
    userId = id;
    break;
  }

  // Fallback to Firestore (also optimized)
  if (!foundUser) {
    try {
      const db = getAdminFirestore();
      const querySnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        foundUser = doc.data();
        userId = doc.id;
        
        // Auto-migrate to RTDB as Single Source of Truth
        await adminDb.ref(`users/${userId}`).update({ email: email });
      }
    } catch (e) {
      console.warn("Firestore fallback error:", e);
    }
  }

  return { user: foundUser, userId };
}

export async function checkUserRegistered(email: string) {
  try {
    const { user } = await lookupUserByEmail(email);
    return { exists: !!user, phone: user?.phone || null };
  } catch (error: any) {
    console.error('❌ User Registration Check Failed:', error);
    throw new Error(`Registration verification error`);
  }
}

export async function generateAndSendOTP(emailInput: string) {
  const email = emailInput.toLowerCase().trim();
  try {
    const { user, userId } = await lookupUserByEmail(email);
    if (!user || !userId) {
      console.warn(`OTP requested for non-existent email: ${email}`);
      return { status: 'success' };
    }
    const resetRef = adminDb.ref(`passwordResets/${userId}`);
    const currentData = await resetRef.once('value');
    
    if (currentData.exists()) {
      const { lastRequestTime } = currentData.val();
      if (Date.now() - lastRequestTime < 60000) {
        throw new Error('Please wait 60 seconds before requesting another code.');
      }
    }

    const otpCode = randomInt(100000, 999999).toString();
    const otpHash = createHash('sha256').update(otpCode).digest('hex');
    const expiresAt = Date.now() + 5 * 60 * 1000;

    await resetRef.set({
      otpHash,
      expiresAt,
      attempts: 0,
      lastRequestTime: Date.now()
    });

    await sendBrevoEmail({
      subject: 'SolarSync Verification Code',
      textContent: `Your verification code is: ${otpCode}\n\nThis code expires in 5 minutes.`,
      recipientEmail: email,
    });

    return { status: 'success' };
  } catch (error: any) {
    console.error('❌ OTP Delivery Error:', error);
    // Temporarily throwing the real error to the frontend so you can see if Brevo is failing!
    throw new Error(error.message);
  }
}

export async function verifyOTPCode(emailInput: string, code: string) {
  const email = emailInput.toLowerCase().trim();
  try {
    const { user, userId } = await lookupUserByEmail(email);
    if (!user || !userId) {
      return { verified: false, message: 'Invalid code.' };
    }
    const resetRef = adminDb.ref(`passwordResets/${userId}`);
    const snapshot = await resetRef.once('value');

    if (!snapshot.exists()) {
      return { verified: false, message: 'OTP not found or expired.' };
    }

    const data = snapshot.val();
    
    if (Date.now() > data.expiresAt) {
      await resetRef.remove();
      return { verified: false, message: 'OTP expired.' };
    }

    if (data.attempts >= 3) {
      await resetRef.remove();
      return { verified: false, message: 'Too many failed attempts. Please request a new code.' };
    }

    const inputHash = createHash('sha256').update(code).digest('hex');
    if (data.otpHash !== inputHash) {
      await resetRef.update({ attempts: data.attempts + 1 });
      return { verified: false, message: 'Invalid code.' };
    }

    await resetRef.remove();

    const token = await new SignJWT({ userId, email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('10m')
      .sign(getJwtSecret());

    return { verified: true, token };
  } catch (error: any) {
    console.error('❌ OTP Verification Error:', error);
    return { verified: false, message: 'Verification failed.' };
  }
}

export async function updateUserPassword(emailInput: string, newPassword: string, token?: string) {
  const email = emailInput.toLowerCase().trim();
  if (!token) throw new Error('Unauthorized: Missing reset token');

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.email !== email) throw new Error('Unauthorized: Token mismatch');

    const userId = payload.userId as string;
    
    await adminDb.ref(`users/${userId}`).update({ password: newPassword });
    
    try {
      await adminAuth.updateUser(userId, { password: newPassword });
    } catch (e) {
      // Ignore if user isn't in Auth backend, ensuring RTDB is the unified source of truth
    }

    return { status: 'success' };
  } catch (error: any) {
    console.error('❌ Password Reset Failed:', error);
    throw new Error('Password reset failed. Token may be expired or invalid.');
  }
}
