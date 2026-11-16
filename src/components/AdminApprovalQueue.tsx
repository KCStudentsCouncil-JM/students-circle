import React, { useState } from 'react';
import { FeedbackReport } from '../types';
import { formatReportId } from '../utils';
import {
  CheckSquare,
  Check,
  XCircle,
  Clock,
  MapPin,
  Sparkles,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

interface AdminApprovalQueueProps {
  pendingReports: FeedbackReport[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
  onSelectReport: (id: string) => void;
}

export const AdminApprovalQueue: React.FC<AdminApprovalQueueProps> = ({
  pendingReports,
  onApprove,
  onReject,
  onSelectReport,
}) => {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reasonText, setReasonText] = useState('');

  const handleOpenReject = (id: string) => {
    setRejectingId(id);
    setReasonText('');
  };

  const handleConfirmReject = (id: string) => {
    onReject(id, reasonText.trim() || undefined);
    setRejectingId(null);
    setReasonText('');
  };

  return (
    <div className="flex-1 bg-[#faf8fc] dark:bg-slate-950 flex flex-col h-full overflow-hidden select-none">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-purple-100 dark:border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-purple-950 dark:text-purple-100">
              Pending Council Approvals
            </h1>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Review student initiative proposals before publishing them to the campus feed
            </p>
          </div>
        </div>
        <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          {pendingReports.length} Waiting
        </span>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 pb-28 sm:pb-12 momentum-scroll">
        <div className="max-w-4xl mx-auto space-y-4">
          {pendingReports.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-purple-100 dark:border-slate-800 flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <Check className="w-7 h-7" />
              </div>
              <h2 className="text-sm font-bold text-purple-950 dark:text-purple-100">
                All Proposals Reviewed
              </h2>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 max-w-sm">
                There are no pending student initiatives waiting for council sign-off right now.
              </p>
            </div>
          ) : (
            pendingReports.map((item) => {
              const isRejecting = rejectingId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-purple-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                          {formatReportId(item.id, item.type, item.status)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 capitalize">
                          <Sparkles className="w-3 h-3" /> {item.category.replace('-', ' ')}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-purple-950 dark:text-purple-100">
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-2 text-[11px] text-purple-700/80 dark:text-purple-400 flex-wrap">
                        <span className="font-semibold text-purple-900 dark:text-purple-200">
                          {item.authorRealName || item.author}
                        </span>
                        <span>({item.authorRole})</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {item.location}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectReport(item.id)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl border border-purple-200 dark:border-slate-700 text-xs font-semibold text-purple-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Inspect Full</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-purple-50/40 dark:bg-slate-800/50 p-3 rounded-2xl border border-purple-100/70 dark:border-slate-800 whitespace-pre-line">
                    {item.description}
                  </p>

                  {isRejecting ? (
                    <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300">
                        <AlertCircle className="w-4 h-4" />
                        <span>Reason for Declining Proposal (visible to author)</span>
                      </div>
                      <textarea
                        rows={2}
                        value={reasonText}
                        onChange={(e) => setReasonText(e.target.value)}
                        placeholder="Explain why this proposal needs revision or cannot be approved..."
                        className="w-full text-xs p-2.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setRejectingId(null)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmReject(item.id)}
                          className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs cursor-pointer"
                        >
                          Confirm Decline
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenReject(item.id)}
                        className="flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onApprove(item.id)}
                        className="flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Publish</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
