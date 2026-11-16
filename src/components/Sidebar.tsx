import React from 'react';
import { NavFilter, FeedbackReport, RoleMode, UserProfile, CampusAnnouncement } from '../types';
import { NoticeBoard, NoticeAnnouncementPayload } from './NoticeBoard';
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
  Layers, 
  X,
  Calendar,
  Users,
  UserCheck,
  BarChart3,
  CheckSquare
} from 'lucide-react';

interface SidebarProps {
  currentFilter: NavFilter;
  onSelectFilter: (filter: NavFilter) => void;
  onOpenNewModal: () => void;
  reports: FeedbackReport[];
  role: RoleMode;
  currentUser?: UserProfile | null;
  eventsCount?: number;
  announcements?: CampusAnnouncement[];
  onAddAnnouncement?: (payload: NoticeAnnouncementPayload) => void;
  onUpdateAnnouncement?: (id: string, updates: NoticeAnnouncementPayload) => void;
  onDeleteAnnouncement?: (id: string) => void;
  onVoteAnnouncementPoll?: (announcementId: string, optionId: string) => void;
  onToggleAnnouncementPin?: (announcementId: string) => void;
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
  announcements = [],
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  onVoteAnnouncementPoll,
  onToggleAnnouncementPin,
  onClose,
  onSignOut,
  onExportBackup,
  onOpenStudentList,
  onOpenAnalytics,
}) => {

  const isReportVisible = (r: FeedbackReport) => {
    if (r.status === 'draft') return false;
    if (r.status === 'pending-review') {
      const isAuthor = currentUser && (r.authorEmail === currentUser.email || r.author === currentUser.name);
      return role === 'admin' || Boolean(isAuthor);
    }
    return true;
  };

  const visibleReports = reports.filter(isReportVisible);

  // Compute counts
  const myActivityCount = visibleReports.filter((r) => {
    if (!currentUser?.email) return false;
    const isAuthor = r.authorEmail === currentUser.email || r.author === currentUser.name;
    const isEndorser = r.endorsers?.some(e => e.email === currentUser.email);
    return isAuthor || isEndorser;
  }).length;

  const myDraftsCount = reports.filter((r) => {
    if (r.status !== 'draft') return false;
    if (!currentUser) return false;
    return r.authorEmail === currentUser.email || r.author === currentUser.name;
  }).length;

  const pendingApprovalsCount = reports.filter(r => r.type === 'initiative' && r.status === 'pending-review').length;

  const counts = {
    all: visibleReports.length,
    myActivity: myActivityCount,
    pendingApprovals: pendingApprovalsCount,
    open: visibleReports.filter((r) => r.status === 'open').length,
    inReview: visibleReports.filter((r) => r.status === 'in-review' || r.status === 'in-progress').length,
    resolved: visibleReports.filter((r) => r.status === 'resolved').length,
    drafts: myDraftsCount,
    events: eventsCount,
    facilities: visibleReports.filter((r) => r.category === 'facilities').length,
    technology: visibleReports.filter((r) => r.category === 'technology').length,
    academics: visibleReports.filter((r) => r.category === 'academics').length,
    studentLife: visibleReports.filter((r) => r.category === 'student-life').length,
    safety: visibleReports.filter((r) => r.category === 'safety').length,
  };



  const navItems: Array<{ id: NavFilter; label: string; icon: React.ReactNode; count: number }> = [
    { id: 'all', label: 'All Reports', icon: <Inbox className="w-5 h-5 sm:w-4 sm:h-4" />, count: counts.all },
    { id: 'my-activity', label: 'My Activity & Supported', icon: <UserCheck className="w-5 h-5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />, count: counts.myActivity },
    ...(role === 'admin' ? [{ id: 'pending-approvals' as NavFilter, label: 'Pending Approvals', icon: <CheckSquare className="w-5 h-5 sm:w-4 sm:h-4 text-amber-500" />, count: counts.pendingApprovals }] : []),
    { id: 'events', label: 'School Events', icon: <Calendar className="w-5 h-5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />, count: counts.events },
    { id: 'open', label: 'Open Issues', icon: <AlertCircle className="w-5 h-5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />, count: counts.open },
    { id: 'in-review', label: 'In Review & Active', icon: <Clock className="w-5 h-5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400" />, count: counts.inReview },
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

          {/* Campus Announcements Widget (Live, Typed & Admin Editable) */}
          <NoticeBoard
            announcements={announcements}
            role={role}
            currentUserEmail={currentUser?.email}
            variant="sidebar"
            onAddAnnouncement={onAddAnnouncement}
            onUpdateAnnouncement={onUpdateAnnouncement}
            onDeleteAnnouncement={onDeleteAnnouncement}
            onVotePoll={onVoteAnnouncementPoll}
            onTogglePin={onToggleAnnouncementPin}
          />
        </div>

        {/* Bottom Actions & Controls (Fixed) */}
        <div className="p-3 border-t border-purple-100/80 dark:border-slate-800 bg-gradient-to-b from-purple-50/40 to-indigo-50/20 dark:from-slate-900 dark:to-slate-900 space-y-2 shrink-0">
          
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
                  className="w-full py-2.5 min-h-[44px] px-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
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

          {/* School Motto Banner */}
          <div className="rounded-xl p-2.5 bg-white dark:bg-slate-800 border border-purple-200/80 dark:border-slate-700 shadow-2xs space-y-1 hidden sm:block">
            <div className="flex items-center gap-1.5 text-purple-900 dark:text-purple-300 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-purple-700 dark:bg-purple-400" />
              <span>Kingston College</span>
            </div>
            <p className="text-[11px] text-purple-900/80 dark:text-slate-400 italic font-medium leading-relaxed">
              "Fortis Cadere Cedere Non Potest" — The brave may fall, but never yield.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};