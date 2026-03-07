
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";

export const firebaseConfig = {
    apiKey: "AIzaSyBfN7SSZaUfb4tNiBwWhKgZaOruq7umjhw",
    authDomain: "studio-8872529932-4d3a4.firebaseapp.com",
    databaseURL: "https://studio-8872529932-4d3a4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "studio-8872529932-4d3a4",
    storageBucket: "studio-8872529932-4d3a4.appspot.com",
    messagingSenderId: "127215110217",
    appId: "1:127215110217:web:383d55b0fccd5382c95798",
    vapidKey: "BJo-UsjD-e8kldzKoHy7m8VuxalxCounqc6Y2I-EcuuejwTRDQiJO_Nrow_GUal_BOSDSALxclGrdAN5MeG0Jnc"
  };

// Initialize Firebase
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
