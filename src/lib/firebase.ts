import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, getDocs, doc, setDoc, getDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "modular-setting-7224x",
  appId: "1:979591359012:web:27eae1903244143b9486b1",
  storageBucket: "modular-setting-7224x.firebasestorage.app",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: "modular-setting-7224x.firebaseapp.com",
  messagingSenderId: "979591359012"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const storage = typeof window !== 'undefined' ? getStorage(app) : null;
let db = null as any;
if (typeof window !== 'undefined') {
  try {
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase Firestore initialization failed:", error);
  }
}
export { db };
export { storage };

// Graceful helpers that fallback to localStorage on Firestore failure/permission errors
const withTimeout = <T>(promise: Promise<T>, ms: number = 2500): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms))
  ]);
};

export async function safeGetCollection<T extends object>(collectionName: string, defaultData: T[]): Promise<T[]> {
  try {
    if (!db) throw new Error("Firestore is not available on the server.");
    const colRef = collection(db, collectionName);
    const snapshot = await withTimeout(getDocs(colRef), 2500);
    if (snapshot.empty) {
      // Seed initial data to Firestore so it starts with records
      for (const item of defaultData) {
        const docId = (item as any).id || (item as any).staffId || (item as any).code || null;
        if (docId) {
          await withTimeout(setDoc(doc(db, collectionName, docId), item), 2000);
        } else {
          await withTimeout(addDoc(colRef, item), 2000);
        }
      }
      return defaultData;
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as unknown as T);
  } catch (error) {
    console.warn(`Firestore read failed for ${collectionName}, falling back to localStorage:`, error);
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`firebase_fallback_${collectionName}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          return defaultData;
        }
      }
    }
    return defaultData;
  }
}

export async function safeSetDoc(collectionName: string, docId: string, data: any): Promise<void> {
  try {
    if (!db) throw new Error("Firestore is not available on the server.");
    await withTimeout(setDoc(doc(db, collectionName, docId), data), 2500);
  } catch (error) {
    console.warn(`Firestore write failed for ${collectionName}/${docId}:`, error);
  }
  // Always update local cache as fallback
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(`firebase_fallback_${collectionName}`);
    let list = cached ? JSON.parse(cached) : [];
    const keyName = collectionName === 'nominal_roll' ? 'staffId' : 'id';
    list = list.filter((item: any) => item[keyName] !== docId);
    list.push(data);
    localStorage.setItem(`firebase_fallback_${collectionName}`, JSON.stringify(list));
  }
}

export async function safeAddDoc(collectionName: string, data: any): Promise<string> {
  try {
    if (!db) throw new Error("Firestore is not available on the server.");
    const docRef = await withTimeout(addDoc(collection(db, collectionName), data), 2500);
    return docRef.id;
  } catch (error) {
    console.warn(`Firestore add failed for ${collectionName}:`, error);
    const id = `local_${Date.now()}`;
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`firebase_fallback_${collectionName}`);
      const list = cached ? JSON.parse(cached) : [];
      list.push({ id, ...data });
      localStorage.setItem(`firebase_fallback_${collectionName}`, JSON.stringify(list));
    }
    return id;
  }
}
/**
 * Upload a file to Firebase Storage and return its download URL.
 * @param path Storage path, e.g., "user_passports/{staffId}.jpg"
 * @param file File object to upload
 */
export async function uploadFile(path: string, file: File): Promise<string> {
  if (!storage) {
    console.warn('Firebase Storage is not available.');
    return '';
  }
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);
  await new Promise<void>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      null,
      (error) => reject(error),
      () => resolve()
    );
  });
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}
