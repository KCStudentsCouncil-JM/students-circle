import React from 'react';
import { FeedbackReport, CampusEvent, UserProfile, FeedbackStatus, Category } from '../types';
import { 
  X, 
  BarChart3, 
  PieChart, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  TrendingUp, 
  Users, 
  ShieldCheck,
  Calendar,
  Layers,
  Wrench,
  Wifi,
  GraduationCap,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface AdminAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: FeedbackReport[];
  events: CampusEvent[];
  allUsers: UserProfile[];
}

export const AdminAnalyticsModal: React.FC<AdminAnalyticsModalProps> = ({
  isOpen,
  onClose,
  reports,
  events,
  allUsers,
}) => {
  if (!isOpen) return null;

  const totalReports = reports.length;
  const openReports = reports.filter(r => r.status === 'open').length;
  const inReviewReports = reports.filter(r => r.status === 'in-review' || r.status === 'in-progress').length;
  const resolvedReports = reports.filter(r => r.status === 'resolved').length;
  const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

  const totalEndorsements = reports.reduce((acc, r) => acc + (r.upvotes || 0), 0);
  const totalRsvps = events.reduce((acc, e) => acc + (e.rsvps || 0), 0);

  // Categories count
  const categoryCounts: Record<Category, number> = {
    facilities: reports.filter(r => r.category === 'facilities').length,
    technology: reports.filter(r => r.category === 'technology').length,
    academics: reports.filter(r => r.category === 'academics').length,
    'student-life': reports.filter(r => r.category === 'student-life').length,
    safety: reports.filter(r => r.category === 'safety').length,
  };

  const categoryIcons: Record<Category, React.ReactNode> = {
    facilities: <Wrench className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />,
    technology: <Wifi className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
    academics: <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
    'student-life': <Sparkles className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />,
    safety: <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />,
  };

  const handleExportCSV = () => {
    const headers = ['Report ID', 'Type', 'Title', 'Category', 'Urgency', 'Status', 'Author', 'Created At', 'Upvotes', 'Location'];
    const rows = reports.map(r => [
      `"${r.id}"`,
      `"${r.type}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.category}"`,
      `"${r.urgency}"`,
      `"${r.status}"`,
      `"${(r.authorRealName || r.author).replace(/"/g, '""')}"`,
      `"${r.createdAt}"`,
      r.upvotes,
      `"${r.location.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Campus_Feedback_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs select-none">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-purple-200 dark:border-slate-800 w-full max-w-4xl max-h-[92dvh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-purple-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-50/80 via-white to-pink-50/40 dark:from-slate-900 dark:to-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-800 dark:bg-purple-700 text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-5 h-5 text-pink-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-purple-950 dark:text-purple-100">
                  Campus Triage & Operations Analytics
                </h2>
                <span className="text-[10px] font-mono bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">
                  ADMIN AUDIT
                </span>
              </div>
              <p className="text-xs text-purple-700/80 dark:text-purple-300/70">
                Live performance dashboard, ticket breakdown, and resolution health
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-slate-800 hover:bg-purple-200 text-purple-950 dark:text-purple-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Export complete data to CSV"
            >
              <Download className="w-3.5 h-3.5 text-purple-700 dark:text-purple-300" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
          {/* Top Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-purple-50/70 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-purple-100 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
                Total Feedback
              </span>
              <div className="text-2xl font-extrabold text-purple-950 dark:text-purple-100 tabular-nums">
                {totalReports}
              </div>
              <span className="text-[11px] text-purple-700/70 dark:text-purple-400/80 font-medium">
                {openReports} currently open
              </span>
            </div>

            <div className="bg-emerald-50/70 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-emerald-100 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                Resolution Rate
              </span>
              <div className="text-2xl font-extrabold text-emerald-950 dark:text-emerald-300 tabular-nums">
                {resolutionRate}%
              </div>
              <span className="text-[11px] text-emerald-700/70 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {resolvedReports} verified fixed
              </span>
            </div>

            <div className="bg-pink-50/70 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-pink-100 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold tracking-wider text-pink-600 dark:text-pink-400 block mb-1">
                Student Endorsements
              </span>
              <div className="text-2xl font-extrabold text-pink-950 dark:text-pink-200 tabular-nums">
                {totalEndorsements}
              </div>
              <span className="text-[11px] text-pink-700/70 dark:text-pink-300 font-medium">
                Community backing votes
              </span>
            </div>

            <div className="bg-indigo-50/70 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-indigo-100 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                Event Attendance
              </span>
              <div className="text-2xl font-extrabold text-indigo-950 dark:text-indigo-200 tabular-nums">
                {totalRsvps}
              </div>
              <span className="text-[11px] text-indigo-700/70 dark:text-indigo-300 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Across {events.length} campus events
              </span>
            </div>
          </div>

          {/* Breakdown Rows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Reports by Category Progress Bars */}
            <div className="bg-white dark:bg-slate-850 p-4 sm:p-5 rounded-2xl border border-purple-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-purple-100 dark:border-slate-800">
                <h3 className="font-bold text-xs uppercase tracking-wider text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Reports by Department Category</span>
                </h3>
                <span className="text-[11px] font-mono text-purple-500">{totalReports} total</span>
              </div>

              <div className="space-y-3 pt-1">
                {(Object.keys(categoryCounts) as Category[]).map(cat => {
                  const count = categoryCounts[cat];
                  const pct = totalReports > 0 ? Math.round((count / totalReports) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-1.5 capitalize">
                          {categoryIcons[cat]}
                          <span>{cat.replace('-', ' ')}</span>
                        </div>
                        <span className="font-mono text-purple-900 dark:text-purple-300 tabular-nums">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-purple-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Breakdown & SLA Monitoring */}
            <div className="bg-white dark:bg-slate-850 p-4 sm:p-5 rounded-2xl border border-purple-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-purple-100 dark:border-slate-800">
                <h3 className="font-bold text-xs uppercase tracking-wider text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  <span>Pipeline & Triage Health</span>
                </h3>
                <span className="text-[11px] font-mono text-purple-500">Live Status</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-slate-800 border border-purple-200/80 dark:border-slate-700">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-950 dark:text-purple-200">
                    <span>Open for Triage</span>
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                  </div>
                  <div className="text-xl font-extrabold mt-1 text-purple-950 dark:text-purple-100">{openReports}</div>
                  <p className="text-[10px] text-purple-600/80 dark:text-purple-400">Awaiting technician assignment</p>
                </div>

                <div className="p-3 rounded-xl bg-pink-50/70 dark:bg-slate-800 border border-pink-200/80 dark:border-slate-700">
                  <div className="flex items-center justify-between text-xs font-bold text-pink-950 dark:text-pink-200">
                    <span>Active in Review</span>
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                  </div>
                  <div className="text-xl font-extrabold mt-1 text-pink-950 dark:text-pink-100">{inReviewReports}</div>
                  <p className="text-[10px] text-pink-600/80 dark:text-pink-400">In work with maintenance</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-slate-800 border border-emerald-200/80 dark:border-slate-700">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-950 dark:text-emerald-200">
                    <span>Resolved</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-xl font-extrabold mt-1 text-emerald-950 dark:text-emerald-100">{resolvedReports}</div>
                  <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400">Fix verified by administration</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-200">
                    <span>Registered Students</span>
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div className="text-xl font-extrabold mt-1 text-slate-900 dark:text-slate-100">{allUsers.length}</div>
                  <p className="text-[10px] text-slate-500">Verified campus directory</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-900/5 dark:bg-slate-800/50 border border-purple-200/70 dark:border-slate-700 text-xs text-purple-950 dark:text-purple-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>SLA Compliance Target: 94.2% on-time resolution</span>
                </div>
                <p className="text-[11px] text-purple-700/80 dark:text-purple-400">
                  Priority urgent tickets maintain an authoritative 24-hour response clock to prevent student safety escalations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-850 border-t border-purple-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-purple-700/70 dark:text-purple-400 font-mono">
            Generated from authoritative university data records
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="sm:hidden px-3 py-1.5 rounded-xl bg-purple-100 text-purple-900 text-xs font-bold"
            >
              Export CSV
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Close Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
