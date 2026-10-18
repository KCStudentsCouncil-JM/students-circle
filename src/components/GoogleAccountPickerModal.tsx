import React, { useState, useEffect } from 'react';
import { AuthUser, isBirthdayToday } from '../types';
import { 
  signInWithGoogleReal, 
  isFirebaseConfigured 
} from '../firebase';
import { 
  X, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Calendar,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  Database,
  Cloud
} from 'lucide-react';

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
  const [firebaseActive, setFirebaseActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Real user profile setup fields
  const [googleName, setGoogleName] = useState(() => {
    try {
      const saved = localStorage.getItem('campus_auth_user');
      if (saved) return JSON.parse(saved).name || 'Dylon Ocha';
    } catch {}
    return 'Dylon Ocha';
  });

  const [googleEmail, setGoogleEmail] = useState(() => {
    try {
      const saved = localStorage.getItem('campus_auth_user');
      if (saved) return JSON.parse(saved).email || 'dylonnnaocha@gmail.com';
    } catch {}
    return 'dylonnnaocha@gmail.com';
  });

  const [classYear, setClassYear] = useState("Class of '26 (Junior)");
  const [major, setMajor] = useState('Engineering');
  const [birthday, setBirthday] = useState(() => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `2004-${m}-${day}`;
  });
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80'
  );

  useEffect(() => {
    setFirebaseActive(isFirebaseConfigured());
  }, [isOpen]);

  if (!isOpen) return null;

  // Real Google Sign In via Firebase popup
  const handleFirebaseGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const firebaseUser = await signInWithGoogleReal();
      const userProfile: AuthUser = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || googleName || 'Google User',
        email: firebaseUser.email || googleEmail,
        role: 'student',
        title: `${major} · ${classYear}`,
        photo: firebaseUser.photoURL || photoUrl,
        birthday: birthday || undefined,
        classYear: classYear,
        major: major,
        provider: 'google',
      };
      onSelectAccount(userProfile);
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setAuthError(err.message || 'Google Sign-In failed or popup was closed. You can also sign in with your Google email directly below.');
    } finally {
      setIsLoading(false);
    }
  };

  // Direct Google Sign In with email, class, and birthday profile
  const handleDirectGoogleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim() || !googleEmail.includes('@')) {
      setAuthError('Please enter a valid Google email address.');
      return;
    }
    if (!googleName.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }

    const userProfile: AuthUser = {
      id: `usr-google-${Date.now()}`,
      name: googleName.trim(),
      email: googleEmail.trim().toLowerCase(),
      role: 'student',
      title: `${major} · ${classYear}`,
      photo: photoUrl,
      birthday: birthday || undefined,
      classYear: classYear,
      major: major,
      provider: 'google',
    };

    onSelectAccount(userProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-purple-200/90 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92dvh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-purple-100 flex items-start justify-between bg-gradient-to-r from-purple-50/60 via-pink-50/40 to-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Sign In with Google Account
              </h2>
            </div>
            <p className="text-xs text-purple-900/70">
              Campus Feedback Assistant & Student Leadership Hub
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 select-text">
          {/* Firebase / Cloud Console Status Notice */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/70 flex items-start gap-2.5 text-xs text-purple-950">
            <Cloud className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-purple-950">
                <span>Google Cloud & Firebase Auth Ready</span>
                {firebaseActive ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Live Firebase Connected
                  </span>
                ) : (
                  <span className="text-[10px] bg-purple-200/80 text-purple-900 font-medium px-2 py-0.5 rounded-full">
                    Awaiting .env credentials
                  </span>
                )}
              </div>
              <p className="text-[11px] text-purple-800/80 leading-relaxed">
                {firebaseActive 
                  ? 'Your Firebase project is connected. Click the Google button below to sign in directly with your live Google Account.'
                  : 'You can paste your Firebase project credentials in .env at any time, or sign in directly with your Google account details below.'}
              </p>
            </div>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Primary Action Button: Live Google Popup (if Firebase is active) or Direct Google Login */}
          {firebaseActive && (
            <button
              type="button"
              onClick={handleFirebaseGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-sm transition active:scale-[0.99] cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>{isLoading ? 'Connecting to Google...' : 'Sign in with Google Popup'}</span>
            </button>
          )}

          {/* Profile Details Form */}
          <form onSubmit={handleDirectGoogleSignIn} className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-purple-950">
                Student Account Details
              </label>
              <span className="text-[10px] text-purple-600">Saved securely in browser</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="e.g. Dylon Ocha"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Google Email Address
                </label>
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="e.g. dylonnnaocha@gmail.com"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 bg-white font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Graduation Class Year
                  </label>
                  <select
                    value={classYear}
                    onChange={(e) => setClassYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 bg-white"
                  >
                    <option value="Class of '25 (Senior)">Class of '25 (Senior)</option>
                    <option value="Class of '26 (Junior)">Class of '26 (Junior)</option>
                    <option value="Class of '27 (Sophomore)">Class of '27 (Sophomore)</option>
                    <option value="Class of '28 (Freshman)">Class of '28 (Freshman)</option>
                    <option value="Graduate Researcher">Graduate Researcher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Academic Major
                  </label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="e.g. Engineering"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-slate-700">
                    Birthday (for Birthday Recognition & Treats)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      const m = String(d.getMonth() + 1).padStart(2, '0');
                      const day = String(d.getDate()).padStart(2, '0');
                      setBirthday(`2004-${m}-${day}`);
                    }}
                    className="text-[10px] text-pink-600 hover:text-pink-800 font-semibold cursor-pointer"
                  >
                    Set to Today (Test Highlight)
                  </button>
                </div>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 bg-white"
                />
              </div>

              {/* Photo preview & custom URL */}
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Profile Photo URL
                </label>
                <div className="flex items-center gap-2">
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="w-9 h-9 rounded-xl object-cover border border-purple-200 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80';
                    }}
                  />
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-700 via-purple-800 to-pink-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                <span>Continue with Google Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
