import { getDatabase, ref, get, set, remove, update } from 'firebase/database';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { app } from '@/firebase/config';
import { getFirestore } from 'firebase/firestore';

const generatePairingCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

export const registerDevice = async (deviceId: string) => {
    const db = getDatabase(app);
    const deviceRef = ref(db, `devices/${deviceId}`);
    const snapshot = await get(deviceRef);
    
    if (snapshot.exists()) {
        throw new Error('Device is already registered.');
    }

    const code = generatePairingCode();
    await set(deviceRef, {
        pairingCode: code,
        owner: '',
        status: 'unclaimed',
        registeredAt: Date.now()
    });
    return code;
};

export const pairDevice = async (uid: string, deviceId: string, pairingCode: string) => {
    const db = getDatabase(app);
    const deviceRef = ref(db, `devices/${deviceId}`);
    const snapshot = await get(deviceRef);

    if (!snapshot.exists()) {
        throw new Error('Device not found.');
    }

    const deviceData = snapshot.val();
    if (deviceData.pairingCode !== pairingCode) {
        throw new Error('Invalid pairing code.');
    }

    if (deviceData.status === 'claimed' || deviceData.owner) {
        if (deviceData.owner === uid) {
            throw new Error('You have already claimed this device.');
        }
        throw new Error('Device is already claimed by another user.');
    }

    // Claim in RTDB
    await update(deviceRef, {
        owner: uid,
        status: 'claimed'
    });

    // Add to Firestore
    const firestore = getFirestore(app);
    const userDevicesRef = doc(firestore, `users/${uid}/devices/${deviceId}`);
    await setDoc(userDevicesRef, {
        claimedAt: Date.now()
    });
};

export const unpairDevice = async (uid: string, deviceId: string) => {
    const db = getDatabase(app);
    const deviceRef = ref(db, `devices/${deviceId}`);
    const snapshot = await get(deviceRef);

    if (snapshot.exists()) {
        const deviceData = snapshot.val();
        if (deviceData.owner === uid) {
            // Reset RTDB
            await update(deviceRef, {
                owner: '',
                status: 'unclaimed'
            });
        }
    }

    // Remove from Firestore
    const firestore = getFirestore(app);
    const userDevicesRef = doc(firestore, `users/${uid}/devices/${deviceId}`);
    await deleteDoc(userDevicesRef).catch(() => {});
};

export const getUserDevices = async (uid: string) => {
    const firestore = getFirestore(app);
    const devicesRef = collection(firestore, `users/${uid}/devices`);
    const snapshot = await getDocs(devicesRef);
    return snapshot.docs.map(doc => ({
        deviceId: doc.id,
        ...doc.data()
    })) as import('./types').PairedDevice[];
};

export const getAllDevices = async () => {
    const db = getDatabase(app);
    const devicesRef = ref(db, 'devices');
    const snapshot = await get(devicesRef);
    
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.keys(data).map(key => ({
        deviceId: key,
        ...data[key]
    }));
};

export const deleteDevice = async (deviceId: string) => {
    const db = getDatabase(app);
    const deviceRef = ref(db, `devices/${deviceId}`);
    await remove(deviceRef);
};
