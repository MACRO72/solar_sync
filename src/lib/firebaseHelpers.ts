// src/lib/firebaseHelpers.ts
import {
    ref,
    push,
    set,
    get,
    onValue,
    off,
    DataSnapshot,
    Query,
  } from "firebase/database";
  import { db } from "./firebase";
  
  export type RowData = {
    timestamp?: string;
    temperature?: string | number;
    humidity?: string | number;
    light?: string | number;
    voltage?: string | number;
    // add fields your CSV has
  };
  
  // push a JSON object under "/data" (generates unique key)
  export async function pushData(path: string, payload: RowData) {
    const r = ref(db, path);
    const newRef = push(r);
    await set(newRef, payload);
    return newRef.key;
  }
  
  // set data at a specific path (overwrites)
  export async function setData(path: string, payload: any) {
    const r = ref(db, path);
    await set(r, payload);
  }
  
  // read once
  export async function getData(path: string) {
    const r = ref(db, path);
    const snap = await get(r);
    return snap.exists() ? (snap.val() as any) : null;
  }
  
  // subscribe to realtime updates
  export function subscribeData(path: string, cb: (snap: DataSnapshot) => void) {
    const r = ref(db, path);
    onValue(r, cb);
    return () => off(r); // cleanup function
  }