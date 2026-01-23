
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import { User } from "../types";

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

// Initialize Firebase (Compat)
// Ensure we don't initialize twice in hot-reload environments
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();
export const db = firebase.firestore(app);
export const storage = firebase.storage(app);

export const checkFirebaseConfig = () => isConfigured;

export const subscribeToCollection = (
  collectionName: string, 
  callback: (data: any[]) => void, 
  onError?: (error: any) => void,
  orderField: string = "date"
) => {
  try {
    const query = db.collection(collectionName).orderBy(orderField, "desc");
    
    return query.onSnapshot((snapshot) => {
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
    const batch = db.batch();
    
    const recordsCol = db.collection("records");
    const recordsSnap = await recordsCol.get();
    
    if (recordsSnap.empty) {
      records.forEach((record) => {
        const newDocRef = recordsCol.doc();
        const { id, ...data } = record;
        batch.set(newDocRef, { ...data, createdAt: new Date().toISOString() });
      });
    }

    const usersCol = db.collection("users");
    const usersSnap = await usersCol.get();
    
    if (usersSnap.empty) {
      users.forEach((user) => {
        const userRef = usersCol.doc(user.id);
        batch.set(userRef, user);
      });
    }

    await batch.commit();
    return { success: true, message: "Datos sincronizados correctamente." };
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
    const storageRef = storage.ref();
    const fileRef = storageRef.child(path);
    await fileRef.put(file);
    const downloadUrl = await fileRef.getDownloadURL();
    return downloadUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// --- User Operations ---
export const fbAddUser = async (user: Omit<User, 'id'>) => {
  return await db.collection("users").add({
    ...user,
    createdAt: new Date().toISOString()
  });
};

export const fbUpdateUser = async (id: string, data: any) => {
  return await db.collection("users").doc(id).set(data, { merge: true });
};

export const fbDeleteUser = async (id: string) => {
  return await db.collection("users").doc(id).delete();
};

// --- Record Operations ---
export const fbAddRecord = async (record: any) => {
  return await db.collection("records").add({
    ...record,
    createdAt: new Date().toISOString()
  });
};

export const fbUpdateRecord = async (id: string, data: any) => {
  return await db.collection("records").doc(id).update(data);
};

export const fbDeleteRecord = async (id: string) => {
  return await db.collection("records").doc(id).delete();
};
