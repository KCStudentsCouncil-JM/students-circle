import React, { useState, useEffect } from 'react';
import { UserProfile, isBirthdayToday, InAppNotification } from '../types';
import { 
  Search, 
  Plus, 
  X, 
  Ribbon, 
  LogOut, 
  PanelLeft, 
  Sun, 
  Moon, 
  Bell, 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNewModal: () => void;
  totalCount: number;
  openCount: number;
  currentUser: UserProfile | null;
  onSignOut: () => void;
  onGoHome: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenProfile?: () => void;
  onOpenGoogleSignIn?: () => void;
  onOpenAnalytics?: () => void;
  notifications?: InAppNotification[];
  onNotificationClick?: (notif: InAppNotification) => void;
  onClearNotifications?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenNewModal,
  currentUser,
  onSignOut,
  onGoHome,
  isSidebarOpen,
  onToggleSidebar,
  onOpenProfile,
  onOpenGoogleSignIn,
  onOpenAnalytics,
  notifications = [],
  onNotificationClick,
  onClearNotifications,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showSeconds, setShowSeconds] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('campus_theme') === 'dark' || 
             (!('campus_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('campus_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('campus_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
    hour12: true,
  });

  const formattedDay = currentTime.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-14 sm:h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-purple-100/90 dark:border-slate-800 px-2.5 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-4 select-none shrink-0 z-30 transition-colors pt-safe">
      
      {/* Left Zone: Menu Toggle & Brand & Clock */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <button
          onClick={onToggleSidebar}
          className={`h-9 w-9 sm:h-9 sm:w-auto sm:px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border touch-manipulation ${
            isSidebarOpen 
              ? 'bg-purple-100/90 dark:bg-purple-900/50 border-purple-300 dark:border-purple-700 text-purple-950 dark:text-purple-200 font-bold' 
              : 'bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 border-purple-200 dark:border-slate-700 text-purple-700 dark:text-purple-300 shadow-2xs'
          }`}
          aria-label="Toggle menu bar"
        >
          <PanelLeft className="w-4 h-4 shrink-0" />
          <span className="hidden xl:inline text-xs font-semibold">Sidebar</span>
        </button>

        <button
          onClick={onGoHome}
          className="flex items-center gap-1.5 sm:gap-2 group p-1 -ml-0.5 rounded-xl hover:bg-purple-100/70 dark:hover:bg-slate-800 transition-all text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400 touch-manipulation shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-slate-700 p-0.5 flex items-center justify-center shadow-xs overflow-hidden group-hover:scale-105 transition-transform shrink-0">
            <img 
              src={`${import.meta.env.BASE_URL}KCBCALogo.png`} 
              alt="KC BCA Logo" 
              className="w-full h-full object-contain rounded-lg" 
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-purple-950 dark:text-purple-100 group-hover:text-purple-800 dark:group-hover:text-pink-400 transition-colors whitespace-nowrap">
                <span className="inline sm:hidden">KC Circle</span>
                <span className="hidden sm:inline">KC Students Circle</span>
              </span>
            </div>
          </div>
        </button>

        {/* Digital Clock - Hidden on very small screens to save space */}
        <div 
          onClick={() => setShowSeconds(prev => !prev)}
          title={`Campus Local Time: ${formattedDay} (Click to toggle seconds)`}
          className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-pink-50/60 dark:from-slate-800 dark:to-purple-950/40 border border-purple-200/90 dark:border-slate-700 text-purple-950 dark:text-purple-200 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl shadow-2xs hover:shadow-xs cursor-pointer transition-all select-none group shrink-0"
        >
          <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-pink-400 shrink-0 group-hover:rotate-12 transition-transform" />
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-[11px] sm:text-xs font-bold tracking-tight tabular-nums text-purple-950 dark:text-purple-100">
              {formattedTime}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Zone: Search Bar (Hidden on extra small screens, toggled by icon) */}
      <div className="flex-1 min-w-[65px] max-w-xs sm:max-w-sm md:max-w-md mx-1 sm:mx-2 hidden xs:block">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search reports..."
            className="w-full bg-purple-50/70 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-850 text-base sm:text-xs pl-7 sm:pl-8 pr-6 sm:pr-7 py-1.5 rounded-xl border border-purple-200/80 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-purple-950 dark:text-purple-100 placeholder:text-purple-400/80 transition-all"
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

      {/* Right Zone: Controls */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        
        {currentUser?.role === 'admin' && onOpenAnalytics && (
          <button
            onClick={onOpenAnalytics}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-100/80 dark:bg-slate-800 hover:bg-purple-200 dark:hover:bg-slate-700 text-purple-900 dark:text-purple-200 text-xs font-semibold border border-purple-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
            title="Open Admin Analytics Dashboard"
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
            <span className="hidden md:inline">Analytics</span>
          </button>
        )}

        <button
          onClick={toggleDarkMode}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-1.5 sm:p-2 rounded-xl text-purple-700 dark:text-purple-300 hover:bg-purple-100/70 dark:hover:bg-slate-800 border border-purple-200/70 dark:border-slate-700 transition-colors cursor-pointer"
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-purple-700" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(prev => !prev)}
            title="Notifications & Recent Updates"
            className="relative p-1.5 sm:p-2 rounded-xl text-purple-700 dark:text-purple-300 hover:bg-purple-100/70 dark:hover:bg-slate-800 border border-purple-200/70 dark:border-slate-700 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div 
              className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-purple-100 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-purple-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                  <span className="font-bold text-xs text-purple-950 dark:text-purple-200">
                    Notifications
                  </span>
                </div>
                {onClearNotifications && notifications.length > 0 && (
                  <button
                    onClick={onClearNotifications}
                    className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="py-2 space-y-2 max-h-64 overflow-y-auto momentum-scroll">
                {notifications.length === 0 ? (
                  <p className="text-center text-xs text-purple-500 dark:text-purple-400 py-4">
                    No new notifications right now.
                  </p>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (onNotificationClick) onNotificationClick(notif);
                        setIsNotifOpen(false);
                      }}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        notif.read
                          ? 'bg-purple-50/30 dark:bg-slate-800/40 border-purple-100 dark:border-slate-800 opacity-75'
                          : 'bg-purple-50 dark:bg-slate-800 border-purple-200 dark:border-slate-700 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-purple-950 dark:text-purple-100 mb-0.5">
                        <span className="truncate">{notif.title}</span>
                        <span className="text-[9px] font-mono font-normal text-purple-400">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onOpenNewModal}
          className="hidden sm:flex items-center justify-center gap-1 bg-gradient-to-r from-purple-700 via-purple-800 to-pink-600 hover:from-purple-800 hover:to-pink-700 text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs hover:shadow transition-all active:scale-[0.98] border border-purple-600/50 cursor-pointer touch-manipulation"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden md:inline">New Report</span>
        </button>

        {currentUser ? (
          <div className="flex items-center gap-1 sm:gap-1.5 pl-1 sm:pl-2 border-l border-purple-200 dark:border-slate-700">
            <button
              onClick={onOpenProfile}
              title={`View & Edit Profile (${currentUser.name})`}
              className={`flex items-center gap-1.5 p-1 rounded-xl transition-all cursor-pointer ${
                isBirthdayToday(currentUser.birthday)
                  ? 'bg-gradient-to-r from-amber-50 to-pink-50 dark:from-amber-950/40 dark:to-pink-950/40 border border-amber-300 dark:border-amber-600 shadow-2xs hover:border-amber-400'
                  : 'hover:bg-purple-50 dark:hover:bg-slate-800 border border-transparent'
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
                        : 'border-purple-200 dark:border-slate-700'
                    }`}
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-700 dark:text-purple-300 text-xs font-bold">
                    {(currentUser.name || 'U').charAt(0)}
                  </div>
                )}
              </div>

              <div className="hidden xl:flex flex-col text-left leading-tight pr-1">
                <span className="text-xs font-bold text-purple-950 dark:text-purple-100 truncate max-w-[100px]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 truncate max-w-[100px]">
                  {currentUser.classYear || (currentUser.role === 'admin' ? 'Staff' : 'Student')}
                </span>
              </div>
            </button>

            <button
              onClick={onSignOut}
              className="hidden sm:flex items-center justify-center gap-1 p-1.5 sm:px-2.5 sm:py-1 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:text-rose-900 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl transition-colors border border-rose-200 dark:border-rose-900 cursor-pointer touch-manipulation shrink-0 min-w-[34px] min-h-[34px]"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline text-[11px]">Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="pl-1 sm:pl-2 border-l border-purple-200 dark:border-slate-700">
            <button
              onClick={onOpenGoogleSignIn}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xs hover:shadow-xs transition-all active:scale-[0.99] cursor-pointer touch-manipulation shrink-0"
            >
              <span>Sign In</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};