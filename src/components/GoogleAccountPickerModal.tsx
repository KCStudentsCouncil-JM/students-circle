import React, { useState, useEffect } from 'react';
import { AuthUser } from '../types';
import { signInWithGoogleReal, isFirebaseConfigured } from '../firebase';
import { X, AlertCircle, ShieldCheck } from 'lucide-react';

interface GoogleAccountPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (user: AuthUser) => void;
}

export const GoogleAccountPickerModal: React.FC<GoogleAccountPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [firebaseActive, setFirebaseActive] = useState(false);

  useEffect(() => {
    setFirebaseActive(isFirebaseConfigured());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    if (!firebaseActive) {
      setAuthError('Firebase is not configured. Please add your VITE_FIREBASE_ keys to your .env file.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    try {
      const firebaseUser = await signInWithGoogleReal();
      
      // We force the user to be a student, but they can toggle to admin later
      const userProfile: AuthUser = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Google User',
        email: firebaseUser.email || '',
        role: 'student',
        title: 'Verified Student',
        photo: firebaseUser.photoURL || undefined,
        provider: 'google',
      };
      
      onSelectAccount(userProfile);
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setAuthError(err.message || 'Google Sign-In failed or popup was closed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-3xl shadow-2xl border border-purple-200/90 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        
        <div className="p-6 pb-4 border-b border-purple-100 flex items-start justify-between bg-gradient-to-r from-purple-50/60 to-white">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              Verify Student Account
            </h2>
            <p className="text-xs text-purple-900/70">
              You must sign in with a verified Google account to access the portal.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {!firebaseActive && (
             <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
             <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
             <span>Firebase credentials are missing. Add them to your `.env` file and GitHub Secrets to enable real login.</span>
           </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-sm transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>{isLoading ? 'Verifying...' : 'Sign in with Google'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};