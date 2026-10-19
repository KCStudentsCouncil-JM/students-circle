import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, User as FirebaseUser, Auth, signOut } from 'firebase/auth';
import { getFirestore, Firestore, collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { FeedbackReport, CampusEvent, UserProfile } from './types';

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

export async function signOutReal() {
  if (auth) await signOut(auth);
}

const sanitizeData = (data: any) => {
  return Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
};

// --- USER PROFILE FUNCTIONS ---

export async function getUserProfile(email: string): Promise<UserProfile | null> {
  if (!db) return null;
  const docRef = doc(db, 'users', email);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
}

export async function createUserProfile(profile: UserProfile) {
  if (!db) return;
  await setDoc(doc(db, 'users', profile.email), sanitizeData(profile));
}

export function subscribeToUsers(callback: (users: UserProfile[]) => void) {
  if (!db) return () => {};
  return onSnapshot(collection(db, 'users'), (snap) => {
    callback(snap.docs.map(d => d.data() as UserProfile));
  });
}

export async function approveUserInDb(email: string) {
  if (!db) return;
  await updateDoc(doc(db, 'users', email), { status: 'approved' });
}

export async function rejectUserInDb(email: string) {
  if (!db) return;
  await updateDoc(doc(db, 'users', email), { status: 'rejected' });
}

export async function removeUserInDb(email: string) {
  if (!db) return;
  await deleteDoc(doc(db, 'users', email));
}

// --- APP DATA FUNCTIONS ---
export function subscribeToReports(callback: (reports: FeedbackReport[]) => void) {
  if (!db) return () => {};
  return onSnapshot(collection(db, 'reports'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as FeedbackReport));
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(data);
  });
}

export function subscribeToEvents(callback: (events: CampusEvent[]) => void) {
  if (!db) return () => {};
  return onSnapshot(collection(db, 'events'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CampusEvent));
    callback(data);
  });
}

export async function saveReportToDb(report: FeedbackReport) { if (db) await setDoc(doc(db, 'reports', report.id), sanitizeData(report)); }
export async function updateReportInDb(id: string, updates: Partial<FeedbackReport>) { if (db) await updateDoc(doc(db, 'reports', id), sanitizeData(updates)); }
export async function deleteReportFromDb(id: string) { if (db) await deleteDoc(doc(db, 'reports', id)); }
export async function saveEventToDb(event: CampusEvent) { if (db) await setDoc(doc(db, 'events', event.id), sanitizeData(event)); }
export async function updateEventInDb(id: string, updates: Partial<CampusEvent>) { if (db) await updateDoc(doc(db, 'events', id), sanitizeData(updates)); }
export async function deleteEventFromDb(id: string) { if (db) await deleteDoc(doc(db, 'events', id)); }