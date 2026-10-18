/**
 * Firebase Client & Authentication Configuration
 * Supports Google Sign-In with real Google accounts via Firebase Auth
 * and persistent Cloud Firestore storage.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Configuration loaded from standard Vite environment variables
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey !== 'your-api-key' &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== 'your-project-id'
  );
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
    googleProvider.setCustomParameters({
      prompt: 'select_account',
    });
  } catch (error) {
    console.warn('Firebase initialization skipped or encountered error:', error);
  }
}

export { app, auth, db, googleProvider };

/**
 * Sign in with real Google Account popup via Firebase Auth
 */
export async function signInWithGoogleReal(): Promise<FirebaseUser> {
  if (!auth || !googleProvider) {
    throw new Error('Firebase credentials are not configured yet. Please configure your Firebase environment variables in .env');
  }

  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Sign out from Firebase Auth
 */
export async function logOutFromFirebase(): Promise<void> {
  if (auth) {
    await firebaseSignOut(auth);
  }
}

/**
 * Listen for Firebase Auth state changes
 */
export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
