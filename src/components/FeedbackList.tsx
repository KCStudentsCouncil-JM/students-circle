import React, { useState, useMemo } from 'react';
import { FeedbackReport, UrgencyLevel, FeedbackStatus, RoleMode, UserProfile, isBirthdayToday } from '../types';
import { calculateSlaInfo, formatReportId } from '../utils';
import { 
  ThumbsUp, 
  MapPin, 
  AlertTriangle, 
  Sparkles, 
  ChevronRight, 
  Calendar,
  CheckSquare,
  Square,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  ArrowUpDown,
  Wrench,
  Layers,
  Image as ImageIcon,
  Cake,
  PartyPopper,
  Pin,
  Flame,
  PlusCircle,
  Video
} from 'lucide-react';

interface FeedbackListProps {
  reports: FeedbackReport[];
  selectedId: string | null;
  onSelectReport: (id: string) => void;
  onToggleUpvote: (id: string, e: React.MouseEvent) => void;
  activeFilterTitle: string;
  onNavigateToEvents?: () => void;
  onOpenNewModal?: () => void;
  eventsCount?: number;
  role?: RoleMode;
  currentUser?: UserProfile | null;
  allUsers?: UserProfile[];
  onBulkUpdateStatus?: (ids: string[], newStatus: FeedbackStatus) => void;
}

export const FeedbackList: React.FC<FeedbackListProps> = ({
  reports,
  selectedId,
  onSelectReport,
  onToggleUpvote,
  activeFilterTitle,
  onNavigateToEvents,
  onOpenNewModal,
  eventsCount = 6,
  role = 'student',
  currentUser,
  allUsers = [],
  onBulkUpdateStatus,
}) => {
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | UrgencyLevel>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'issue' | 'initiative'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'upvotes' | 'urgency'>('newest');

  // Admin Bulk selection state & confirmation modal
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingBulkStatus, setPendingBulkStatus] = useState<FeedbackStatus | null>(null);

  // Calculate today's birthdays
  const todaysBirthdays = allUsers.filter(u => isBirthdayToday(u.birthday));

  // Top 3 Trending reports across campus
  const trendingReports = useMemo(() => {
    return [...reports]
      .filter(r => r.status !== 'resolved' && r.status !== 'draft')
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, 3);
  }, [reports]);

  // Filter by urgency and type
  const filtered = reports.filter((r) => {
    if (urgencyFilter !== 'all' && r.urgency !== urgencyFilter) return false;
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    return true;
  });

  // Sort with Pinned tickets taking absolute top priority
  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    if (sortBy === 'upvotes') {
      return b.upvotes - a.upvotes;
    }
    if (sortBy === 'urgency') {
      const weight = { high: 3, medium: 2, low: 1 };
      return weight[b.urgency] - weight[a.urgency];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Bulk selection helpers
  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === sorted.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sorted.map((r) => r.id)));
    }
  };

  const handleConfirmBulkUpdate = () => {
    if (pendingBulkStatus && onBulkUpdateStatus && selectedIds.size > 0) {
      onBulkUpdateStatus(Array.from(selectedIds), pendingBulkStatus);
      setSelectedIds(new Set());
      setPendingBulkStatus(null);
    }
  };

  const renderStatus = (status: FeedbackStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            Open
          </span>
        );
      case 'in-review':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/60 px-2.5 py-0.5 rounded-md border border-pink-200 dark:border-pink-800">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
            In Review
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Resolved
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
            Draft
          </span>
        );
    }
  };

  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 24) {
      return `${Math.max(1, diffHours)}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 w-full bg-[#faf8fc] dark:bg-slate-950 flex flex-col h-full select-none overflow-hidden relative text-slate-800 dark:text-slate-200">
      {/* Sub-header / Filter strip across main page */}
      <div className="p-4 sm:px-6 border-b border-purple-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-bold text-base text-purple-950 dark:text-purple-100 tracking-tight">
                {activeFilterTitle}
              </h1>
              <span className="text-xs font-mono tabular-nums text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded-full font-semibold">
                {sorted.length} {sorted.length === 1 ? 'item' : 'items'}
              </span>

              {role === 'admin' && sorted.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-semibold text-purple-700 dark:text-purple-300 hover:text-purple-950 bg-purple-50 dark:bg-slate-800 hover:bg-purple-100 px-2 py-0.5 rounded-lg border border-purple-200 dark:border-slate-700 transition-colors cursor-pointer ml-1"
                >
                  {selectedIds.size === sorted.length ? 'Deselect All' : `Select All (${sorted.length})`}
                </button>
              )}
            </div>
            <p className="text-xs text-purple-700/80 dark:text-purple-400 mt-0.5">
              Explore reported campus issues, suggest event initiatives, and endorse peer proposals.
            </p>
          </div>

          {/* Right Header Zone: Upcoming Events CTA & Sort Selector */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {onNavigateToEvents && (
              <button
                onClick={onNavigateToEvents}
                className="flex items-center gap-1.5 text-xs text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/50 hover:bg-pink-100 dark:hover:bg-pink-950 font-semibold px-2.5 py-1.5 rounded-xl border border-pink-200 dark:border-pink-800 shadow-2xs transition-all cursor-pointer touch-manipulation"
                title="View upcoming school events calendar"
              >
                <Calendar className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                <span>Upcoming Events</span>
                <span className="bg-pink-200/70 dark:bg-pink-900 text-pink-800 dark:text-pink-200 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                  {eventsCount}
                </span>
              </button>
            )}

            <div className="flex items-center gap-1.5 text-xs text-purple-900 dark:text-purple-200 bg-purple-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-purple-200 dark:border-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-xs font-semibold text-purple-950 dark:text-purple-100 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="upvotes">Most Endorsed</option>
                <option value="urgency">Highest Urgency</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pt-1 border-t border-purple-50 dark:border-slate-800">
          <div className="flex items-center gap-1 p-0.5 bg-purple-100/60 dark:bg-slate-800 rounded-xl text-xs overflow-x-auto no-scrollbar">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 touch-manipulation ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-purple-950 dark:text-white shadow-2xs'
                  : 'text-purple-700 dark:text-slate-300 hover:text-purple-950'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('issue')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 touch-manipulation ${
                typeFilter === 'issue'
                  ? 'bg-white dark:bg-slate-700 text-purple-950 dark:text-white shadow-2xs'
                  : 'text-purple-700 dark:text-slate-300 hover:text-purple-950'
              }`}
            >
              <Wrench className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span>Issues / Fixes</span>
            </button>
            <button
              onClick={() => setTypeFilter('initiative')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 touch-manipulation ${
                typeFilter === 'initiative'
                  ? 'bg-white dark:bg-slate-700 text-purple-950 dark:text-white shadow-2xs'
                  : 'text-purple-700 dark:text-slate-300 hover:text-purple-950'
              }`}
            >
              <Sparkles className="w-3 h-3 text-pink-600 dark:text-pink-400" />
              <span>Initiatives / Events</span>
            </button>
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-purple-100/60 dark:bg-slate-800 rounded-xl text-xs overflow-x-auto no-scrollbar">
            {(['all', 'high', 'medium', 'low'] as const).map((level) => {
              const isSelected = urgencyFilter === level;
              return (
                <button
                  key={level}
                  onClick={() => setUrgencyFilter(level)}
                  className={`px-2 sm:px-2.5 py-1.5 rounded-lg font-semibold capitalize transition-all cursor-pointer whitespace-nowrap shrink-0 touch-manipulation ${
                    isSelected
                      ? 'bg-white dark:bg-slate-700 text-purple-950 dark:text-white shadow-2xs'
                      : 'text-purple-700 dark:text-slate-300 hover:text-purple-950'
                  }`}
                >
                  {level === 'all' ? 'All Urgencies' : level === 'high' ? 'High Priority' : level}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Admin Sticky Bulk Action Toolbar */}
      {role === 'admin' && selectedIds.size > 0 && (
        <div className="bg-purple-900 dark:bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between gap-3 shadow-md z-20 shrink-0 border-b border-purple-800 dark:border-slate-800 animate-in slide-in-from-top-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full">
              {selectedIds.size} selected
            </span>
            <span className="text-xs text-purple-200">Bulk Update Status:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {(['open', 'in-review', 'in-progress', 'resolved'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setPendingBulkStatus(status)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-800 hover:bg-purple-700 border border-purple-600 capitalize cursor-pointer transition-colors"
              >
                {status.replace('-', ' ')}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="px-2 py-1 text-xs text-purple-300 hover:text-white underline cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Page Cards Grid */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 pb-28 sm:pb-12 space-y-5">
        
        {/* Birthday Celebration Section */}
        {todaysBirthdays.length > 0 && (
          <div className="animate-in fade-in slide-in-from-top-4">
            <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 rounded-3xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Cake className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
                    Happy Birthday! <PartyPopper className="w-5 h-5 text-amber-300" />
                  </h2>
                  <p className="text-xs text-pink-100 font-medium">Join us in celebrating our KC Students today!</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 relative z-10">
                {todaysBirthdays.map(student => (
                  <div key={student.email} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 shadow-sm cursor-default">
                    {student.photo ? (
                      <img src={student.photo} alt={student.name} className="w-7 h-7 rounded-full object-cover border-2 border-white/80" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white/40 flex items-center justify-center text-xs font-bold border-2 border-white/80">
                        {(student.name || 'U').charAt(0)}
                      </div>
                    )}
                    <span className="text-sm font-bold">{student.name}</span>
                    <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full font-mono">{student.classYear || 'Student'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. TRENDING SECTION: Top 3 Most Endorsed Campus Tickets */}
        {trendingReports.length > 0 && activeFilterTitle === 'All Reports' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-purple-950/70 dark:text-purple-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                <span>Trending Across Campus This Week</span>
              </h2>
              <span className="text-[10px] text-pink-600 dark:text-pink-400 font-mono font-semibold">Highest Student Endorsements</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {trendingReports.map((tReport) => (
                <div
                  key={`trending-${tReport.id}`}
                  onClick={() => onSelectReport(tReport.id)}
                  className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-50/70 to-purple-50/70 dark:from-slate-900 dark:to-purple-950/30 border border-pink-200/80 dark:border-slate-800 hover:border-pink-400 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="font-mono font-bold text-pink-700 dark:text-pink-300 bg-pink-100/70 dark:bg-pink-950 px-2 py-0.5 rounded">
                      #{formatReportId(tReport.id, tReport.type, tReport.status)}
                    </span>
                    <span className="flex items-center gap-1 font-mono font-bold text-pink-600 dark:text-pink-400">
                      <ThumbsUp className="w-3 h-3 fill-pink-500" /> {tReport.upvotes}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-purple-950 dark:text-purple-100 group-hover:text-pink-600 transition-colors line-clamp-1 mb-1">
                    {tReport.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                    {tReport.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {sorted.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-purple-950/60 dark:text-purple-400 flex flex-col items-center justify-center min-h-[250px] sm:min-h-[300px] bg-white dark:bg-slate-900 rounded-3xl border border-purple-100 dark:border-slate-800">
            <div className="w-14 h-14 rounded-3xl bg-purple-100 dark:bg-slate-800 flex items-center justify-center text-purple-500 mb-3">
              <SlidersHorizontal className="w-7 h-7 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-bold text-purple-950 dark:text-purple-200">No reports found in this view</h3>
            <p className="text-xs text-purple-700/70 dark:text-purple-400 mt-1 max-w-sm mb-4">
              There are no campus tickets matching your active filter or search keyword.
            </p>
            {onOpenNewModal && (
              <button
                onClick={onOpenNewModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-800 hover:bg-purple-900 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Be the first to file a report</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {sorted.map((item) => {
              const sla = calculateSlaInfo(item.createdAt, item.urgency, item.status);
              const isBulkSelected = selectedIds.has(item.id);
              
              const hasUserUpvoted = currentUser?.email 
                ? item.endorsers?.some((e) => e.email === currentUser.email) 
                : false;

              const authorUser = allUsers.find(u => u.name === item.author || (item.authorEmail && u.email === item.authorEmail));
              const isAuthorBirthday = authorUser ? isBirthdayToday(authorUser.birthday) : (item.author === 'Dylon Ocha');

              const formattedId = formatReportId(item.id, item.type, item.status);

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectReport(item.id)}
                  className={`bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border transition-all cursor-pointer flex flex-col justify-between group touch-manipulation relative ${
                    item.pinned
                      ? 'border-amber-300 dark:border-amber-700 ring-2 ring-amber-200/50 bg-amber-50/20 dark:bg-amber-950/20 shadow-sm'
                      : isBulkSelected
                      ? 'border-purple-600 ring-2 ring-purple-300 shadow-md bg-purple-50/20 dark:bg-slate-800'
                      : 'border-purple-100 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 shadow-2xs hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Top Meta Line */}
                    <div className="flex items-center justify-between text-xs text-purple-900/70 dark:text-purple-300 mb-2 flex-wrap gap-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        {role === 'admin' && (
                          <button
                            type="button"
                            onClick={(e) => handleToggleSelect(item.id, e)}
                            className="text-purple-700 dark:text-purple-400 hover:text-purple-950 p-0.5 cursor-pointer"
                            title="Select for bulk action"
                          >
                            {isBulkSelected ? (
                              <CheckSquare className="w-4 h-4 text-purple-700 fill-purple-100" />
                            ) : (
                              <Square className="w-4 h-4 text-purple-400" />
                            )}
                          </button>
                        )}
                        <span className="font-mono font-bold text-purple-900 dark:text-purple-200 bg-purple-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-purple-200/60 dark:border-slate-700">
                          {formattedId}
                        </span>

                        {item.pinned && (
                          <span className="text-[10px] bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Pin className="w-2.5 h-2.5 fill-amber-600 text-amber-600" /> Pinned
                          </span>
                        )}

                        {isAuthorBirthday && (
                          <span className="text-[10px] bg-amber-100 text-amber-950 border border-amber-300 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 shadow-2xs" title="Author has a birthday today!">
                            🎂 Birthday Author
                          </span>
                        )}

                        <span aria-hidden="true" className="text-purple-300 dark:text-slate-600">·</span>
                        <span className="capitalize font-semibold text-purple-900 dark:text-purple-300 text-[11px] sm:text-xs">
                          {item.category.replace('-', ' ')}
                        </span>
                      </div>

                      <span className="font-mono text-[11px] text-purple-400 shrink-0">
                        {formatRelativeDate(item.createdAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm sm:text-[15px] font-bold text-purple-950 dark:text-purple-100 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors leading-snug line-clamp-2 mb-2">
                      {item.title}
                    </h3>

                    {/* Description preview */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-3 sm:mb-4">
                      {item.description}
                    </p>

                    {/* Location & Media indicator */}
                    <div className="flex items-center justify-between gap-1.5 text-xs text-purple-800/80 dark:text-purple-300 mb-3 sm:mb-4 bg-purple-50/60 dark:bg-slate-800/60 p-2 rounded-xl border border-purple-100/70 dark:border-slate-700 truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        {item.photos && item.photos.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-medium">
                            <ImageIcon className="w-3 h-3" />
                            <span>{item.photos.length}</span>
                          </span>
                        )}
                        {item.videos && item.videos.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-pink-700 dark:text-pink-300 bg-pink-100 dark:bg-pink-950 px-1.5 py-0.5 rounded font-medium">
                            <Video className="w-3 h-3" />
                            <span>{item.videos.length}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Strip */}
                  <div className="pt-3 border-t border-purple-50 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {renderStatus(item.status)}
                        {item.urgency === 'high' && (
                          <span className="text-[10px] text-pink-700 dark:text-pink-300 font-bold flex items-center gap-0.5 bg-pink-50 dark:bg-pink-950/60 px-2 py-0.5 rounded-md border border-pink-200 dark:border-pink-800 shrink-0">
                            <AlertTriangle className="w-3 h-3 text-pink-600" />
                            Urgent
                          </span>
                        )}
                        {item.status !== 'resolved' && (
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1 ${
                            sla.isBreached 
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold' 
                              : 'bg-purple-100/80 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-medium'
                          }`}>
                            <Clock className="w-2.5 h-2.5" />
                            <span>{sla.remainingHours > 0 ? `${sla.remainingHours}h SLA` : 'SLA Overdue'}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-auto">
                        <button
                          onClick={(e) => onToggleUpvote(item.id, e)}
                          title={hasUserUpvoted ? "Click to undo/retract endorsement" : "Endorse this report"}
                          className={`flex items-center gap-1 px-2.5 py-1.5 min-h-[32px] rounded-xl text-xs font-mono tabular-nums transition-colors cursor-pointer touch-manipulation ${
                            hasUserUpvoted
                              ? 'bg-pink-100/90 dark:bg-pink-950 text-pink-800 dark:text-pink-200 font-bold border border-pink-300 dark:border-pink-700 hover:bg-pink-200'
                              : 'bg-purple-50 dark:bg-slate-800 hover:bg-purple-100 text-purple-800 dark:text-purple-300 border border-purple-100 dark:border-slate-700'
                          }`}
                        >
                          <ThumbsUp className={`w-3 h-3 ${hasUserUpvoted ? 'text-pink-600 fill-pink-500' : 'text-purple-600 dark:text-purple-400'}`} />
                          <span>{item.upvotes}</span>
                          {hasUserUpvoted && <span className="text-[9px] uppercase font-bold text-pink-700 dark:text-pink-300">Undo</span>}
                        </button>

                        <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 group-hover:text-purple-950 dark:group-hover:text-white flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform min-h-[32px]">
                          <span>Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin Bulk Update Confirmation Prompt Modal */}
      {pendingBulkStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/50 backdrop-blur-xs select-none">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-md w-full border border-purple-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95 text-slate-800 dark:text-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-purple-950 dark:text-purple-100">Confirm Bulk Status Update</h3>
                <p className="text-xs text-purple-700/80 dark:text-purple-400">
                  Administrative action verification
                </p>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-slate-800 p-3 rounded-2xl border border-purple-200 dark:border-slate-700 text-xs text-purple-900 dark:text-purple-200 space-y-1">
              <p>
                Are you sure you want to change the status of <strong>{selectedIds.size} selected reports</strong> to:
              </p>
              <div className="pt-1">
                <span className="inline-block px-3 py-1 rounded-md bg-purple-800 text-white font-bold capitalize">
                  {pendingBulkStatus.replace('-', ' ')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPendingBulkStatus(null)}
                className="px-3.5 py-1.5 rounded-xl border border-purple-200 dark:border-slate-700 text-xs font-semibold text-purple-800 dark:text-purple-300 hover:bg-purple-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkUpdate}
                className="px-4 py-1.5 rounded-xl bg-purple-900 hover:bg-black text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Confirm Bulk Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};