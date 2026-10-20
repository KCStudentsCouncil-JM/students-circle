import React, { useState, useEffect } from 'react';
import { RoleMode } from '../types';
import { isFirebaseConfigured } from '../firebase';
import { X, AlertCircle, ShieldCheck, UserCheck, Sparkles, Database } from 'lucide-react';

interface GoogleAccountPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (simulatedUser?: { email: string; name: string; photoURL?: string }) => void;
  targetRole?: RoleMode;
}

export const GoogleAccountPickerModal: React.FC<GoogleAccountPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
  targetRole = 'student',
}) => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [firebaseActive, setFirebaseActive] = useState(false);

  useEffect(() => {
    setFirebaseActive(isFirebaseConfigured());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    // If Firebase is configured, trigger the standard Firebase Google Auth popup
    if (firebaseActive) {
      onSelectAccount();
      onClose();
      return;
    }

    // In demo/offline mode, log in with default demo profile for the requested role
    if (targetRole === 'admin') {
      onSelectAccount({
        email: 'admin@campus.edu',
        name: 'Campus Administrator',
        photoURL: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
      });
    } else {
      onSelectAccount({
        email: 'dylonnnaocha@gmail.com',
        name: 'Dylon Ocha',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      });
    }
    onClose();
  };

  const handleSelectPresetStudent = (email: string, name: string, photoURL: string) => {
    onSelectAccount({ email, name, photoURL });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-purple-200/90 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col text-slate-800 dark:text-slate-100">
        
        <div className="p-6 pb-4 border-b border-purple-100 dark:border-slate-800 flex items-start justify-between bg-gradient-to-r from-purple-50/60 to-white dark:from-slate-800/80 dark:to-slate-900">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-pink-400" />
              {targetRole === 'admin' ? 'Admin Access Verification' : 'Student Access Verification'}
            </h2>
            <p className="text-xs text-purple-900/70 dark:text-purple-300">
              {firebaseActive 
                ? 'Sign in with your verified Google account to access KC Students Circle.'
                : 'Choose a verified campus identity or proceed with demo authentication.'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-purple-50/70 dark:bg-slate-800 border border-purple-100 dark:border-slate-700 text-xs">
            <span className="text-purple-700 dark:text-purple-300 font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Storage Backend
            </span>
            <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-full ${
              firebaseActive 
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' 
                : 'bg-purple-200 dark:bg-slate-700 text-purple-900 dark:text-purple-200'
            }`}>
              {firebaseActive ? '● Firebase Cloud' : '● Local Offline Storage'}
            </span>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Quick Select Presets for testing */}
          {targetRole === 'student' && !firebaseActive && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900/70 dark:text-purple-400 block">
                Instant Student Sign-In
              </span>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleSelectPresetStudent(
                    'dylonnnaocha@gmail.com',
                    'Dylon Ocha',
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
                  )}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-purple-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-slate-800 transition-all text-left cursor-pointer group bg-white dark:bg-slate-850"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80" 
                      alt="Dylon" 
                      className="w-9 h-9 rounded-full object-cover border border-amber-300 ring-2 ring-pink-400"
                    />
                    <div>
                      <div className="font-bold text-xs text-purple-950 dark:text-purple-100 flex items-center gap-1.5">
                        <span>Dylon Ocha</span>
                        <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 px-1.5 py-0.2 rounded font-bold">🎂 Birthday Today</span>
                      </div>
                      <p className="text-[10px] text-purple-700/70 dark:text-purple-400">Computer Science · Class of '26</p>
                    </div>
                  </div>
                  <UserCheck className="w-4 h-4 text-purple-500 opacity-60 group-hover:opacity-100" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPresetStudent(
                    'sarah.j@campus.edu',
                    'Sarah Jenkins',
                    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80'
                  )}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-purple-100 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50/30 dark:hover:bg-slate-800 transition-all text-left cursor-pointer group bg-white dark:bg-slate-850"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80" 
                      alt="Sarah" 
                      className="w-9 h-9 rounded-full object-cover border border-purple-200 dark:border-slate-700"
                    />
                    <div>
                      <div className="font-bold text-xs text-purple-950 dark:text-purple-100">Sarah Jenkins</div>
                      <p className="text-[10px] text-purple-700/70 dark:text-purple-400">Biochemistry · Class of '25</p>
                    </div>
                  </div>
                  <UserCheck className="w-4 h-4 text-purple-400 opacity-40 group-hover:opacity-100" />
                </button>
              </div>
            </div>
          )}

          {/* Standard Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold text-sm shadow-sm transition active:scale-[0.99] cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>
              {firebaseActive 
                ? 'Continue to Google' 
                : targetRole === 'admin' 
                  ? 'Sign in as Campus Administrator' 
                  : 'Continue as Verified Student'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};