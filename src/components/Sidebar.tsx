import React, { useState } from 'react';
import { NavFilter, FeedbackReport, RoleMode, UserProfile } from '../types';
import { 
  Inbox, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  FileEdit, 
  Plus, 
  Wrench, 
  Wifi, 
  GraduationCap, 
  Sparkles, 
  ShieldAlert, 
  Ribbon, 
  Layers, 
  X,
  Calendar,
  Users,
  UserCheck,
  BarChart3,
  Vote,
} from 'lucide-react';

interface SidebarProps {
  currentFilter: NavFilter;
  onSelectFilter: (filter: NavFilter) => void;
  onOpenNewModal: () => void;
  reports: FeedbackReport[];
  role: RoleMode;
  currentUser?: UserProfile | null;
  eventsCount?: number;
  onClose?: () => void;
  onSignOut?: () => void;
  onExportBackup?: () => void;
  onOpenStudentList?: () => void;
  onOpenAnalytics?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentFilter,
  onSelectFilter,
  onOpenNewModal,
  reports,
  role,
  currentUser,
  eventsCount = 6,
  onClose,
  onSignOut,
  onExportBackup,
  onOpenStudentList,
  onOpenAnalytics,
}) => {
  // Quick Poll state (School Pulse)
  const [pollVoted, setPollVoted] = useState<'yes' | 'no' | null>(() => {
    return (localStorage.getItem('school_poll_voted') as 'yes' | 'no') || null;
  });
  const [yesVotes, setYesVotes] = useState(148);
  const [noVotes, setNoVotes] = useState(24);

  const handleVote = (choice: 'yes' | 'no') => {
    if (pollVoted) return;
    if (choice === 'yes') setYesVotes(v => v + 1);
    else setNoVotes(v => v + 1);
    setPollVoted(choice);
    localStorage.setItem('school_poll_voted', choice);
  };

  const totalPollVotes = yesVotes + noVotes;
  const yesPct = Math.round((yesVotes / totalPollVotes) * 100);

  // Compute counts
  const myActivityCount = reports.filter((r) => {
    if (!currentUser?.email) return false;
    const isAuthor = r.authorEmail === currentUser.email || r.author === currentUser.name;
    const isEndorser = r.endorsers?.some(e => e.email === currentUser.email);
    return isAuthor || isEndorser;
  }).length;

  const counts = {
    all: reports.length,
    myActivity: myActivityCount,
    open: reports.filter((r) => r.status === 'open').length,
    inReview: reports.filter((r) => r.status === 'in-review' || r.status === 'in-progress').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
    drafts: reports.filter((r) => r.status === 'draft').length,
    events: eventsCount,
    facilities: reports.filter((r) => r.category === 'facilities').length,
    technology: reports.filter((r) => r.category === 'technology').length,
    academics: reports.filter((r) => r.category === 'academics').length,
    studentLife: reports.filter((r) => r.category === 'student-life').length,
    safety: reports.filter((r) => r.category === 'safety').length,
  };

  const navItems: Array<{ id: NavFilter; label: string; icon: React.ReactNode; count: number; highlight?: boolean }> = [
    { id: 'all', label: 'All Reports', icon: <Inbox className="w-5 h-5 sm:w-4 sm:h-4" />, count: counts.all },
    { id: 'my-activity', label: 'My Activity & Supported', icon: <UserCheck className="w-5 h-5 sm:w-4 sm:h-4 text-purple-600 dark:text-pink-400" />, count: counts.myActivity },
    { id: 'events', label: 'School Events', icon: <Calendar className="w-5 h-5 sm:w-4 sm:h-4 text-pink-500" />, count: counts.events, highlight: true },
    { id: 'open', label: 'Open Issues', icon: <AlertCircle className="w-5 h-5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />, count: counts.open },
    { id: 'in-review', label: 'In Review & Active', icon: <Clock className="w-5 h-5 sm:w-4 sm:h-4 text-pink-600 dark:text-pink-400" />, count: counts.inReview },
    { id: 'resolved', label: 'Resolved', icon: <CheckCircle2 className="w-5 h-5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />, count: counts.resolved },
    { id: 'drafts', label: 'Drafts', icon: <FileEdit className="w-5 h-5 sm:w-4 sm:h-4 text-slate-400" />, count: counts.drafts },
  ];

  const categoryItems: Array<{ id: NavFilter; label: string; icon: React.ReactNode; count: number }> = [
    { id: 'facilities', label: 'Maintenance & Classrooms', icon: <Wrench className="w-5 h-5 sm:w-3.5 sm:h-3.5" />, count: counts.facilities },
    { id: 'technology', label: 'IT Lab & Computers', icon: <Wifi className="w-5 h-5 sm:w-3.5 sm:h-3.5" />, count: counts.technology },
    { id: 'academics', label: 'Academic Affairs & Forms', icon: <GraduationCap className="w-5 h-5 sm:w-3.5 sm:h-3.5" />, count: counts.academics },
    { id: 'student-life', label: 'Clubs & Sports', icon: <Sparkles className="w-5 h-5 sm:w-3.5 sm:h-3.5" />, count: counts.studentLife },
    { id: 'safety', label: 'Security & Discipline', icon: <ShieldAlert className="w-5 h-5 sm:w-3.5 sm:h-3.5" />, count: counts.safety },
  ];

  const handleItemClick = (id: NavFilter) => {
    onSelectFilter(id);
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-purple-950/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        aria-hidden="true"
      />

      <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] lg:static lg:w-64 bg-[#fdfcff] dark:bg-slate-900 border-r border-purple-100 dark:border-slate-800 flex flex-col justify-between select-none shrink-0 text-slate-700 dark:text-slate-300 shadow-2xl lg:shadow-none animate-in slide-in-from-left-4 duration-200 transition-colors pt-safe pb-safe">
        
        {/* Scrollable Content Area */}
        <div className="p-3 sm:p-4 space-y-4 overflow-y-auto momentum-scroll flex-1">
          
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-purple-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-purple-950 dark:text-purple-200 uppercase tracking-wider">
                Filters & Categories
              </span>
              <span className="text-[10px] text-purple-500 font-mono bg-purple-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                {role === 'admin' ? 'STAFF' : 'STUDENT'}
              </span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-slate-800 cursor-pointer min-w-[44px]"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              onOpenNewModal();
              if (window.innerWidth < 1024 && onClose) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white font-medium text-sm py-3 px-3 rounded-xl shadow-xs transition-all border border-purple-800 cursor-pointer min-h-[44px]"
          >
            <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
            <span>New Report / School Idea</span>
          </button>

          {/* Navigation Items */}
          <div>
            <div className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-950/60 dark:text-purple-400 flex items-center justify-between">
              <span>Mailbox & Status</span>
              <span className="text-[10px] text-purple-400 font-mono">
                {role === 'admin' ? 'TRIAGE' : 'TRACKING'}
              </span>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentFilter === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-sm sm:text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-purple-800 dark:bg-purple-700 text-white shadow-xs font-semibold'
                        : 'text-purple-950/80 dark:text-slate-300 hover:bg-purple-100/60 dark:hover:bg-slate-800 hover:text-purple-950 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span
                      className={`font-mono text-[11px] tabular-nums px-2 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-purple-950/40 text-purple-100'
                          : 'text-purple-900/60 dark:text-purple-400 bg-purple-100/50 dark:bg-slate-800'
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Categories */}
          <div>
            <div className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-950/60 dark:text-purple-400 flex items-center justify-between">
              <span>Categories</span>
              <Layers className="w-4 h-4 text-purple-300 dark:text-purple-500" />
            </div>

            <nav className="space-y-1">
              {categoryItems.map((item) => {
                const isActive = currentFilter === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-sm sm:text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-purple-800 dark:bg-purple-700 text-white shadow-xs font-semibold'
                        : 'text-purple-950/80 dark:text-slate-300 hover:bg-purple-100/60 dark:hover:bg-slate-800 hover:text-purple-950 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className={isActive ? 'text-white' : 'text-purple-600 dark:text-purple-400'}>{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span
                      className={`font-mono text-[11px] tabular-nums px-2 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-purple-950/40 text-purple-100'
                          : 'text-purple-900/60 dark:text-purple-400 bg-purple-100/50 dark:bg-slate-800'
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* School Pulse Quick Poll Widget */}
          <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50/50 dark:from-slate-850 dark:to-purple-950/30 rounded-2xl border border-purple-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-950 dark:text-purple-300 flex items-center gap-1">
                <Vote className="w-3.5 h-3.5 text-pink-600" />
                <span>School Pulse Poll</span>
              </span>
              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400">{totalPollVotes} votes</span>
            </div>

            <p className="text-xs font-semibold text-purple-950 dark:text-purple-200 leading-snug">
              Should the library extend opening hours during exam week?
            </p>

            {pollVoted ? (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-purple-900 dark:text-purple-200">
                  <span>Yes, definitely</span>
                  <span>{yesPct}% ({yesVotes})</span>
                </div>
                <div className="w-full h-2.5 bg-purple-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 rounded-full transition-all" style={{ width: `${yesPct}%` }} />
                </div>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">
                  ✓ Your vote has been recorded!
                </span>
              </div>
            ) : (
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleVote('yes')}
                  className="flex-1 py-2 min-h-[36px] bg-white dark:bg-slate-800 hover:bg-purple-100 border border-purple-200 dark:border-slate-700 rounded-xl text-xs font-bold text-purple-950 dark:text-purple-200 cursor-pointer shadow-2xs transition-colors"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleVote('no')}
                  className="flex-1 py-2 min-h-[36px] bg-white dark:bg-slate-800 hover:bg-purple-100 border border-purple-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer shadow-2xs transition-colors"
                >
                  No
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions & Controls (Fixed) */}
        <div className="p-3 border-t border-purple-100/80 dark:border-slate-800 bg-gradient-to-b from-purple-50/40 to-pink-50/40 dark:from-slate-900 dark:to-slate-900 space-y-2 shrink-0">
          
          {/* Admin Management Buttons */}
          {role === 'admin' && (
            <div className="space-y-1.5">
              {onOpenAnalytics && (
                <button
                  onClick={() => {
                    onOpenAnalytics();
                    if (window.innerWidth < 1024 && onClose) onClose();
                  }}
                  className="w-full py-2.5 min-h-[44px] px-2 text-xs font-bold text-purple-950 dark:text-purple-200 bg-purple-100 dark:bg-slate-800 hover:bg-purple-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-purple-200 dark:border-slate-700 shadow-2xs cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                  <span>School Analytics</span>
                </button>
              )}

              {onOpenStudentList && (
                <button
                  onClick={() => {
                    onOpenStudentList();
                    if (window.innerWidth < 1024 && onClose) onClose();
                  }}
                  className="w-full py-2.5 min-h-[44px] px-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Manage Student Roster</span>
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            {onExportBackup && (
              <button
                type="button"
                onClick={onExportBackup}
                className="flex-1 py-2 min-h-[44px] px-2 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-800 hover:bg-purple-100/80 dark:hover:bg-slate-700 rounded-xl border border-purple-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Backup Data</span>
              </button>
            )}

            {onSignOut && (
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  onSignOut();
                }}
                className="flex-1 py-2 min-h-[44px] px-2 text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl border border-rose-200 dark:border-rose-900 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Sign Out</span>
              </button>
            )}
          </div>

          <div className="rounded-xl p-2.5 bg-white dark:bg-slate-800 border border-pink-200/70 dark:border-slate-700 shadow-2xs space-y-1 hidden sm:block">
            <div className="flex items-center gap-1.5 text-pink-700 dark:text-pink-400 font-semibold text-xs">
              <Ribbon className="w-3.5 h-3.5 text-pink-600 shrink-0" />
              <span>Breast Cancer Awareness</span>
            </div>
            <p className="text-[11px] text-purple-900/70 dark:text-slate-400 leading-relaxed">
              Honoring survivors, fighters, and advocates throughout October.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};