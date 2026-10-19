/**
 * Firebase Client & Authentication Configuration
 */
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, User as FirebaseUser, Auth } from 'firebase/auth';
import { getFirestore, Firestore, collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { FeedbackReport, CampusEvent } from './types';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (typeof window !== 'undefined' && isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.warn('Firebase init error:', error);
  }
}

export { app, auth, db };

export async function signInWithGoogleReal(): Promise<FirebaseUser> {
  if (!auth || !googleProvider) throw new Error('Firebase not configured');
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// --- HELPERS ---
// Firestore throws an error if it detects an `undefined` value.
// This function strips out any undefined fields before saving.
const sanitizeData = (data: any) => {
  return Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
};

// --- FIRESTORE SYNC FUNCTIONS ---

export function subscribeToReports(callback: (reports: FeedbackReport[]) => void) {
  if (!db) return () => {};
  const reportsRef = collection(db, 'reports');
  return onSnapshot(reportsRef, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as FeedbackReport));
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(data);
  }, (error) => {
    console.error("Error listening to reports:", error);
  });
}

export function subscribeToEvents(callback: (events: CampusEvent[]) => void) {
  if (!db) return () => {};
  const eventsRef = collection(db, 'events');
  return onSnapshot(eventsRef, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CampusEvent));
    callback(data);
  }, (error) => {
    console.error("Error listening to events:", error);
  });
}

export async function saveReportToDb(report: FeedbackReport) {
  if (!db) throw new Error('Firebase database is not configured.');
  try {
    const docRef = doc(db, 'reports', report.id);
    await setDoc(docRef, sanitizeData(report));
  } catch (error) {
    console.error("Error saving report:", error);
    throw error;
  }
}

export async function updateReportInDb(id: string, updates: Partial<FeedbackReport>) {
  if (!db) throw new Error('Firebase database is not configured.');
  try {
    const docRef = doc(db, 'reports', id);
    await updateDoc(docRef, sanitizeData(updates));
  } catch (error) {
    console.error("Error updating report:", error);
    throw error;
  }
}

export async function deleteReportFromDb(id: string) {
  if (!db) throw new Error('Firebase database is not configured.');
  const docRef = doc(db, 'reports', id);
  await deleteDoc(docRef);
}

export async function saveEventToDb(event: CampusEvent) {
  if (!db) throw new Error('Firebase database is not configured.');
  try {
    const docRef = doc(db, 'events', event.id);
    await setDoc(docRef, sanitizeData(event));
  } catch (error) {
    console.error("Error saving event:", error);
    throw error;
  }
}

export async function updateEventInDb(id: string, updates: Partial<CampusEvent>) {
  if (!db) throw new Error('Firebase database is not configured.');
  try {
    const docRef = doc(db, 'events', id);
    await updateDoc(docRef, sanitizeData(updates));
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
}

export async function deleteEventFromDb(id: string) {
  if (!db) throw new Error('Firebase database is not configured.');
  const docRef = doc(db, 'events', id);
  await deleteDoc(docRef);
}