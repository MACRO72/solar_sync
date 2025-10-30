import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

const firebaseConfig = {
    credential: cert(serviceAccount),
    databaseURL: "https://studio-8872529932-4d3a4-default-rtdb.asia-southeast1.firebasedatabase.app",
};

function getAdminApp(): App {
    if (getApps().length > 0) {
        return getApp();
    } else {
        return initializeApp(firebaseConfig);
    }
}

export const adminApp = getAdminApp();
export const adminAuth = getAuth(adminApp);
export const adminFirestore = getFirestore(adminApp);
