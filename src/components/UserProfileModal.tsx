import React, { useState } from 'react';
import { UserProfile, isBirthdayToday } from '../types';
import { isValidImageFile, compressImage } from '../utils';
import { 
  X, 
  Cake, 
  Sparkles, 
  GraduationCap, 
  Check, 
  Camera, 
  ShieldCheck, 
  Mail, 
  User as UserIcon,
  BookOpen,
  Download,
  Upload,
  LogOut
} from 'lucide-react';

interface UserProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: UserProfile) => void;
  onSignOut?: () => void;
  onExportBackup?: () => void;
  onImportBackup?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PRESET_AVATARS = [
  { label: 'Student 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' },
  { label: 'Student 2', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80' },
  { label: 'Student 3', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80' },
  { label: 'Student 4', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80' },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
  onSignOut,
  onExportBackup,
  onImportBackup,
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [classYear, setClassYear] = useState(user.classYear || "2026");
  const [major, setMajor] = useState(user.major || 'Form 5 Science');
  const [birthday, setBirthday] = useState(user.birthday || '');
  const [photo, setPhoto] = useState(user.photo || PRESET_AVATARS[0].url);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isCompressingAvatar, setIsCompressingAvatar] = useState(false);

  if (!isOpen) return null;

  const getTodayDateStr = () => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `2004-${mm}-${dd}`;
  };

  const handleSetTodayBirthday = () => {
    setBirthday(getTodayDateStr());
  };

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = isValidImageFile(file);
    if (!validation.valid) {
      setAvatarError(validation.error || 'Invalid image format. Only JPG, PNG, and WebP are allowed.');
      return;
    }

    try {
      setIsCompressingAvatar(true);
      const compressed = await compressImage(file, 256, 0.75);
      setPhoto(compressed);
    } catch (err) {
      setAvatarError('Failed to process image file.');
    } finally {
      setIsCompressingAvatar(false);
      e.target.value = '';
    }
  };

  const isToday = isBirthdayToday(birthday);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...user,
      name: name.trim(),
      email: email.trim(),
      classYear: classYear.trim(),
      major: major.trim(),
      birthday: birthday.trim(),
      photo,
      title: `${major.trim()} · ${classYear.trim()}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-purple-950/60 backdrop-blur-sm select-none">
      <div 
        className="bg-white dark:bg-slate-900 sm:rounded-3xl rounded-t-3xl max-w-lg w-full max-h-[92dvh] shadow-2xl border-t sm:border border-purple-200 dark:border-slate-800 flex flex-col text-slate-800 dark:text-slate-100 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-purple-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-50 via-pink-50/40 to-white dark:from-slate-850 dark:via-purple-950/20 dark:to-slate-900 shrink-0 rounded-t-3xl sm:rounded-t-3xl pt-safe">
          <div className="flex items-center gap-3">
            <div className={`relative w-12 h-12 rounded-2xl overflow-hidden border-2 shrink-0 ${
              isToday ? 'border-amber-400 ring-2 ring-pink-400 ring-offset-2 animate-pulse' : 'border-purple-200 dark:border-slate-700'
            }`}>
              {photo ? (
                <img src={photo} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-700 dark:text-purple-300">
                  <UserIcon className="w-6 h-6" />
                </div>
              )}
              {isToday && (
                <div className="absolute -top-1 -right-1 bg-amber-400 text-purple-950 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-xs">
                  🎂
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-purple-950 dark:text-purple-100">Student Profile</h3>
                {isToday && (
                  <span className="text-[10px] bg-gradient-to-r from-amber-400 to-pink-500 text-white font-extrabold px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Birthday Today!
                  </span>
                )}
              </div>
              <p className="text-xs text-purple-700/80 dark:text-purple-400">
                Student Identity & Birthday Settings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-purple-50 dark:bg-slate-800 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto momentum-scroll">
          {/* Birthday Highlight Banner if active */}
          {isToday && (
            <div className="p-3 bg-gradient-to-r from-pink-50 via-amber-50 to-purple-50 dark:from-pink-950/40 dark:via-amber-950/40 dark:to-purple-950/40 rounded-2xl border border-pink-200 dark:border-pink-800 text-xs text-purple-950 dark:text-purple-200 flex items-start gap-2.5">
              <span className="text-xl">🎂</span>
              <div>
                <p className="font-bold text-pink-800 dark:text-pink-300">Birthday Highlight Activated!</p>
                <p className="text-[11px] text-purple-800 dark:text-purple-300">
                  You are prominently highlighted with a celebratory halo and birthday cake badge across school reports, comments, and the top bar today!
                </p>
              </div>
            </div>
          )}

          {/* Avatar Selection & Upload */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Profile Photo & Avatar</span>
              </label>
              <label className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 hover:text-purple-950 dark:hover:text-purple-200 hover:underline cursor-pointer min-h-[44px] flex items-center">
                <span>{isCompressingAvatar ? 'Optimizing...' : 'Upload Custom Photo'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {avatarError && (
              <p className="text-[11px] text-rose-600 font-medium bg-rose-50 dark:bg-rose-950/40 p-1.5 rounded border border-rose-200 dark:border-rose-900">
                {avatarError}
              </p>
            )}

            <div className="grid grid-cols-4 gap-2">
              {PRESET_AVATARS.map((av, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setPhoto(av.url)}
                  className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                    photo === av.url
                      ? 'border-purple-600 ring-2 ring-purple-300 dark:ring-purple-700 scale-105 shadow-xs'
                      : 'border-purple-100 dark:border-slate-700 hover:border-purple-300 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                  {photo === av.url && (
                    <div className="absolute top-1 right-1 bg-purple-700 text-white rounded-full p-1 shadow-xs">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-1">
                <UserIcon className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-purple-200 dark:border-slate-700 rounded-xl px-3 py-3 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-950 dark:text-purple-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-1">
                <Mail className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span>Email</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-purple-200 dark:border-slate-700 rounded-xl px-3 py-3 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-950 dark:text-purple-100"
              />
            </div>
          </div>

          {/* Class Year & Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span>Year</span>
              </label>
              <input
                type="text"
                value={classYear}
                onChange={(e) => setClassYear(e.target.value)}
                placeholder="2026"
                className="w-full bg-white dark:bg-slate-800 border border-purple-200 dark:border-slate-700 rounded-xl px-3 py-3 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-950 dark:text-purple-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span>Form / Stream</span>
              </label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="Form 5 Science"
                className="w-full bg-white dark:bg-slate-800 border border-purple-200 dark:border-slate-700 rounded-xl px-3 py-3 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-950 dark:text-purple-100"
              />
            </div>
          </div>

          {/* Birthday with quick "Today" button */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-purple-50/60 dark:bg-slate-800/60 border border-purple-100 dark:border-slate-700">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-semibold text-purple-950 dark:text-purple-200 flex items-center gap-1">
                <Cake className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                <span>Birthday</span>
              </label>
              <button
                type="button"
                onClick={handleSetTodayBirthday}
                className="text-[11px] font-bold text-pink-700 dark:text-pink-300 bg-pink-100 dark:bg-pink-950/60 hover:bg-pink-200 px-3 py-1.5 rounded-lg border border-pink-300 dark:border-pink-800 transition-colors cursor-pointer flex items-center gap-1 min-h-[36px]"
              >
                <span>🎂 Set to Today!</span>
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="flex-1 bg-white dark:bg-slate-900 border border-purple-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-950 dark:text-purple-100 min-h-[44px]"
              />
              {birthday && (
                <button
                  type="button"
                  onClick={() => setBirthday('')}
                  className="text-[11px] text-purple-500 hover:text-purple-800 dark:text-purple-400 underline px-2 min-h-[44px]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Backup & Restore Section */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-pink-400" />
                <span>Data Vault & Backup</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              Prevent losing customized profiles and reports if browser cache is cleared:
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              {onExportBackup && (
                <button
                  type="button"
                  onClick={onExportBackup}
                  className="w-full flex justify-center items-center gap-1.5 px-3 py-2.5 min-h-[44px] bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-purple-600 dark:text-pink-400" />
                  <span>Download Backup</span>
                </button>
              )}

              {onImportBackup && (
                <label className="w-full flex justify-center items-center gap-1.5 px-3 py-2.5 min-h-[44px] bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-semibold transition-all cursor-pointer shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-purple-600 dark:text-pink-400" />
                  <span>Restore Backup</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={onImportBackup}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Footer Controls */}
          {onSignOut && (
            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-purple-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                className="w-full sm:w-auto text-xs font-semibold text-rose-700 dark:text-rose-400 hover:text-rose-900 flex items-center justify-center gap-1.5 px-3 py-3 min-h-[44px] rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-3 min-h-[44px] rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-100/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-5 py-3 min-h-[44px] rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-800 to-pink-600 hover:from-purple-900 hover:to-pink-700 text-white shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </div>
          )}
          {/* Bottom padding for iOS home bar inside the scroll view */}
          <div className="h-6 sm:hidden" />
        </form>
      </div>
    </div>
  );
};