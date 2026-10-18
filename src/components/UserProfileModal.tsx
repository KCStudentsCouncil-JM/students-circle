import React, { useState } from 'react';
import { AuthUser, isBirthdayToday } from '../types';
import { isValidImageFile, compressImage } from '../utils';
import { 
  X, 
  Cake, 
  Sparkles, 
  GraduationCap, 
  Check, 
  Calendar, 
  Camera, 
  ShieldCheck, 
  Mail, 
  User as UserIcon,
  BookOpen,
  Download,
  Upload,
  LogOut,
  AlertCircle
} from 'lucide-react';

interface UserProfileModalProps {
  user: AuthUser;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: AuthUser) => void;
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
  const [classYear, setClassYear] = useState(user.classYear || "Class of '26");
  const [major, setMajor] = useState(user.major || 'Computer Science');
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

  // Custom photo upload with Fix #11 type validation and Fix #3 compression
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/50 backdrop-blur-xs select-none">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full max-h-[92dvh] overflow-y-auto shadow-2xl border border-purple-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-pink-50/40 to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 ${
              isToday ? 'border-amber-400 ring-2 ring-pink-400 ring-offset-2 animate-pulse' : 'border-purple-200'
            }`}>
              {photo ? (
                <img src={photo} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-purple-100 flex items-center justify-center text-purple-700">
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
                <h3 className="font-bold text-base text-purple-950">Student Profile</h3>
                {isToday && (
                  <span className="text-[10px] bg-gradient-to-r from-amber-400 to-pink-500 text-white font-extrabold px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Birthday Today!
                  </span>
                )}
              </div>
              <p className="text-xs text-purple-700/80">
                Google Student Identity & Birthday Highlight Settings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-400 hover:text-purple-700 hover:bg-purple-100/70 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Birthday Highlight Banner if active */}
          {isToday && (
            <div className="p-3 bg-gradient-to-r from-pink-50 via-amber-50 to-purple-50 rounded-xl border border-pink-200 text-xs text-purple-950 flex items-start gap-2.5">
              <span className="text-xl">🎂</span>
              <div>
                <p className="font-bold text-pink-800">Birthday Highlight Activated!</p>
                <p className="text-[11px] text-purple-800">
                  You will be prominently highlighted with a celebratory halo and birthday cake badge across campus reports, comments, and the top bar today!
                </p>
              </div>
            </div>
          )}

          {/* Avatar Selection & Upload */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-purple-900 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-purple-600" />
                <span>Profile Photo & Avatar</span>
              </label>
              <label className="text-[11px] font-semibold text-purple-700 hover:text-purple-950 hover:underline cursor-pointer">
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
              <p className="text-[11px] text-rose-600 font-medium bg-rose-50 p-1.5 rounded border border-rose-200">
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
                      ? 'border-purple-600 ring-2 ring-purple-300 scale-105 shadow-xs'
                      : 'border-purple-100 hover:border-purple-300 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                  {photo === av.url && (
                    <div className="absolute top-1 right-1 bg-purple-700 text-white rounded-full p-0.5 shadow-xs">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Google Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-purple-900 flex items-center gap-1">
                <UserIcon className="w-3 h-3 text-purple-600" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-purple-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-950"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-purple-900 flex items-center gap-1">
                <Mail className="w-3 h-3 text-purple-600" />
                <span>Google Email</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-purple-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-950"
              />
            </div>
          </div>

          {/* Class Year & Major */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-purple-900 flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-purple-600" />
                <span>Class Year</span>
              </label>
              <input
                type="text"
                value={classYear}
                onChange={(e) => setClassYear(e.target.value)}
                placeholder="Class of '26"
                className="w-full bg-white border border-purple-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-950"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-purple-900 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-purple-600" />
                <span>Major / Program</span>
              </label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="Computer Science"
                className="w-full bg-white border border-purple-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-950"
              />
            </div>
          </div>

          {/* Birthday with quick "Today" button */}
          <div className="space-y-1.5 p-3 rounded-xl bg-purple-50/60 border border-purple-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-purple-950 flex items-center gap-1">
                <Cake className="w-3.5 h-3.5 text-pink-600" />
                <span>Birthday (Day of Celebration)</span>
              </label>
              <button
                type="button"
                onClick={handleSetTodayBirthday}
                className="text-[11px] font-bold text-pink-700 bg-pink-100 hover:bg-pink-200 px-2.5 py-1 rounded-md border border-pink-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>🎂 Set to Today!</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="flex-1 bg-white border border-purple-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-950"
              />
              {birthday && (
                <button
                  type="button"
                  onClick={() => setBirthday('')}
                  className="text-[10px] text-purple-500 hover:text-purple-800 underline px-1 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <p className="text-[10px] text-purple-700/80">
              When your birthday matches the current date, your profile is automatically highlighted with a celebratory halo and birthday cake badge across campus reports!
            </p>
          </div>

          {/* Fix #10: Backup & Restore Section so data is never lost if browser cache is cleared */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Campus Data Vault & Backup</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Resilience v1</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Prevent losing customized profiles and tickets if browser cache or storage is cleared:
            </p>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {onExportBackup && (
                <button
                  type="button"
                  onClick={onExportBackup}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                >
                  <Download className="w-3 h-3 text-purple-600" />
                  <span>Download Backup (.json)</span>
                </button>
              )}

              {onImportBackup && (
                <label className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 text-xs font-semibold transition-all cursor-pointer shadow-2xs">
                  <Upload className="w-3 h-3 text-purple-600" />
                  <span>Restore from Backup</span>
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

          {/* Fix #13: Sign Out Shortcut from Profile Modal */}
          {onSignOut && (
            <div className="pt-1 flex items-center justify-between border-t border-purple-100">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                className="text-xs font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Campus Hub</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-purple-700 hover:bg-purple-100/60 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-800 to-pink-600 hover:from-purple-900 hover:to-pink-700 text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
