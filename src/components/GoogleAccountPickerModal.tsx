import React, { useState, useEffect } from 'react';
import { AuthUser, isBirthdayToday } from '../types';
import { 
  X, 
  UserPlus, 
  Trash2, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Calendar,
  GraduationCap,
  ArrowRight
} from 'lucide-react';

interface GoogleAccountPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (user: AuthUser) => void;
}

const DEFAULT_ACCOUNTS: AuthUser[] = [
  {
    id: 'google-usr-01',
    name: 'Dylon Ocha',
    email: 'dylonnnaocha@gmail.com',
    role: 'student',
    title: "Engineering Researcher · Class of '26",
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
    birthday: (() => {
      const d = new Date();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `2004-${m}-${day}`;
    })(),
    classYear: "Class of '26 (Junior)",
    major: 'Engineering',
    provider: 'google',
  },
  {
    id: 'google-usr-02',
    name: 'Elena Rostova',
    email: 'e.rostova@campus.edu',
    role: 'student',
    title: "Computer Science '26 · Senate Rep",
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    birthday: '2004-12-15',
    classYear: "Class of '26 (Junior)",
    major: 'Computer Science',
    provider: 'google',
  },
  {
    id: 'google-usr-03',
    name: 'Maya Lin',
    email: 'm.lin@campus.edu',
    role: 'student',
    title: 'Public Health Coalition President',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
    birthday: '2003-08-22',
    classYear: "Class of '25 (Senior)",
    major: 'Public Health',
    provider: 'google',
  },
  {
    id: 'google-usr-04',
    name: 'Jordan Bell',
    email: 'j.bell@campus.edu',
    role: 'student',
    title: 'Varsity Athletics & Student Life',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    birthday: '2005-04-10',
    classYear: "Class of '27 (Sophomore)",
    major: 'Kinesiology',
    provider: 'google',
  },
];

export const GoogleAccountPickerModal: React.FC<GoogleAccountPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
}) => {
  const [accounts, setAccounts] = useState<AuthUser[]>(() => {
    try {
      const saved = localStorage.getItem('google_campus_saved_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // fallback
    }
    return DEFAULT_ACCOUNTS;
  });

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newClassYear, setNewClassYear] = useState("Class of '26");
  const [newMajor, setNewMajor] = useState('Computer Science');
  const [newBirthday, setNewBirthday] = useState('');
  const [newPhoto, setNewPhoto] = useState(
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80'
  );
  const [formError, setFormError] = useState('');

  // Persist custom accounts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('google_campus_saved_accounts', JSON.stringify(accounts));
    } catch (e) {
      console.warn('Could not save accounts to localStorage', e);
    }
  }, [accounts]);

  if (!isOpen) return null;

  const handleSetTodayBirthday = () => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setNewBirthday(`2004-${m}-${day}`);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      setFormError('Please enter both name and email.');
      return;
    }

    if (!newEmail.includes('@')) {
      setFormError('Please enter a valid Google or university email address.');
      return;
    }

    const created: AuthUser = {
      id: `google-usr-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: 'student',
      title: `${newMajor} · ${newClassYear}`,
      photo: newPhoto,
      birthday: newBirthday || undefined,
      classYear: newClassYear,
      major: newMajor,
      provider: 'google',
    };

    setAccounts((prev) => [created, ...prev]);
    setIsAddingNew(false);
    onSelectAccount(created);
    onClose();
  };

  const handleRemoveAccount = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAccounts((prev) => {
      const next = prev.filter((acc) => acc.id !== id);
      return next.length > 0 ? next : DEFAULT_ACCOUNTS;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs select-none">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92dvh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Google Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Choose an account
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              to continue to <strong className="text-purple-900">Campus Feedback Assistant</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Account List & Custom Account Creation Form */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2 select-text">
          {!isAddingNew ? (
            <>
              <div className="space-y-1.5">
                {accounts.map((acc) => {
                  const isToday = isBirthdayToday(acc.birthday);
                  return (
                    <div
                      key={acc.id}
                      onClick={() => {
                        onSelectAccount(acc);
                        onClose();
                      }}
                      className="group flex items-center justify-between p-3 rounded-2xl hover:bg-purple-50/80 border border-slate-100 hover:border-purple-200 transition-all cursor-pointer touch-manipulation shadow-2xs hover:shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          {acc.photo ? (
                            <img
                              src={acc.photo}
                              alt={acc.name}
                              className={`w-10 h-10 rounded-full object-cover border-2 ${
                                isToday ? 'border-amber-400 ring-2 ring-pink-400' : 'border-slate-200'
                              }`}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                              {acc.name.charAt(0)}
                            </div>
                          )}
                          {isToday && (
                            <span className="absolute -top-1 -right-1 text-xs">🎂</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-xs text-slate-900 group-hover:text-purple-950 truncate">
                              {acc.name}
                            </span>
                            {isToday && (
                              <span className="text-[10px] bg-gradient-to-r from-amber-400 to-pink-500 text-white font-extrabold px-1.5 py-0.2 rounded-full shadow-2xs">
                                🎂 Birthday Today!
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {acc.email}
                          </p>
                          <p className="text-[10px] text-purple-600 font-medium truncate">
                            {acc.title}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {accounts.length > 2 && (
                          <button
                            type="button"
                            onClick={(e) => handleRemoveAccount(acc.id, e)}
                            title="Remove account from list"
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Use Another Account Button */}
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="w-full mt-3 flex items-center gap-3 p-3 rounded-2xl border border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50/50 text-purple-900 transition-all cursor-pointer text-left touch-manipulation"
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-purple-950">
                    Use another Google account
                  </div>
                  <p className="text-[11px] text-purple-700/70">
                    Enter custom name, Google email, student class & birthday
                  </p>
                </div>
              </button>
            </>
          ) : (
            /* Add Custom Google Account Form */
            <form onSubmit={handleCreateAccount} className="space-y-3 pt-1">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-900">Add New Google Student Account</span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-purple-700 hover:underline font-medium cursor-pointer"
                >
                  ← Back to account list
                </button>
              </div>

              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                  Full Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Alex Johnson"
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Google Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                  Google Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g., alex.johnson@gmail.com or @campus.edu"
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Class & Major */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                    Class Year
                  </label>
                  <input
                    type="text"
                    value={newClassYear}
                    onChange={(e) => setNewClassYear(e.target.value)}
                    placeholder="Class of '26"
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                    Major / Department
                  </label>
                  <input
                    type="text"
                    value={newMajor}
                    onChange={(e) => setNewMajor(e.target.value)}
                    placeholder="Computer Science"
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              {/* Birthday with quick today button */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                    Birthday (for Birthday Highlights)
                  </label>
                  <button
                    type="button"
                    onClick={handleSetTodayBirthday}
                    className="text-[11px] font-bold text-pink-700 bg-pink-100 hover:bg-pink-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    🎂 Set to Today
                  </button>
                </div>
                <input
                  type="date"
                  value={newBirthday}
                  onChange={(e) => setNewBirthday(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Avatar Preset Options */}
              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                  Choose Profile Avatar
                </label>
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {[
                    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
                    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
                  ].map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewPhoto(url)}
                      className={`relative w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        newPhoto === url ? 'border-purple-600 ring-2 ring-purple-300 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-800 to-pink-600 hover:from-purple-900 hover:to-pink-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save & Sign In
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center flex items-center justify-between px-5">
          <span className="flex items-center gap-1 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            University Google Workspace SSO
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-purple-700 hover:underline font-semibold cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
