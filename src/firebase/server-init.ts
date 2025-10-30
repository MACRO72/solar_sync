
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBfN7SSZaUfb4tNiBwWhKgZaOruq7umjhw",
    authDomain: "studio-8872529932-4d3a4.firebaseapp.com",
    databaseURL: "https://studio-8872529932-4d3a4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "studio-8872529932-4d3a4",
    storageBucket: "studio-8872529932-4d3a4.appspot.com",
    messagingSenderId: "127215110217",
    appId: "1:127215110217:web:383d55b0fccd5382c95798"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, auth, firestore };
