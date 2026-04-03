import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';
import { z } from 'zod';

const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().max(20, 'Phone must be at most 20 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const adminAuth = getAdminAuth();
    const adminFirestore = getAdminFirestore();

    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (authError) {
       console.error("Auth Error:", authError);
       return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const body = await request.json();
    
    // Validate input
    const validation = UpdateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    const { name, email, phone, avatar } = validation.data;
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.photoURL = avatar;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No changes provided' });
    }

    // Update Firestore user document
    const userRef = adminFirestore.collection('users').doc(uid);
    await userRef.set(updateData, { merge: true });

    // Optionally update Firebase Auth profile (display name)
    if (name) {
      try {
        await adminAuth.updateUser(uid, {
          displayName: name
        });
      } catch (authUpdateError) {
        console.warn("Auth update failed (ignoring):", authUpdateError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully',
      updatedFields: updateData
    });

  } catch (error: any) {
    console.error('Profile Update API Error:', error);
    // Generic error for production security, more detail in dev logs
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
}
