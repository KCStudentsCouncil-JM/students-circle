import { UserProfile, isBirthdayToday } from '../types';
import { Search, Plus, X, Ribbon, LogOut, PanelLeft } from 'lucide-react';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNewModal: () => void;
  totalCount: number;
  openCount: number;
  currentUser: UserProfile | null;
  onSignOut: () => void;
  onGoHome: () => void; // <--- NEW PROP
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenProfile?: () => void;
  onOpenGoogleSignIn?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenNewModal,
  currentUser,
  onSignOut,
  onGoHome, // <--- NEW PROP
  isSidebarOpen,
  onToggleSidebar,
  onOpenProfile,
  onOpenGoogleSignIn,
}) => {
  return (
    <header className="h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-purple-100/90 px-2.5 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-4 select-none shrink-0 z-30">
      {/* Left Zone: Menu Bar Toggle & Brand */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Menu bar toggle */}
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

        {/* Brand Marker */}
        <button
          onClick={onGoHome} // <--- CHANGED TO GO HOME
          title="Go to All Reports"
          className="flex items-center gap-1.5 sm:gap-2 group p-1 -ml-0.5 rounded-xl hover:bg-purple-100/70 transition-all text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400 touch-manipulation shrink-0"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-purple-700 via-purple-800 to-pink-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <Ribbon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-200" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-purple-950 group-hover:text-purple-800 transition-colors whitespace-nowrap">
                <span className="inline sm:hidden">KC Circle</span>
                <span className="hidden sm:inline">KC Students Circle</span>
              </span>
              <span className="hidden md:inline-flex text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-pink-50 text-pink-700 border border-pink-200/60 items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                BCA
              </span>
            </div>
            <span className="hidden sm:inline text-[9px] text-purple-600 font-medium -mt-0.5 group-hover:underline">
              ← All Reports
            </span>
          </div>
        </button>
      </div>

      {/* Middle Zone: Search Bar */}
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

      {/* Right Zone: New Feedback & Sign Out */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          onClick={onOpenNewModal}
          className="flex items-center justify-center gap-1 bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs hover:shadow transition-all active:scale-[0.98] border border-purple-600/50 cursor-pointer touch-manipulation"
          title="Submit New Feedback"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New</span>
        </button>

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
              </div>

              <div className="hidden xl:flex flex-col text-left leading-tight pr-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-purple-950 truncate max-w-[100px]">
                    {currentUser.name}
                  </span>
                </div>
                <span className="text-[10px] text-purple-600 truncate max-w-[100px]">
                  {currentUser.classYear || (currentUser.role === 'admin' ? 'Staff' : 'Student')}
                </span>
              </div>
            </button>

            <button
              onClick={onSignOut}
              title={`Signed in as ${currentUser.name}. Return to Guest`}
              className="flex items-center justify-center gap-1 p-1.5 sm:px-2.5 sm:py-1 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 cursor-pointer touch-manipulation shrink-0 min-w-[34px] min-h-[34px]"
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
            >
              <span>Sign In</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};