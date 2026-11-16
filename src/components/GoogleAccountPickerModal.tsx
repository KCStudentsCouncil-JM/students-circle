import React, { useState, useEffect } from 'react';
import { RoleMode, UserProfile, isBirthdayToday } from '../types';
import { isFirebaseConfigured } from '../firebase';
import { X, AlertCircle, ShieldCheck, UserCheck, Database, Mail, ArrowRight } from 'lucide-react';

interface GoogleAccountPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (selectedUser?: { email: string; name: string; photoURL?: string }) => void;
  targetRole?: RoleMode;
  existingUsers?: UserProfile[];
}

export const GoogleAccountPickerModal: React.FC<GoogleAccountPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
  targetRole = 'student',
  existingUsers = [],
}) => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [firebaseActive, setFirebaseActive] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  useEffect(() => {
    setFirebaseActive(isFirebaseConfigured());
    if (isOpen) {
      setAuthError(null);
      setCustomEmail('');
      setCustomName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const matchingAccounts = existingUsers.filter((u) =>
    targetRole === 'admin' ? u.role === 'admin' : u.role === 'student'
  );

  const handleGoogleSignIn = () => {
    if (firebaseActive) {
      onSelectAccount();
      onClose();
      return;
    }

    if (targetRole === 'admin') {
      const adminUser = existingUsers.find((u) => u.role === 'admin');
      onSelectAccount({
        email: adminUser?.email || 'principal@kc.edu.jm',
        name: adminUser?.name || 'Principal Reid',
        photoURL:
          adminUser?.photo ||
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
      });
    } else {
      const approvedStudent = existingUsers.find((u) => u.role === 'student' && u.status === 'approved');
      onSelectAccount({
        email: approvedStudent?.email || 'headboy@kc.edu.jm',
        name: approvedStudent?.name || 'Dylon Ocha',
        photoURL:
          approvedStudent?.photo ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      });
    }
    onClose();
  };

  const handleSelectAccount = (user: UserProfile) => {
    onSelectAccount({
      email: user.email,
      name: user.name,
      photoURL: user.photo,
    });
    onClose();
  };

  const handleCustomEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = customEmail.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setAuthError('Please enter a valid school or personal email address.');
      return;
    }

    const existing = existingUsers.find((u) => u.email.toLowerCase() === trimmedEmail);
    const displayName = existing?.name || customName.trim() || trimmedEmail.split('@')[0];

    onSelectAccount({
      email: existing?.email || trimmedEmail,
      name: displayName,
      photoURL: existing?.photo,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-purple-200/90 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col text-slate-800 dark:text-slate-100 max-h-[92dvh]">
        <div className="p-5 sm:p-6 pb-4 border-b border-purple-100 dark:border-slate-800 flex items-start justify-between bg-gradient-to-r from-purple-50/60 to-white dark:from-slate-800/80 dark:to-slate-900 shrink-0">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              {targetRole === 'admin' ? 'Staff & Admin Sign-In' : 'Kingston College Student Sign-In'}
            </h2>
            <p className="text-xs text-purple-900/70 dark:text-purple-300">
              {firebaseActive
                ? 'Sign in with your verified Google account to access KC Students Circle.'
                : 'Select a registered campus profile or sign in with your email address.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto momentum-scroll">
          {/* Storage Mode Indicator */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-purple-50/70 dark:bg-slate-800 border border-purple-100 dark:border-slate-700 text-xs">
            <span className="text-purple-700 dark:text-purple-300 font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Storage Backend
            </span>
            <span
              className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-full ${
                firebaseActive
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  : 'bg-purple-200 dark:bg-slate-700 text-purple-900 dark:text-purple-200'
              }`}
            >
              {firebaseActive ? '● Firebase Cloud' : '● Local Persistence'}
            </span>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Registered Profiles in Local Mode */}
          {!firebaseActive && matchingAccounts.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900/70 dark:text-purple-400 block">
                {targetRole === 'admin' ? 'Staff Accounts' : 'Registered Student Accounts'}
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                {matchingAccounts.map((acct) => {
                  const hasBirthday = acct.status === 'approved' && isBirthdayToday(acct.birthday);
                  return (
                    <button
                      key={acct.email}
                      type="button"
                      onClick={() => handleSelectAccount(acct)}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-purple-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-slate-800 transition-all text-left cursor-pointer group bg-white dark:bg-slate-800/80"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {acct.photo ? (
                          <img
                            src={acct.photo}
                            alt={acct.name}
                            className={`w-9 h-9 rounded-full object-cover border shrink-0 ${
                              hasBirthday ? 'border-amber-300 ring-2 ring-amber-400' : 'border-purple-200 dark:border-slate-700'
                            }`}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {acct.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-purple-950 dark:text-purple-100 flex items-center gap-1.5 flex-wrap">
                            <span className="truncate">{acct.name}</span>
                            {hasBirthday && (
                              <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 px-1.5 py-0.5 rounded font-bold">
                                🎂 Birthday Today
                              </span>
                            )}
                            {acct.status === 'pending' && (
                              <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold">
                                Pending
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-purple-700/70 dark:text-purple-400 truncate">
                            {acct.title || `${acct.major || 'Student'} · ${acct.classYear || 'KC'}`}
                          </p>
                        </div>
                      </div>
                      <UserCheck className="w-4 h-4 text-purple-500 opacity-60 group-hover:opacity-100 shrink-0 ml-2" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Email Registration / Sign-In in Local Mode */}
          {!firebaseActive && (
            <form onSubmit={handleCustomEmailSubmit} className="space-y-2.5 pt-2 border-t border-purple-100 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900/70 dark:text-purple-400 block">
                Sign In or Register with Email
              </span>
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="student@kc.edu.jm"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-purple-200 dark:border-slate-700 bg-purple-50/40 dark:bg-slate-800 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Full Name (for new accounts)"
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-purple-200 dark:border-slate-700 bg-purple-50/40 dark:bg-slate-800 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <span>Continue with Email</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* Google Sign-In Button (Firebase Auth or Quick Default) */}
          {firebaseActive ? (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm shadow-sm transition active:scale-[0.99] cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              <span>Continue to Google</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};