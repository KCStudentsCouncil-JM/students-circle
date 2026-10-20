import React, { useState } from 'react';
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
  PartyPopper
} from 'lucide-react';

interface FeedbackListProps {
  reports: FeedbackReport[];
  selectedId: string | null;
  onSelectReport: (id: string) => void;
  onToggleUpvote: (id: string, e: React.MouseEvent) => void;
  activeFilterTitle: string;
  onNavigateToEvents?: () => void;
  eventsCount?: number;
  role?: RoleMode;
  currentUser?: UserProfile | null;
  allUsers?: UserProfile[]; // <--- ADDED
  onBulkUpdateStatus?: (ids: string[], newStatus: FeedbackStatus) => void;
}

export const FeedbackList: React.FC<FeedbackListProps> = ({
  reports,
  selectedId,
  onSelectReport,
  onToggleUpvote,
  activeFilterTitle,
  onNavigateToEvents,
  eventsCount = 6,
  role = 'student',
  currentUser,
  allUsers = [], // <--- ADDED
  onBulkUpdateStatus,
}) => {
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | UrgencyLevel>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'issue' | 'initiative'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'upvotes' | 'urgency'>('newest');

  // Fix #12: Admin Bulk selection state & confirmation modal
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingBulkStatus, setPendingBulkStatus] = useState<FeedbackStatus | null>(null);

  // Calculate today's birthdays
  const todaysBirthdays = allUsers.filter(u => isBirthdayToday(u.birthday));

  // Filter by urgency and type
  const filtered = reports.filter((r) => {
    if (urgencyFilter !== 'all' && r.urgency !== urgencyFilter) return false;
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
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

  // Helper for status badge styling
  const renderStatus = (status: FeedbackStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            Open
          </span>
        );
      case 'in-review':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-md border border-pink-200">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
            In Review
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Resolved
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
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
    <div className="flex-1 w-full bg-[#faf8fc] flex flex-col h-full select-none overflow-hidden relative">
      {/* Sub-header / Filter strip across main page */}
      <div className="p-4 sm:px-6 border-b border-purple-100 bg-white/90 backdrop-blur-xs space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-bold text-base text-purple-950 tracking-tight">
                {activeFilterTitle}
              </h1>
              <span className="text-xs font-mono tabular-nums text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-semibold">
                {sorted.length} {sorted.length === 1 ? 'item' : 'items'}
              </span>

              {role === 'admin' && sorted.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-950 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200 transition-colors cursor-pointer ml-1"
                >
                  {selectedIds.size === sorted.length ? 'Deselect All' : `Select All (${sorted.length})`}
                </button>
              )}
            </div>
            <p className="text-xs text-purple-700/80 mt-0.5">
              Explore reported campus issues, suggest event initiatives, and endorse peer proposals.
            </p>
          </div>

          {/* Right Header Zone: Upcoming Events CTA & Sort Selector */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {onNavigateToEvents && (
              <button
                onClick={onNavigateToEvents}
                className="flex items-center gap-1.5 text-xs text-pink-700 bg-pink-50 hover:bg-pink-100 font-semibold px-2.5 py-1.5 rounded-lg border border-pink-200 shadow-2xs transition-all cursor-pointer touch-manipulation"
                title="View upcoming school events calendar"
              >
                <Calendar className="w-3.5 h-3.5 text-pink-600" />
                <span>Upcoming Events</span>
                <span className="bg-pink-200/70 text-pink-800 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                  {eventsCount}
                </span>
              </button>
            )}

            <div className="flex items-center gap-1.5 text-xs text-purple-900 bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-200">
              <ArrowUpDown className="w-3.5 h-3.5 text-purple-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-xs font-semibold text-purple-950 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="upvotes">Most Endorsed</option>
                <option value="urgency">Highest Urgency</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter bar: Type & Urgency segmented buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pt-1 border-t border-purple-50">
          {/* Type Filter */}
          <div className="flex items-center gap-1 p-0.5 bg-purple-100/60 rounded-lg text-xs overflow-x-auto no-scrollbar">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 touch-manipulation ${
                typeFilter === 'all'
                  ? 'bg-white text-purple-950 shadow-2xs'
                  : 'text-purple-700 hover:text-purple-950'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('issue')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 touch-manipulation ${
                typeFilter === 'issue'
                  ? 'bg-white text-purple-950 shadow-2xs'
                  : 'text-purple-700 hover:text-purple-950'
              }`}
            >
              <Wrench className="w-3 h-3 text-purple-600" />
              <span>Issues / Fixes</span>
            </button>
            <button
              onClick={() => setTypeFilter('initiative')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 touch-manipulation ${
                typeFilter === 'initiative'
                  ? 'bg-white text-purple-950 shadow-2xs'
                  : 'text-purple-700 hover:text-purple-950'
              }`}
            >
              <Sparkles className="w-3 h-3 text-pink-600" />
              <span>Initiatives / Events</span>
            </button>
          </div>

          {/* Urgency Filter */}
          <div className="flex items-center gap-1 p-0.5 bg-purple-100/60 rounded-lg text-xs overflow-x-auto no-scrollbar">
            {(['all', 'high', 'medium', 'low'] as const).map((level) => {
              const isSelected = urgencyFilter === level;
              return (
                <button
                  key={level}
                  onClick={() => setUrgencyFilter(level)}
                  className={`px-2 sm:px-2.5 py-1.5 rounded-md font-semibold capitalize transition-all cursor-pointer whitespace-nowrap shrink-0 touch-manipulation ${
                    isSelected
                      ? 'bg-white text-purple-950 shadow-2xs'
                      : 'text-purple-700 hover:text-purple-950'
                  }`}
                >
                  {level === 'all' ? 'All Urgencies' : level === 'high' ? 'High / Urgent' : level}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fix #12: Admin Sticky Bulk Action Toolbar */}
      {role === 'admin' && selectedIds.size > 0 && (
        <div className="bg-purple-900 text-white px-4 py-2.5 flex items-center justify-between gap-3 shadow-md z-20 shrink-0 border-b border-purple-800 animate-in slide-in-from-top-2 flex-wrap">
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
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 pb-28 sm:pb-12">
        
        {/* Birthday Celebration Section */}
        {todaysBirthdays.length > 0 && (
          <div className="mb-5 animate-in fade-in slide-in-from-top-4">
            <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 rounded-2xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
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
                        {student.name.charAt(0)}
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

        {sorted.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-purple-950/60 flex flex-col items-center justify-center min-h-[250px] sm:min-h-[300px]">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-400 mb-3">
              <SlidersHorizontal className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-bold text-purple-950">No reports found</h3>
            <p className="text-xs text-purple-700/70 mt-1 max-w-sm">
              No campus reports match your selected filters or search keyword. Try clearing filters or switching categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {sorted.map((item) => {
              const sla = calculateSlaInfo(item.createdAt, item.urgency, item.status);
              const isBulkSelected = selectedIds.has(item.id);
              
              // Check if the current user is in the endorsers array
              const hasUserUpvoted = currentUser?.email 
                ? item.endorsers?.some((e) => e.email === currentUser.email) 
                : false;

              // Check if report author has a birthday today
              const authorUser = allUsers.find(u => u.name === item.author || (item.authorEmail && u.email === item.authorEmail));
              const isAuthorBirthday = authorUser ? isBirthdayToday(authorUser.birthday) : (item.author === 'Dylon Ocha');

              // Format the ID (KCIS, KCOI, KCRS, etc.)
              const formattedId = formatReportId(item.id, item.type, item.status);

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectReport(item.id)}
                  className={`bg-white rounded-2xl p-3.5 sm:p-5 border transition-all cursor-pointer flex flex-col justify-between group touch-manipulation relative ${
                    isBulkSelected
                      ? 'border-purple-600 ring-2 ring-purple-300 shadow-md bg-purple-50/20'
                      : 'border-purple-100 hover:border-purple-300 shadow-2xs hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Top Meta Line */}
                    <div className="flex items-center justify-between text-xs text-purple-900/70 mb-2 flex-wrap gap-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        {role === 'admin' && (
                          <button
                            type="button"
                            onClick={(e) => handleToggleSelect(item.id, e)}
                            className="text-purple-700 hover:text-purple-950 p-0.5 cursor-pointer"
                            title="Select for bulk action"
                          >
                            {isBulkSelected ? (
                              <CheckSquare className="w-4 h-4 text-purple-700 fill-purple-100" />
                            ) : (
                              <Square className="w-4 h-4 text-purple-400" />
                            )}
                          </button>
                        )}
                        <span className="font-mono font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60">
                          {formattedId}
                        </span>
                        {isAuthorBirthday && (
                          <span className="text-[10px] bg-amber-100 text-amber-950 border border-amber-300 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 shadow-2xs" title="Author has a birthday today!">
                            🎂 Birthday Author
                          </span>
                        )}
                        <span aria-hidden="true" className="text-purple-300">·</span>
                        <span className="capitalize font-semibold text-purple-900 text-[11px] sm:text-xs">
                          {item.category.replace('-', ' ')}
                        </span>
                      </div>

                      <span className="font-mono text-[11px] text-purple-400 shrink-0">
                        {formatRelativeDate(item.createdAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm sm:text-[15px] font-bold text-purple-950 group-hover:text-purple-700 transition-colors leading-snug line-clamp-2 mb-2">
                      {item.title}
                    </h3>

                    {/* Description preview */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3 sm:mb-4">
                      {item.description}
                    </p>

                    {/* Location & Photos indicator */}
                    <div className="flex items-center justify-between gap-1.5 text-xs text-purple-800/80 mb-3 sm:mb-4 bg-purple-50/60 p-2 rounded-lg border border-purple-100/70 truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                      {item.photos && item.photos.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded shrink-0 font-medium">
                          <ImageIcon className="w-3 h-3" />
                          <span>{item.photos.length} photo</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Strip */}
                  <div className="pt-3 border-t border-purple-50 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {renderStatus(item.status)}
                        {item.urgency === 'high' && (
                          <span className="text-[10px] text-pink-700 font-bold flex items-center gap-0.5 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200 shrink-0">
                            <AlertTriangle className="w-3 h-3 text-pink-600" />
                            Urgent
                          </span>
                        )}
                        {/* Fix #7: SLA tracker indicator on cards */}
                        {item.status !== 'resolved' && (
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1 ${
                            sla.isBreached 
                              ? 'bg-rose-100 text-rose-800 font-bold' 
                              : 'bg-purple-100/80 text-purple-700 font-medium'
                          }`}>
                            <Clock className="w-2.5 h-2.5" />
                            <span>{sla.remainingHours > 0 ? `${sla.remainingHours}h SLA` : 'SLA Overdue'}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-auto">
                        {/* UPDATED: Upvote button uses hasUserUpvoted */}
                        <button
                          onClick={(e) => onToggleUpvote(item.id, e)}
                          title={hasUserUpvoted ? "Click to undo/retract endorsement" : "Endorse this report"}
                          className={`flex items-center gap-1 px-2.5 py-1.5 min-h-[32px] rounded-lg text-xs font-mono tabular-nums transition-colors cursor-pointer touch-manipulation ${
                            hasUserUpvoted
                              ? 'bg-pink-100/90 text-pink-800 font-bold border border-pink-300 hover:bg-pink-200'
                              : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-100'
                          }`}
                        >
                          <ThumbsUp className={`w-3 h-3 ${hasUserUpvoted ? 'text-pink-600 fill-pink-500' : 'text-purple-600'}`} />
                          <span>{item.upvotes}</span>
                          {hasUserUpvoted && <span className="text-[9px] uppercase font-bold text-pink-700">Undo</span>}
                        </button>

                        {/* Go to details link */}
                        <span className="text-xs font-semibold text-purple-700 group-hover:text-purple-950 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform min-h-[32px]">
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

      {/* Fix #12: Admin Bulk Update Confirmation Prompt Modal */}
      {pendingBulkStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/50 backdrop-blur-xs select-none">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full border border-purple-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-purple-950">Confirm Bulk Status Update</h3>
                <p className="text-xs text-purple-700/80">
                  Administrative action verification
                </p>
              </div>
            </div>

            <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-1">
              <p>
                Are you sure you want to change the status of <strong>{selectedIds.size} selected reports</strong> to:
              </p>
              <div className="pt-1">
                <span className="inline-block px-3 py-1 rounded-md bg-purple-800 text-white font-bold capitalize">
                  {pendingBulkStatus.replace('-', ' ')}
                </span>
              </div>
              <p className="text-[11px] text-purple-700/80 pt-1">
                This will automatically add administrative audit entries and notify relevant campus department queues.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPendingBulkStatus(null)}
                className="px-3.5 py-1.5 rounded-lg border border-purple-200 text-xs font-semibold text-purple-800 hover:bg-purple-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkUpdate}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-800 to-purple-950 hover:from-purple-900 hover:to-black text-white text-xs font-semibold shadow-xs cursor-pointer"
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