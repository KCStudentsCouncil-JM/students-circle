import React, { useState } from 'react';
import { FeedbackReport, FeedbackStatus, RoleMode, AuthUser } from '../types';
import { calculateSlaInfo } from '../utils';
import { 
  Building2, 
  MapPin, 
  Clock, 
  User, 
  Shield, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ThumbsUp, 
  MessageSquare,
  Sparkles,
  ChevronDown,
  Ribbon,
  Download,
  Mail,
  BadgeCheck,
  Search,
  ArrowLeft,
  Trash2,
  Image as ImageIcon,
  RotateCcw,
  AlertTriangle,
  X
} from 'lucide-react';

interface FeedbackDetailProps {
  report: FeedbackReport | null;
  role: RoleMode;
  currentUser?: AuthUser | null;
  onUpdateStatus: (id: string, status: FeedbackStatus, adminNote?: string) => void;
  onAddActivity: (id: string, message: string, role: 'admin' | 'student', statusChange?: FeedbackStatus) => void;
  onToggleUpvote: (id: string, e: React.MouseEvent) => void;
  onBack: () => void;
  onDeleteReport?: (id: string) => void;
  otherReports: FeedbackReport[];
  onSelectOtherReport: (id: string) => void;
}

export const FeedbackDetail: React.FC<FeedbackDetailProps> = ({
  report,
  role,
  currentUser,
  onUpdateStatus,
  onAddActivity,
  onToggleUpvote,
  onBack,
  onDeleteReport,
  otherReports,
  onSelectOtherReport,
}) => {
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedStatusChange, setSelectedStatusChange] = useState<FeedbackStatus | ''>('');
  const [showQuickTemplates, setShowQuickTemplates] = useState(false);
  const [endorserSearchQuery, setEndorserSearchQuery] = useState('');
  const [showEndorsersSection, setShowEndorsersSection] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const handleExportCSV = () => {
    if (!report) return;
    const endorsersList = report.endorsers || [];
    const headers = ['Report ID', 'Report Title', 'Endorser Name', 'Student ID', 'Campus Role', 'Email', 'Endorsed At'];
    const rows = endorsersList.map((end) => [
      `"${report.id}"`,
      `"${report.title.replace(/"/g, '""')}"`,
      `"${end.name.replace(/"/g, '""')}"`,
      `"${end.studentId || 'N/A'}"`,
      `"${end.role.replace(/"/g, '""')}"`,
      `"${end.email}"`,
      `"${end.timestamp}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Endorsements_${report.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!report) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#faf8fc] text-purple-900/60 p-8 select-none">
        <div className="w-16 h-16 rounded-2xl bg-purple-100/70 border border-purple-200/80 flex items-center justify-center text-purple-600 mb-3 shadow-xs">
          <MessageSquare className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h3 className="text-sm font-semibold text-purple-950">No Feedback Selected</h3>
        <p className="text-xs text-purple-700/70 mt-1 max-w-xs text-center">
          Choose a report or proposal from the list to inspect detailed specifications, status history, and administrative updates.
        </p>
      </div>
    );
  }

  // Fix #7: Monotonic/authoritative SLA calculation
  const sla = calculateSlaInfo(report.createdAt, report.urgency, report.status);

  // Fix #5: Student can delete their own report or Admin can delete any report
  const isAuthor = 
    currentUser?.name === report.author || 
    currentUser?.name === report.authorRealName || 
    (currentUser?.email && report.authorEmail === currentUser.email);
  const canDelete = role === 'admin' || isAuthor;

  // NEW: Calculate if the current user is in the endorsers array
  const hasUserUpvoted = currentUser?.email 
    ? report.endorsers?.some((e) => e.email === currentUser.email) 
    : false;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    const newStatus = selectedStatusChange ? (selectedStatusChange as FeedbackStatus) : undefined;
    onAddActivity(
      report.id,
      replyMessage.trim(),
      role === 'admin' ? 'admin' : 'student',
      newStatus
    );
    setReplyMessage('');
    setSelectedStatusChange('');
  };

  const handleQuickTemplateClick = (text: string, status?: FeedbackStatus) => {
    setReplyMessage(text);
    if (status) {
      setSelectedStatusChange(status);
    }
    setShowQuickTemplates(false);
  };

  const renderStatusBadge = (status: FeedbackStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            Open For Triage
          </span>
        );
      case 'in-review':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-700 bg-pink-50 px-2.5 py-1 rounded-md border border-pink-200">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            Under Administrative Review
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Action In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Resolved & Verified
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            Draft
          </span>
        );
    }
  };

  const formatFullDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden select-text">
      {/* Detail Toolbar */}
      <div className="border-b border-purple-100 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 shrink-0 bg-[#faf8fc]/90 select-none">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Go Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg bg-white hover:bg-purple-50 text-purple-950 font-semibold text-xs border border-purple-200/90 shadow-2xs transition-all cursor-pointer mr-0.5 active:scale-95 touch-manipulation"
            title="Go back to main campus reports"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-purple-700" />
            <span>Go Back</span>
          </button>

          <span className="font-mono text-xs font-semibold text-purple-900 bg-purple-100/70 px-2 py-1 rounded">
            #{report.id}
          </span>
          <span className="text-xs text-purple-400 hidden sm:inline">·</span>
          <span className="text-xs font-medium text-purple-800/80 hidden sm:inline truncate max-w-[200px] md:max-w-none">
            {report.type === 'initiative' ? 'Campus Initiative Pitch' : 'Issue / Defect Report'}
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 flex-wrap">
          {/* Fix #6: Upvote button using hasUserUpvoted */}
          <button
            onClick={(e) => onToggleUpvote(report.id, e)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold transition-all border cursor-pointer touch-manipulation ${
              hasUserUpvoted
                ? 'bg-pink-100/90 border-pink-400 text-pink-800 shadow-xs hover:bg-pink-200'
                : 'bg-white border-purple-200 text-purple-800 hover:bg-purple-50'
            }`}
            title={hasUserUpvoted ? "Click to undo/retract your endorsement" : "Endorse this report"}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasUserUpvoted ? 'text-pink-600 fill-pink-500' : 'text-purple-600'}`} />
            <span>{hasUserUpvoted ? 'Endorsed (Undo)' : 'Endorse'} ({report.upvotes})</span>
          </button>

          {/* Fix #5: Student/Admin Delete button */}
          {canDelete && onDeleteReport && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 transition-colors cursor-pointer touch-manipulation"
              title="Delete this report"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}

          {/* Status Changer (Dropdown for Admin) */}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="hidden md:inline text-[11px] font-semibold text-purple-900/70">
              Status:
            </span>
            {role === 'admin' ? (
              <div className="relative">
                <select
                  value={report.status}
                  onChange={(e) => onUpdateStatus(report.id, e.target.value as FeedbackStatus)}
                  className="bg-purple-50 hover:bg-purple-100/80 text-purple-950 font-semibold text-xs py-1.5 min-h-[36px] pl-2.5 pr-7 rounded-md border border-purple-200 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer appearance-none touch-manipulation"
                >
                  <option value="open">Open</option>
                  <option value="in-review">In Review</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="draft">Draft</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-purple-600 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ) : (
              <div>{renderStatusBadge(report.status)}</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area: Scrollable with safe bottom padding */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6 pb-28 sm:pb-12">
        {/* Title & Metadata Card */}
        <div className="border-b border-purple-100 pb-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-purple-950 tracking-tight leading-snug">
              {report.title}
            </h1>
            <div className="shrink-0">{renderStatusBadge(report.status)}</div>
          </div>

          {/* Metadata Grid with SLA Tamper-Proof Monitor */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3 pt-2 text-xs">
            {/* Category */}
            <div className="bg-purple-50/50 p-2 sm:p-2.5 rounded-lg border border-purple-100/80">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 block mb-0.5">
                Category
              </span>
              <span className="font-semibold text-purple-950 capitalize truncate block">
                {report.category.replace('-', ' ')}
              </span>
            </div>

            {/* Urgency */}
            <div className="bg-purple-50/50 p-2 sm:p-2.5 rounded-lg border border-purple-100/80">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 block mb-0.5">
                Urgency Level
              </span>
              <span className={`font-semibold capitalize flex items-center gap-1 ${
                report.urgency === 'high' ? 'text-pink-600 font-bold' : 'text-purple-950'
              }`}>
                {report.urgency === 'high' && <AlertCircle className="w-3.5 h-3.5 text-pink-600 shrink-0" />}
                <span className="truncate">{report.urgency === 'high' ? 'High / Immediate' : report.urgency}</span>
              </span>
            </div>

            {/* Fix #7: Tamper-proof SLA Timer */}
            <div className={`p-2 sm:p-2.5 rounded-lg border ${
              sla.isResolved
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : sla.isBreached
                ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                : 'bg-purple-50/60 border-purple-200 text-purple-950'
            }`}>
              <span className="text-[10px] uppercase font-bold tracking-wider block mb-0.5 opacity-70">
                SLA ({sla.targetHours}h Target)
              </span>
              <div className="font-semibold text-[11px] flex items-center gap-1 truncate">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{sla.label}</span>
              </div>
            </div>

            {/* Location */}
            <div className="bg-purple-50/50 p-2 sm:p-2.5 rounded-lg border border-purple-100/80">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 block mb-0.5">
                Location
              </span>
              <span className="font-semibold text-purple-950 truncate block" title={report.location}>
                {report.location}
              </span>
            </div>

            {/* Submitted By */}
            <div className="bg-purple-50/50 p-2 sm:p-2.5 rounded-lg border border-purple-100/80">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 block mb-0.5">
                Submitted By
              </span>
              {report.isAnonymous ? (
                <span className="font-semibold text-purple-900 inline-flex items-center gap-1 truncate max-w-full">
                  <Shield className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                  <span className="truncate">Anonymous</span>
                </span>
              ) : (
                <span className="font-semibold text-purple-950 truncate flex items-center gap-1" title={`${report.author} (${report.authorRole})`}>
                  <span className="truncate">{report.author}</span>
                  {report.author === 'Dylon Ocha' && (
                    <span className="text-[10px] bg-amber-200 text-purple-950 px-1.5 py-0.5 rounded-full font-bold shrink-0 shadow-2xs">
                      🎂 Birthday!
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-purple-700/80 pt-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Created {formatFullDate(report.createdAt)}</span>
              {report.department && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-purple-900 font-medium">Assigned: {report.department}</span>
                </>
              )}
            </div>

            {report.resolutionNotes && (
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-200 self-start sm:self-auto">
                Resolution Verified
              </span>
            )}
          </div>

          {/* Admin Confidential Reporter View */}
          {role === 'admin' && (
            <div className="mt-3 p-3 sm:p-3.5 rounded-xl bg-purple-900/5 border border-purple-200/90 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-950">
                  <BadgeCheck className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>Administrative Audit: Verified Reporter Credentials</span>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold">
                  Staff Only Access
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 text-xs pt-1">
                <div className="bg-white p-2 rounded-lg border border-purple-100">
                  <span className="text-[10px] text-purple-400 block uppercase font-bold">Verified True Name</span>
                  <span className="font-semibold text-purple-950 truncate block">
                    {report.authorRealName || report.author}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-purple-100">
                  <span className="text-[10px] text-purple-400 block uppercase font-bold">Student ID & Program</span>
                  <span className="font-semibold text-purple-950 truncate block">
                    #{report.authorStudentId || 'STU-2022-8419'} · {report.authorRole}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-purple-100">
                  <span className="text-[10px] text-purple-400 block uppercase font-bold">Contact Email</span>
                  <a href={`mailto:${report.authorEmail || 'student@campus.edu'}`} className="font-semibold text-purple-700 hover:underline truncate block break-all">
                    {report.authorEmail || 'student@campus.edu'}
                  </a>
                </div>
              </div>

              {report.isAnonymous && (
                <div className="flex items-center gap-2 text-[11px] text-pink-700 bg-pink-50/80 px-2.5 py-1.5 rounded-lg border border-pink-200">
                  <Shield className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                  <span>
                    <strong>Student Anonymity Active:</strong> Masked on public campus views. Displayed here for university operations & safety follow-up.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Detailed Description */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-purple-950/70">
            Description & Details
          </h2>
          <div className="p-4 rounded-xl bg-purple-50/30 border border-purple-100 text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
            {report.description}
          </div>
        </div>

        {/* Photo Evidence Attachments (Fix #3 & #11 display) */}
        {report.photos && report.photos.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-950/70 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
              <span>Evidence Attachments ({report.photos.length})</span>
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              {report.photos.map((src, i) => (
                <div 
                  key={i} 
                  onClick={() => setPreviewPhoto(src)}
                  className="w-28 h-28 rounded-xl overflow-hidden border border-purple-200 hover:border-purple-400 shadow-2xs hover:shadow-md cursor-pointer transition-all group relative"
                >
                  <img src={src} alt={`Attachment ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-purple-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold">
                    Click to view
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Endorsements Roster */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-purple-950/70 flex items-center gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5 text-pink-600" />
                <span>Student Endorsements</span>
              </h2>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                {report.upvotes}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {role === 'admin' && (report.endorsers?.length || 0) > 0 && (
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="flex items-center gap-1 text-[11px] text-purple-700 hover:text-purple-950 font-semibold bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-md border border-purple-200 transition-colors cursor-pointer"
                  title="Export endorser roster as CSV"
                >
                  <Download className="w-3 h-3 text-purple-600" />
                  <span>Export CSV</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowEndorsersSection(!showEndorsersSection)}
                className="text-[11px] text-purple-600 hover:text-purple-950 font-medium cursor-pointer"
              >
                {showEndorsersSection ? 'Collapse' : 'View Roster'}
              </button>
            </div>
          </div>

          {showEndorsersSection && (
            <div className="rounded-xl border border-purple-100 bg-[#faf8fc] p-3.5 space-y-3">
              {(!report.endorsers || report.endorsers.length === 0) ? (
                <div className="p-3 text-center text-[11px] text-purple-600/70">
                  No registered endorsements yet. Click "Endorse" at the top to back this proposal!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {report.endorsers.map((end) => {
                    const isCurrentUserEndorser = 
                      currentUser?.name === end.name || 
                      currentUser?.email === end.email;
                    return (
                      <div
                        key={end.id}
                        className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 shadow-2xs ${
                          isCurrentUserEndorser 
                            ? 'bg-pink-50/70 border-pink-200' 
                            : 'bg-white border-purple-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {end.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-xs text-purple-950 truncate">{end.name}</span>
                              {isCurrentUserEndorser && (
                                <span className="text-[9px] bg-pink-200 text-pink-800 font-bold px-1.5 rounded">You</span>
                              )}
                            </div>
                            <div className="text-[10px] text-purple-700/80 truncate">
                              {end.role}
                            </div>
                          </div>
                        </div>

                        {isCurrentUserEndorser && (
                          <button
                            type="button"
                            onClick={(e) => onToggleUpvote(report.id, e)}
                            className="text-[10px] font-bold text-pink-700 hover:text-white bg-white hover:bg-pink-600 px-2 py-1 rounded border border-pink-300 transition-colors cursor-pointer shrink-0"
                            title="Undo my endorsement"
                          >
                            Undo
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Activity & Response Feed */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-950/70 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
              <span>Official Responses & Activity Timeline</span>
            </h2>
            <span className="text-[11px] font-mono text-purple-600">
              {report.activities.length} {report.activities.length === 1 ? 'event' : 'events'}
            </span>
          </div>

          <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-purple-100">
            {report.activities.map((act) => {
              const isAdmin = act.role === 'admin';
              const isSystem = act.role === 'system';

              return (
                <div key={act.id} className="relative flex items-start gap-3 pl-8">
                  <div
                    className={`absolute left-1.5 top-1 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                      isAdmin
                        ? 'bg-purple-800 text-pink-300'
                        : isSystem
                        ? 'bg-slate-300 text-slate-700'
                        : 'bg-pink-100 text-pink-700'
                    }`}
                  >
                    {isAdmin ? '★' : isSystem ? '⚙' : '•'}
                  </div>

                  <div
                    className={`flex-1 p-3.5 rounded-xl text-xs space-y-1.5 ${
                      isAdmin
                        ? 'bg-purple-50/80 border border-purple-200/90 text-purple-950'
                        : isSystem
                        ? 'bg-slate-50 border border-slate-200 text-slate-700'
                        : 'bg-white border border-purple-100 shadow-xs text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs">{act.author}</span>
                        {act.badgeText && (
                          <span className="bg-purple-800 text-pink-200 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                            {act.badgeText}
                          </span>
                        )}
                        {act.statusChange && (
                          <span className="text-[10px] font-mono bg-pink-100 text-pink-800 px-1.5 py-0.2 rounded">
                            Status → {act.statusChange}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-purple-400 font-mono">
                        {formatFullDate(act.timestamp)}
                      </span>
                    </div>

                    <p className="leading-relaxed whitespace-pre-line text-slate-700">
                      {act.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reply & Official Action Composer */}
        <div className="pt-2">
          <form onSubmit={handleSendReply} className="bg-purple-50/40 p-4 rounded-2xl border border-purple-100 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-purple-600" />
                <span>
                  {role === 'admin' ? 'Publish Official University Response' : 'Add Student Follow-up Note'}
                </span>
              </label>

              {role === 'admin' && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-purple-800">
                    Update status to:
                  </span>
                  <select
                    value={selectedStatusChange}
                    onChange={(e) => setSelectedStatusChange(e.target.value as FeedbackStatus)}
                    className="text-xs py-1 px-2 rounded-lg border border-purple-200 bg-white font-medium text-purple-950"
                  >
                    <option value="">Keep Current Status ({report.status})</option>
                    <option value="open">Open</option>
                    <option value="in-review">In Review</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              )}
            </div>

            <textarea
              rows={3}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder={
                role === 'admin'
                  ? 'Type official campus update, dispatch details, or resolution notes...'
                  : 'Add additional details, questions for administration, or updates...'
              }
              className="w-full text-xs p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white text-purple-950"
            />

            <div className="flex items-center justify-between">
              <div className="text-[11px] text-purple-600 flex items-center gap-1">
                <Ribbon className="w-3.5 h-3.5 text-pink-500" />
                <span>BCA Month Student Voice</span>
              </div>

              <button
                type="submit"
                disabled={!replyMessage.trim()}
                className="px-4 py-2 bg-gradient-to-r from-purple-800 to-purple-950 text-white font-semibold text-xs rounded-xl shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>Publish Message</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Fix #5: Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs select-none">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full border border-rose-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Delete Report #{report.id}?</h3>
                <p className="text-xs text-slate-500">
                  This action is permanent and will remove this report and its history.
                </p>
              </div>
            </div>

            <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-100 text-xs text-rose-800 font-medium">
              "{report.title}"
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  if (onDeleteReport) onDeleteReport(report.id);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div 
          onClick={() => setPreviewPhoto(null)} 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs cursor-pointer select-none"
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewPhoto} alt="Full evidence preview" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};