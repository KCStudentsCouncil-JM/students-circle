import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, User as FirebaseUser, Auth, signOut } from 'firebase/auth';
import { getFirestore, Firestore, collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { FeedbackReport, CampusEvent, UserProfile } from './types';
import { INITIAL_REPORTS, INITIAL_EVENTS, INITIAL_USERS } from './mockData';
import { safeLocalStorageSet } from './utils';

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
    console.warn('Firebase init error, fallback active:', error);
  }
}

export { app, auth, db };

// Local storage keys for fallback when Firebase credentials are not provided
const STORAGE_KEY_REPORTS = 'campus_feedback_reports';
const STORAGE_KEY_EVENTS = 'campus_events';
const STORAGE_KEY_USERS = 'campus_users';
const STORAGE_KEY_ACTIVE_USER = 'campus_active_user';

// Local storage listeners for real-time reactivity in fallback mode
const reportListeners = new Set<(reports: FeedbackReport[]) => void>();
const eventListeners = new Set<(events: CampusEvent[]) => void>();
const userListeners = new Set<(users: UserProfile[]) => void>();

function notifyReportListeners() {
  const data = getLocalReports();
  reportListeners.forEach(cb => cb(data));
}
function notifyEventListeners() {
  const data = getLocalEvents();
  eventListeners.forEach(cb => cb(data));
}
function notifyUserListeners() {
  const data = getLocalUsers();
  userListeners.forEach(cb => cb(data));
}

function getLocalReports(): FeedbackReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTS);
    if (!raw) {
      safeLocalStorageSet(STORAGE_KEY_REPORTS, INITIAL_REPORTS);
      return [...INITIAL_REPORTS];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [...INITIAL_REPORTS];
  }
}

function getLocalEvents(): CampusEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (!raw) {
      safeLocalStorageSet(STORAGE_KEY_EVENTS, INITIAL_EVENTS);
      return [...INITIAL_EVENTS];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [...INITIAL_EVENTS];
  }
}

function getLocalUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (!raw) {
      safeLocalStorageSet(STORAGE_KEY_USERS, INITIAL_USERS);
      return [...INITIAL_USERS];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [...INITIAL_USERS];
  }
}

export async function signInWithGoogleReal(): Promise<FirebaseUser | any> {
  if (auth && googleProvider) {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  }
  // Simulated fallback user for demo mode when Firebase keys are not set
  const fallbackUser = {
    displayName: 'Dylon Ocha',
    email: 'dylonnnaocha@gmail.com',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    uid: 'demo-dylon-uid',
  };
  localStorage.setItem(STORAGE_KEY_ACTIVE_USER, JSON.stringify(fallbackUser));
  return fallbackUser;
}

export async function signOutReal() {
  if (auth) {
    await signOut(auth);
  }
  localStorage.removeItem(STORAGE_KEY_ACTIVE_USER);
}

const sanitizeData = (data: any) => {
  return Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
};

// --- USER PROFILE FUNCTIONS ---

export async function updateUserLastActive(email: string) {
  const now = new Date().toISOString();
  if (db) {
    try {
      await updateDoc(doc(db, 'users', email), { lastActiveAt: now });
    } catch { /* silent */ }
  }
  const users = getLocalUsers().map((u) =>
    u.email.toLowerCase() === email.toLowerCase() ? { ...u, lastActiveAt: now } : u
  );
  safeLocalStorageSet(STORAGE_KEY_USERS, users);
  notifyUserListeners();
}

export async function getUserProfile(email: string): Promise<UserProfile | null> {
  if (db) {
    try {
      const docRef = doc(db, 'users', email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
    } catch (e) {
      console.warn('Firestore getUserProfile error, reading from local fallback:', e);
    }
  }
  const users = getLocalUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function createUserProfile(profile: UserProfile) {
  if (db) {
    try {
      await setDoc(doc(db, 'users', profile.email), sanitizeData(profile));
    } catch (e) {
      console.warn('Firestore createUserProfile error:', e);
    }
  }
  const users = getLocalUsers();
  const existingIdx = users.findIndex(u => u.email.toLowerCase() === profile.email.toLowerCase());
  let updatedUsers: UserProfile[];
  if (existingIdx >= 0) {
    updatedUsers = [...users];
    updatedUsers[existingIdx] = { ...updatedUsers[existingIdx], ...profile };
  } else {
    updatedUsers = [profile, ...users];
  }
  safeLocalStorageSet(STORAGE_KEY_USERS, updatedUsers);
  notifyUserListeners();
}

export function subscribeToUsers(callback: (users: UserProfile[]) => void) {
  if (db) {
    try {
      return onSnapshot(collection(db, 'users'), (snap) => {
        const data = snap.docs.map(d => d.data() as UserProfile);
        if (data.length > 0) {
          callback(data);
          safeLocalStorageSet(STORAGE_KEY_USERS, data);
        } else {
          callback(getLocalUsers());
        }
      }, (err) => {
        console.warn('Firestore users subscription failed, falling back to local storage:', err);
        callback(getLocalUsers());
      });
    } catch (e) {
      console.warn('Firestore subscribeToUsers error:', e);
    }
  }
  // Local storage subscription
  callback(getLocalUsers());
  userListeners.add(callback);
  return () => { userListeners.delete(callback); };
}

export async function approveUserInDb(email: string) {
  if (db) {
    try {
      await updateDoc(doc(db, 'users', email), { status: 'approved' });
    } catch (e) {
      console.warn('Firestore approveUserInDb error:', e);
    }
  }
  const users = getLocalUsers().map(u => u.email === email ? { ...u, status: 'approved' as const } : u);
  safeLocalStorageSet(STORAGE_KEY_USERS, users);
  notifyUserListeners();
}

export async function rejectUserInDb(email: string) {
  if (db) {
    try {
      await updateDoc(doc(db, 'users', email), { status: 'rejected' });
    } catch (e) {
      console.warn('Firestore rejectUserInDb error:', e);
    }
  }
  const users = getLocalUsers().map(u => u.email === email ? { ...u, status: 'rejected' as const } : u);
  safeLocalStorageSet(STORAGE_KEY_USERS, users);
  notifyUserListeners();
}

export async function removeUserInDb(email: string) {
  if (db) {
    try {
      await deleteDoc(doc(db, 'users', email));
    } catch (e) {
      console.warn('Firestore removeUserInDb error:', e);
    }
  }
  const users = getLocalUsers().filter(u => u.email !== email);
  safeLocalStorageSet(STORAGE_KEY_USERS, users);
  notifyUserListeners();
}

// --- APP DATA FUNCTIONS ---

export function subscribeToReports(callback: (reports: FeedbackReport[]) => void) {
  if (db) {
    try {
      return onSnapshot(collection(db, 'reports'), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as FeedbackReport));
        if (data.length > 0) {
          data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          callback(data);
          safeLocalStorageSet(STORAGE_KEY_REPORTS, data);
        } else {
          // If Firestore is empty, seed with initial reports
          callback(getLocalReports());
        }
      }, (err) => {
        console.warn('Firestore reports subscription error, using local fallback:', err);
        callback(getLocalReports());
      });
    } catch (e) {
      console.warn('Firestore subscribeToReports error:', e);
    }
  }
  // Fallback to local storage
  callback(getLocalReports());
  reportListeners.add(callback);
  return () => { reportListeners.delete(callback); };
}

export function subscribeToEvents(callback: (events: CampusEvent[]) => void) {
  if (db) {
    try {
      return onSnapshot(collection(db, 'events'), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CampusEvent));
        if (data.length > 0) {
          callback(data);
          safeLocalStorageSet(STORAGE_KEY_EVENTS, data);
        } else {
          callback(getLocalEvents());
        }
      }, (err) => {
        console.warn('Firestore events subscription error, using local fallback:', err);
        callback(getLocalEvents());
      });
    } catch (e) {
      console.warn('Firestore subscribeToEvents error:', e);
    }
  }
  // Fallback to local storage
  callback(getLocalEvents());
  eventListeners.add(callback);
  return () => { eventListeners.delete(callback); };
}

export async function saveReportToDb(report: FeedbackReport) {
  if (db) {
    try {
      await setDoc(doc(db, 'reports', report.id), sanitizeData(report));
    } catch (e) {
      console.warn('Firestore saveReportToDb error:', e);
    }
  }
  const reports = getLocalReports();
  const next = [report, ...reports.filter(r => r.id !== report.id)];
  safeLocalStorageSet(STORAGE_KEY_REPORTS, next);
  notifyReportListeners();
}

export async function updateReportInDb(id: string, updates: Partial<FeedbackReport>) {
  if (db) {
    try {
      await updateDoc(doc(db, 'reports', id), sanitizeData(updates));
    } catch (e) {
      console.warn('Firestore updateReportInDb error:', e);
    }
  }
  const reports = getLocalReports();
  const next = reports.map(r => r.id === id ? { ...r, ...updates } : r);
  safeLocalStorageSet(STORAGE_KEY_REPORTS, next);
  notifyReportListeners();
}

export async function deleteReportFromDb(id: string) {
  if (db) {
    try {
      await deleteDoc(doc(db, 'reports', id));
    } catch (e) {
      console.warn('Firestore deleteReportFromDb error:', e);
    }
  }
  const reports = getLocalReports();
  const next = reports.filter(r => r.id !== id);
  safeLocalStorageSet(STORAGE_KEY_REPORTS, next);
  notifyReportListeners();
}

export async function saveEventToDb(event: CampusEvent) {
  if (db) {
    try {
      await setDoc(doc(db, 'events', event.id), sanitizeData(event));
    } catch (e) {
      console.warn('Firestore saveEventToDb error:', e);
    }
  }
  const events = getLocalEvents();
  const next = [event, ...events.filter(e => e.id !== event.id)];
  safeLocalStorageSet(STORAGE_KEY_EVENTS, next);
  notifyEventListeners();
}

export async function updateEventInDb(id: string, updates: Partial<CampusEvent>) {
  if (db) {
    try {
      await updateDoc(doc(db, 'events', id), sanitizeData(updates));
    } catch (e) {
      console.warn('Firestore updateEventInDb error:', e);
    }
  }
  const events = getLocalEvents();
  const next = events.map(e => e.id === id ? { ...e, ...updates } : e);
  safeLocalStorageSet(STORAGE_KEY_EVENTS, next);
  notifyEventListeners();
}

export async function deleteEventFromDb(id: string) {
  if (db) {
    try {
      await deleteDoc(doc(db, 'events', id));
    } catch (e) {
      console.warn('Firestore deleteEventFromDb error:', e);
    }
  }
  const events = getLocalEvents();
  const next = events.filter(e => e.id !== id);
  safeLocalStorageSet(STORAGE_KEY_EVENTS, next);
  notifyEventListeners();
}