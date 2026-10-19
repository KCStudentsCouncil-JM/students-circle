import React from 'react';
import { NavFilter, FeedbackReport, RoleMode } from '../types';
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
  Users
} from 'lucide-react';

interface SidebarProps {
  currentFilter: NavFilter;
  onSelectFilter: (filter: NavFilter) => void;
  onOpenNewModal: () => void;
  reports: FeedbackReport[];
  role: RoleMode;
  eventsCount?: number;
  onClose?: () => void;
  onSignOut?: () => void;
  onExportBackup?: () => void;
  onOpenStudentList?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentFilter,
  onSelectFilter,
  onOpenNewModal,
  reports,
  role,
  eventsCount = 6,
  onClose,
  onSignOut,
  onExportBackup,
  onOpenStudentList,
}) => {
  // Compute counts
  const counts = {
    all: reports.length,
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
    { id: 'all', label: 'All Reports', icon: <Inbox className="w-4 h-4" />, count: counts.all },
    { id: 'events', label: 'Upcoming Events', icon: <Calendar className="w-4 h-4 text-pink-500" />, count: counts.events, highlight: true },
    { id: 'open', label: 'Open Issues', icon: <AlertCircle className="w-4 h-4 text-purple-600" />, count: counts.open },
    { id: 'in-review', label: 'In Review & Active', icon: <Clock className="w-4 h-4 text-pink-600" />, count: counts.inReview },
    { id: 'resolved', label: 'Resolved', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, count: counts.resolved },
    { id: 'drafts', label: 'Drafts', icon: <FileEdit className="w-4 h-4 text-slate-400" />, count: counts.drafts },
  ];

  const categoryItems: Array<{ id: NavFilter; label: string; icon: React.ReactNode; count: number }> = [
    { id: 'facilities', label: 'Facilities & Infrastructure', icon: <Wrench className="w-3.5 h-3.5" />, count: counts.facilities },
    { id: 'technology', label: 'Technology & IT', icon: <Wifi className="w-3.5 h-3.5" />, count: counts.technology },
    { id: 'academics', label: 'Academics & Schedule', icon: <GraduationCap className="w-3.5 h-3.5" />, count: counts.academics },
    { id: 'student-life', label: 'Student Life & Events', icon: <Sparkles className="w-3.5 h-3.5" />, count: counts.studentLife },
    { id: 'safety', label: 'Safety & Security', icon: <ShieldAlert className="w-3.5 h-3.5" />, count: counts.safety },
  ];

  const handleItemClick = (id: NavFilter) => {
    onSelectFilter(id);
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <>
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-purple-950/30 backdrop-blur-2xs z-40 lg:hidden"
        aria-hidden="true"
      />

      <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] lg:static lg:w-64 bg-[#fdfcff] border-r border-purple-100 flex flex-col justify-between select-none shrink-0 text-slate-700 shadow-2xl lg:shadow-none animate-in slide-in-from-left-4 duration-200">
        <div className="p-3 sm:p-4 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between lg:hidden pb-1 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-purple-950 uppercase tracking-wider">
                Filters & Categories
              </span>
              <span className="text-[10px] text-purple-500 font-mono">
                {role === 'admin' ? 'STAFF' : 'STUDENT'}
              </span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-purple-600 hover:text-purple-950 hover:bg-purple-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              onOpenNewModal();
              if (window.innerWidth < 1024 && onClose) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white font-medium text-xs py-2.5 px-3 rounded-lg shadow-xs transition-all border border-purple-800 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Feedback / Initiative</span>
          </button>

          <div>
            <div className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-950/60 flex items-center justify-between">
              <span>Mailbox & Status</span>
              <span className="text-[10px] text-purple-400 font-mono">
                {role === 'admin' ? 'TRIAGE' : 'TRACKING'}
              </span>
            </div>

            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const isActive = currentFilter === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-purple-800 text-white shadow-xs font-semibold'
                        : 'text-purple-950/80 hover:bg-purple-100/60 hover:text-purple-950'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span
                      className={`font-mono text-[11px] tabular-nums px-1.5 py-0.2 rounded ${
                        isActive
                          ? 'bg-purple-950/40 text-purple-100'
                          : 'text-purple-900/60 bg-purple-100/50'
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-950/60 flex items-center justify-between">
              <span>Categories</span>
              <Layers className="w-3.5 h-3.5 text-purple-300" />
            </div>

            <nav className="space-y-0.5">
              {categoryItems.map((item) => {
                const isActive = currentFilter === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-purple-800 text-white shadow-xs font-semibold'
                        : 'text-purple-950/80 hover:bg-purple-100/60 hover:text-purple-950'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={isActive ? 'text-white' : 'text-purple-600'}>{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span
                      className={`font-mono text-[11px] tabular-nums px-1.5 py-0.2 rounded ${
                        isActive
                          ? 'bg-purple-950/40 text-purple-100'
                          : 'text-purple-900/60 bg-purple-100/50'
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-3 border-t border-purple-100/80 bg-gradient-to-b from-purple-50/40 to-pink-50/40 space-y-2">
          
          {/* ADMIN: MANAGE STUDENTS BUTTON */}
          {role === 'admin' && onOpenStudentList && (
            <button
              onClick={() => {
                onOpenStudentList();
                if (window.innerWidth < 1024 && onClose) onClose();
              }}
              className="w-full py-2.5 px-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Users className="w-4 h-4" />
              <span>Manage Students</span>
            </button>
          )}

          <div className="flex items-center gap-1.5">
            {onExportBackup && (
              <button
                type="button"
                onClick={onExportBackup}
                className="flex-1 py-1.5 px-2 text-[11px] font-semibold text-purple-700 bg-white hover:bg-purple-100/80 rounded-lg border border-purple-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
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
                className="flex-1 py-1.5 px-2 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Sign Out</span>
              </button>
            )}
          </div>

          <div className="rounded-lg p-2.5 bg-white border border-pink-200/70 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-pink-700 font-semibold text-xs">
              <Ribbon className="w-3.5 h-3.5 text-pink-600 shrink-0" />
              <span>Breast Cancer Awareness</span>
            </div>
            <p className="text-[11px] text-purple-900/70 leading-relaxed">
              Honoring survivors, fighters, and advocates on our campus this October.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};