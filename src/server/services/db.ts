import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, Firestore } from 'firebase/firestore';
import fs from 'fs/promises';
import path from 'path';

let db: Firestore | null = null;

export async function initFirebase() {
  if (db) return db;
  try {
    const firebaseConfigPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    const configData = await fs.readFile(firebaseConfigPath, 'utf-8');
    const firebaseConfig = JSON.parse(configData);
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    console.log('Firebase initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
}

export function getDb(): Firestore {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

export async function getRandomImage() {
  const database = getDb();
  const imagesRef = collection(database, 'cosplay_images');
  const snapshot = await getDocs(imagesRef);
  
  if (snapshot.empty) {
    return null;
  }

  const images: any[] = [];
  snapshot.forEach(doc => {
    images.push({ id: doc.id, ...doc.data() });
  });

  return images[Math.floor(Math.random() * images.length)];
}

export async function getImageById(id: string) {
  const database = getDb();
  const docRef = doc(database, 'cosplay_images', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return { id: docSnap.id, ...docSnap.data() };
}
