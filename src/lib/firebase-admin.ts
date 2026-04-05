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
    // Sanitize: strip surrounding quotes added by some .env loaders
    let raw = serviceAccountRaw.trim();
    if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
      raw = raw.slice(1, -1);
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(raw);
    } catch {
      // Last resort: the value was already parsed once (double-stringified)
      parsedData = JSON.parse(JSON.stringify(raw));
    }

    // If the result is still a string, parse again (double-stringified case)
    if (typeof parsedData === 'string') {
      parsedData = JSON.parse(parsedData);
    }

    const serviceAccount = parsedData;

    // Final safety: convert any remaining \n literal sequences in private_key
    if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key
        .replace(/\\n/g, '\n') // escaped sequence
        .replace(/\r/g, '');   // strip stray carriage returns
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

