import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getDatabase, Database } from 'firebase-admin/database';

let adminApp: App | undefined;

function getAdminApp(): App {
  if (adminApp) return adminApp;

  if (getApps().length) {
    adminApp = getApps()[0];
    return adminApp;
  }

  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountRaw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not defined in environment variables.");
  }

  try {
    let parsedData = JSON.parse(serviceAccountRaw);
    
    // If the result is a string, it means the .env value was a stringified JSON inside a string.
    // This happens frequently with certain environment variable loaders or if the value is double-quoted.
    if (typeof parsedData === 'string') {
      parsedData = JSON.parse(parsedData);
    }
    
    const serviceAccount = parsedData;
    
    // Ensure newlines are proper in the private key if it's still escaped
    if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    adminApp = initializeApp({
      credential: cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
    });
    console.log("✅ Firebase Admin Initialized Successfully");
    return adminApp;
  } catch (error: any) {
    console.error("❌ Firebase Admin Initialization Parse Failure:", error.message);
    throw new Error(`Bad service account structure: ${error.message}`);
  }
}

export const getAdminDb = (): Database => getDatabase(getAdminApp());
export const getAdminAuth = (): Auth => getAuth(getAdminApp());
export const getAdminFirestore = (): Firestore => getFirestore(getAdminApp());

