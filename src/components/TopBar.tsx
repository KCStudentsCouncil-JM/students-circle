import { RoleMode, AuthUser, isBirthdayToday } from '../types';
import { 
  Search, 
  Plus, 
  ShieldCheck, 
  GraduationCap, 
  X, 
  Ribbon, 
  LogOut, 
  User, 
  PanelLeft, 
  Menu,
  Sparkles,
  Cake
} from 'lucide-react';

interface TopBarProps {
  role: RoleMode;
  onRoleChange: (newRole: RoleMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNewModal: () => void;
  totalCount: number;
  openCount: number;
  currentUser: AuthUser | null;
  onSignOut: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenProfile?: () => void;
  onOpenGoogleSignIn?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  role,
  onRoleChange,
  searchQuery,
  onSearchChange,
  onOpenNewModal,
  totalCount,
  openCount,
  currentUser,
  onSignOut,
  isSidebarOpen,
  onToggleSidebar,
  onOpenProfile,
  onOpenGoogleSignIn,
}) => {
  return (
    <header className="h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-purple-100/90 px-2.5 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-4 select-none shrink-0 z-30">
      {/* Left Zone: Menu Bar Toggle & Brand */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Menu bar toggle replacing the red, yellow, green circles */}
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Hide sidebar navigation" : "Show sidebar navigation"}
          className={`h-9 w-9 sm:h-9 sm:w-auto sm:px-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 border touch-manipulation ${
            isSidebarOpen 
              ? 'bg-purple-100/90 border-purple-300 text-purple-950 font-bold' 
              : 'bg-white hover:bg-purple-50 border-purple-200 text-purple-700 shadow-2xs'
          }`}
          aria-label="Toggle menu bar"
        >
          <PanelLeft className="w-4 h-4 shrink-0" />
          <span className="hidden xl:inline text-xs font-semibold">Sidebar</span>
        </button>

        {/* Clickable Brand Marker that redirects to Sign In Page */}
        <button
          onClick={onSignOut}
          title="Click to return to Sign In Portal"
          className="flex items-center gap-1.5 sm:gap-2 group p-1 -ml-0.5 rounded-xl hover:bg-purple-100/70 transition-all text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400 touch-manipulation shrink-0"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-purple-700 via-purple-800 to-pink-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <Ribbon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-200" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-purple-950 group-hover:text-purple-800 transition-colors whitespace-nowrap">
                <span className="inline sm:hidden">Feedback</span>
                <span className="hidden sm:inline">Feedback Assistant</span>
              </span>
              <span className="hidden md:inline-flex text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-pink-50 text-pink-700 border border-pink-200/60 items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                BCA
              </span>
            </div>
            <span className="hidden sm:inline text-[9px] text-purple-600 font-medium -mt-0.5 group-hover:underline">
              ← Sign In Portal
            </span>
          </div>
        </button>
      </div>

      {/* Middle Zone: Search Bar (Adaptive width for mobile & tablet) */}
      <div className="flex-1 min-w-[70px] max-w-xs sm:max-w-sm md:max-w-md mx-1 sm:mx-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search reports..."
            className="w-full bg-purple-50/70 hover:bg-purple-50 focus:bg-white text-xs pl-7 sm:pl-8 pr-6 sm:pr-7 py-1.5 rounded-lg border border-purple-200/80 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-purple-950 placeholder:text-purple-400/80 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-700 p-0.5 rounded cursor-pointer"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Right Zone: Role Switcher, New Feedback & Sign Out */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Role Switcher */}
        <div className="bg-purple-100/70 p-0.5 rounded-lg border border-purple-200/60 flex items-center gap-0.5">
          <button
            onClick={() => onRoleChange('student')}
            className={`flex items-center justify-center gap-1 p-1 sm:px-2 sm:py-1 text-xs font-medium rounded-md transition-all cursor-pointer touch-manipulation ${
              role === 'student'
                ? 'bg-white text-purple-900 shadow-2xs font-semibold'
                : 'text-purple-700/80 hover:text-purple-950'
            }`}
            title="Student Submitter Mode"
          >
            <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden md:inline">Student</span>
          </button>
          <button
            onClick={() => onRoleChange('admin')}
            className={`flex items-center justify-center gap-1 p-1 sm:px-2 sm:py-1 text-xs font-medium rounded-md transition-all cursor-pointer touch-manipulation ${
              role === 'admin'
                ? 'bg-purple-900 text-white shadow-2xs font-semibold'
                : 'text-purple-700/80 hover:text-purple-950'
            }`}
            title="Campus Administrator Mode"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${role === 'admin' ? 'text-pink-300' : 'text-purple-600'}`} />
            <span className="hidden md:inline">Admin</span>
          </button>
        </div>

        {/* Primary CTA */}
        <button
          onClick={onOpenNewModal}
          className="flex items-center justify-center gap-1 bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs hover:shadow transition-all active:scale-[0.98] border border-purple-600/50 cursor-pointer touch-manipulation"
          title="Submit New Feedback"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New</span>
        </button>

        {/* Current User Profile & Birthday Indicator OR Google Sign-In */}
        {currentUser ? (
          <div className="flex items-center gap-1 sm:gap-1.5 pl-1 sm:pl-2 border-l border-purple-200">
            <button
              onClick={onOpenProfile}
              title={`View & Edit Profile (${currentUser.name})`}
              className={`flex items-center gap-1.5 p-1 rounded-xl transition-all cursor-pointer ${
                isBirthdayToday(currentUser.birthday)
                  ? 'bg-gradient-to-r from-amber-50 to-pink-50 border border-amber-300 shadow-2xs hover:border-amber-400'
                  : 'hover:bg-purple-50 border border-transparent'
              }`}
            >
              <div className="relative shrink-0">
                {currentUser.photo ? (
                  <img
                    src={currentUser.photo}
                    alt={currentUser.name}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border ${
                      isBirthdayToday(currentUser.birthday)
                        ? 'border-amber-400 ring-2 ring-pink-400 ring-offset-1 animate-pulse'
                        : 'border-purple-200'
                    }`}
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                {isBirthdayToday(currentUser.birthday) && (
                  <span className="absolute -top-1 -right-1 text-[10px] w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center shadow-xs">
                    🎂
                  </span>
                )}
              </div>

              <div className="hidden xl:flex flex-col text-left leading-tight pr-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-purple-950 truncate max-w-[100px]">
                    {currentUser.name}
                  </span>
                  {isBirthdayToday(currentUser.birthday) && (
                    <span className="text-[9px] bg-gradient-to-r from-amber-400 to-pink-500 text-white font-extrabold px-1.5 py-0.2 rounded-full shadow-2xs">
                      🎂 Birthday!
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-purple-600 truncate max-w-[100px]">
                  {currentUser.classYear || (currentUser.role === 'admin' ? 'Staff' : 'Student')}
                </span>
              </div>
            </button>

            {/* Fix #13: Portal Exit / Sign Out Button resilient to small screen squishing */}
            <button
              onClick={onSignOut}
              title={`Signed in as ${currentUser.name}. Return to Guest`}
              className="flex items-center justify-center gap-1 p-1.5 sm:px-2.5 sm:py-1 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 cursor-pointer touch-manipulation shrink-0 min-w-[34px] min-h-[34px]"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline text-[11px]">Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="pl-1 sm:pl-2 border-l border-purple-200">
            <button
              onClick={onOpenGoogleSignIn}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-2xs hover:shadow-xs transition-all active:scale-[0.99] cursor-pointer touch-manipulation shrink-0"
              title="Sign in with your Google Account"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span className="hidden sm:inline">Sign In with Google</span>
              <span className="sm:hidden">Sign In</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
