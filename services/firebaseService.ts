
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch, 
  getDocs,
  where
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { User, SystemEntity, Comment } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyDmRdYQ9xTwo2BEwAWa0Q8wfB-AF-sUcUk",
  authDomain: "tracetech-17399.firebaseapp.com",
  projectId: "tracetech-17399",
  storageBucket: "tracetech-17399.firebasestorage.app",
  messagingSenderId: "305009152652",
  appId: "1:305009152652:web:1456eac16794f42e4761a9",
  measurementId: "G-GGSCS78E16"
};

const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "TU_API_KEY_AQUI";

// Initialize Firebase (Modular Pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const storage = getStorage(app);

export const checkFirebaseConfig = () => isConfigured;

export const subscribeToCollection = (
  collectionName: string, 
  callback: (data: any[]) => void, 
  onError?: (error: any) => void,
  orderField: string = "date"
) => {
  try {
    const colRef = collection(db, collectionName);
    const q = query(colRef, orderBy(orderField, "desc"));
    
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    }, (error) => {
      console.warn(`Firestore [${collectionName}]: Error de suscripción`, error);
      if (onError) onError(error);
    });
  } catch (err) {
    console.error(`Suscripción crítica fallida: ${collectionName}`, err);
    if (onError) onError(err);
    return () => {};
  }
};

export const seedSystemData = async (records: any[], users: any[]) => {
  try {
    const batch = writeBatch(db);
    
    users.forEach((user: any) => {
      const userRef = doc(db, "users", user.id); 
      batch.set(userRef, user);
    });

    records.forEach((record: any) => {
      const recordRef = doc(db, "records", record.id);
      batch.set(recordRef, { ...record, createdAt: new Date().toISOString() }, { merge: true });
    });

    await batch.commit();
    return { success: true, message: "Usuarios y datos restaurados correctamente. Intenta ingresar ahora." };
  } catch (error: any) {
    console.error("Error durante el seeding:", error);
    return { 
      success: false, 
      message: error.code === 'permission-denied' 
        ? "No tienes permisos de escritura. Revisa las reglas de seguridad." 
        : `Error: ${error.message}` 
    };
  }
};

// --- Storage Utilities ---
export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// --- System Entities (Categories & Statuses) ---
export const fbAddSystemEntity = async (collectionName: 'categories' | 'statuses', data: Omit<SystemEntity, 'id'>) => {
  return await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
};

export const fbUpdateSystemEntity = async (collectionName: 'categories' | 'statuses', id: string, data: Partial<SystemEntity>) => {
  const ref = doc(db, collectionName, id);
  return await updateDoc(ref, {
    ...data,
    updatedAt: new Date().toISOString()
  });
};

export const fbDeleteSystemEntity = async (collectionName: 'categories' | 'statuses', id: string) => {
  return await deleteDoc(doc(db, collectionName, id));
};

// --- User Operations ---
export const fbAddUser = async (user: Omit<User, 'id'>) => {
  return await addDoc(collection(db, "users"), {
    ...user,
    createdAt: new Date().toISOString()
  });
};

export const fbUpdateUser = async (id: string, data: any) => {
  const userRef = doc(db, "users", id);
  return await setDoc(userRef, data, { merge: true });
};

export const fbDeleteUser = async (id: string) => {
  return await deleteDoc(doc(db, "users", id));
};

// --- Record Operations ---
export const fbAddRecord = async (record: any) => {
  return await addDoc(collection(db, "records"), {
    ...record,
    createdAt: new Date().toISOString()
  });
};

export const fbUpdateRecord = async (id: string, data: any) => {
  const recordRef = doc(db, "records", id);
  return await updateDoc(recordRef, data);
};

export const fbDeleteRecord = async (id: string) => {
  return await deleteDoc(doc(db, "records", id));
};

// --- Comment Operations ---
export const fbAddComment = async (comment: Omit<Comment, 'id'>) => {
  return await addDoc(collection(db, "comments"), {
    ...comment,
    createdAt: new Date().toISOString()
  });
};

export const fbDeleteComment = async (id: string) => {
  return await deleteDoc(doc(db, "comments", id));
};

export const subscribeToComments = (recordId: string, callback: (comments: Comment[]) => void) => {
  const q = query(collection(db, "comments"), where("recordId", "==", recordId), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
    callback(data);
  });
};
