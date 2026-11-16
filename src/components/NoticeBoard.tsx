import React, { useState } from 'react';
import {
  CampusAnnouncement,
  NoticeBoardItemType,
  NoticePollOption,
  RoleMode,
} from '../types';
import {
  Megaphone,
  Info,
  AlertTriangle,
  BarChart2,
  Plus,
  Pencil,
  Trash2,
  Pin,
  Check,
  X,
  ChevronDown,
} from 'lucide-react';

export interface NoticeAnnouncementPayload {
  type: NoticeBoardItemType;
  title: string;
  message: string;
  pinned?: boolean;
  pollOptions?: NoticePollOption[];
}

interface NoticeBoardProps {
  announcements: CampusAnnouncement[];
  role: RoleMode;
  currentUserEmail?: string;
  variant?: 'sidebar' | 'card';
  onAddAnnouncement?: (payload: NoticeAnnouncementPayload) => void;
  onUpdateAnnouncement?: (id: string, updates: NoticeAnnouncementPayload) => void;
  onDeleteAnnouncement?: (id: string) => void;
  onVotePoll?: (announcementId: string, optionId: string) => void;
  onTogglePin?: (announcementId: string) => void;
}

const TYPE_META: Record<
  NoticeBoardItemType,
  {
    label: string;
    badgeClass: string;
    cardTintClass: string;
    icon: React.ReactNode;
  }
> = {
  notice: {
    label: 'Notice',
    badgeClass:
      'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    cardTintClass: 'border-purple-100 dark:border-slate-800',
    icon: <Megaphone className="w-3 h-3" />,
  },
  update: {
    label: 'Update',
    badgeClass:
      'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    cardTintClass: 'border-indigo-200/80 dark:border-indigo-900/60',
    icon: <Info className="w-3 h-3" />,
  },
  alert: {
    label: 'Alert',
    badgeClass:
      'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    cardTintClass: 'border-rose-200 dark:border-rose-900/70 bg-rose-50/30 dark:bg-rose-950/10',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  poll: {
    label: 'Poll',
    badgeClass:
      'bg-violet-100 dark:bg-violet-950/70 text-violet-800 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    cardTintClass: 'border-violet-200/90 dark:border-violet-900/60',
    icon: <BarChart2 className="w-3 h-3" />,
  },
};

const createEmptyOptions = (): NoticePollOption[] => [
  { id: `opt-${Date.now()}-1`, label: '', voters: [] },
  { id: `opt-${Date.now()}-2`, label: '', voters: [] },
];

export const NoticeBoard: React.FC<NoticeBoardProps> = ({
  announcements,
  role,
  currentUserEmail = '',
  variant = 'sidebar',
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  onVotePoll,
  onTogglePin,
}) => {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemType, setItemType] = useState<NoticeBoardItemType>('notice');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [pinned, setPinned] = useState(false);
  const [pollOptions, setPollOptions] = useState<NoticePollOption[]>(createEmptyOptions);
  const [formError, setFormError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | NoticeBoardItemType>('all');

  const resetComposer = () => {
    setEditingId(null);
    setItemType('notice');
    setTitle('');
    setMessage('');
    setPinned(false);
    setPollOptions(createEmptyOptions());
    setFormError(null);
    setIsComposerOpen(false);
  };

  const openCreateForm = () => {
    setEditingId(null);
    setItemType('notice');
    setTitle('');
    setMessage('');
    setPinned(false);
    setPollOptions(createEmptyOptions());
    setFormError(null);
    setIsComposerOpen(true);
  };

  const openEditForm = (ann: CampusAnnouncement, overrideType?: NoticeBoardItemType) => {
    const targetType = overrideType || ann.type || 'notice';
    setEditingId(ann.id);
    setItemType(targetType);
    setTitle(ann.title);
    setMessage(ann.message);
    setPinned(Boolean(ann.pinned));
    setPollOptions(
      ann.pollOptions && ann.pollOptions.length >= 2
        ? ann.pollOptions.map((o) => ({ ...o, voters: [...(o.voters || [])] }))
        : createEmptyOptions()
    );
    setFormError(null);
    setIsComposerOpen(true);
  };

  const handleQuickTypeChange = (ann: CampusAnnouncement, nextType: NoticeBoardItemType) => {
    if (!onUpdateAnnouncement) return;
    if (nextType === 'poll' && (!ann.pollOptions || ann.pollOptions.length < 2)) {
      openEditForm(ann, 'poll');
      return;
    }
    onUpdateAnnouncement(ann.id, {
      type: nextType,
      title: ann.title,
      message: ann.message,
      pinned: ann.pinned,
      pollOptions: ann.pollOptions,
    });
  };

  const handleAddPollOption = () => {
    if (pollOptions.length >= 6) return;
    setPollOptions((prev) => [
      ...prev,
      { id: `opt-${Date.now()}-${prev.length + 1}`, label: '', voters: [] },
    ]);
  };

  const handleRemovePollOption = (optId: string) => {
    if (pollOptions.length <= 2) return;
    setPollOptions((prev) => prev.filter((o) => o.id !== optId));
  };

  const handlePollOptionLabelChange = (optId: string, label: string) => {
    setPollOptions((prev) => prev.map((o) => (o.id === optId ? { ...o, label } : o)));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Please enter a headline or poll question.');
      return;
    }

    if (itemType !== 'poll' && !message.trim()) {
      setFormError('Please enter details for this notice board item.');
      return;
    }

    let cleanedPollOptions: NoticePollOption[] | undefined;
    if (itemType === 'poll') {
      cleanedPollOptions = pollOptions
        .map((o) => ({ ...o, label: o.label.trim() }))
        .filter((o) => o.label.length > 0);
      if (cleanedPollOptions.length < 2) {
        setFormError('Polls require at least 2 non-empty options.');
        return;
      }
    } else if (editingId) {
      const existing = announcements.find((a) => a.id === editingId);
      cleanedPollOptions = existing?.pollOptions;
    }

    const payload: NoticeAnnouncementPayload = {
      type: itemType,
      title: title.trim(),
      message: message.trim(),
      pinned,
      pollOptions: cleanedPollOptions,
    };

    if (editingId && onUpdateAnnouncement) {
      onUpdateAnnouncement(editingId, payload);
    } else if (onAddAnnouncement) {
      onAddAnnouncement(payload);
    }

    resetComposer();
  };

  const visibleAnnouncements =
    variant === 'card' && typeFilter !== 'all'
      ? announcements.filter((a) => (a.type || 'notice') === typeFilter)
      : announcements;

  const isSidebar = variant === 'sidebar';

  const composerForm = isComposerOpen && role === 'admin' && (
    <form
      onSubmit={handleSave}
      className={`space-y-2 bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-slate-700 ${
        isSidebar ? 'p-2.5' : 'p-3.5'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-purple-950 dark:text-purple-100">
          {editingId ? 'Edit Notice Board Item' : 'New Notice Board Item'}
        </span>
        <button
          type="button"
          onClick={resetComposer}
          className="text-purple-500 hover:text-purple-800 dark:hover:text-purple-200 cursor-pointer p-0.5"
          title="Cancel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Item Type Selector */}
      <div className="grid grid-cols-4 gap-1">
        {(['notice', 'update', 'alert', 'poll'] as NoticeBoardItemType[]).map((t) => {
          const meta = TYPE_META[t];
          const selected = itemType === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => {
                setItemType(t);
                setFormError(null);
              }}
              className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                selected
                  ? 'bg-purple-800 text-white border-purple-800 shadow-2xs'
                  : 'bg-purple-50/50 dark:bg-slate-800 text-purple-800 dark:text-purple-300 border-purple-200/80 dark:border-slate-700 hover:bg-purple-100/70'
              }`}
            >
              {meta.icon}
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={
          itemType === 'poll'
            ? 'Poll question (e.g., Preferred Spirit Day theme?)'
            : itemType === 'alert'
            ? 'Alert headline...'
            : itemType === 'update'
            ? 'Update headline...'
            : 'Notice headline...'
        }
        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-purple-200 dark:border-slate-700 bg-purple-50/40 dark:bg-slate-800 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
      />

      <textarea
        rows={2}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={
          itemType === 'poll'
            ? 'Optional context for voters...'
            : 'Details for students and staff...'
        }
        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-purple-200 dark:border-slate-700 bg-purple-50/40 dark:bg-slate-800 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
      />

      {/* Poll Options Editor */}
      {itemType === 'poll' && (
        <div className="space-y-1.5 pt-1 border-t border-purple-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300">
              Poll Choices ({pollOptions.length}/6)
            </span>
            {pollOptions.length < 6 && (
              <button
                type="button"
                onClick={handleAddPollOption}
                className="text-[10px] font-bold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Option
              </button>
            )}
          </div>
          <div className="space-y-1.5">
            {pollOptions.map((opt, idx) => (
              <div key={opt.id} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => handlePollOptionLabelChange(opt.id, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1 px-2.5 py-1.5 text-[11px] rounded-lg border border-purple-200 dark:border-slate-700 bg-purple-50/30 dark:bg-slate-800 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                {opt.voters.length > 0 && (
                  <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 shrink-0 px-1">
                    {opt.voters.length}v
                  </span>
                )}
                {pollOptions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePollOption(opt.id)}
                    className="p-1 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer shrink-0"
                    title="Remove option"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <label className="flex items-center gap-2 text-[11px] font-medium text-purple-900 dark:text-purple-200 cursor-pointer pt-0.5">
        <input
          type="checkbox"
          checked={pinned}
          onChange={(e) => setPinned(e.target.checked)}
          className="w-3.5 h-3.5 rounded text-purple-700 focus:ring-purple-500 cursor-pointer"
        />
        <span>Pin to top of Notice Board</span>
      </label>

      {formError && (
        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">{formError}</p>
      )}

      <div className="flex items-center gap-1.5 pt-0.5">
        <button
          type="button"
          onClick={resetComposer}
          className="px-2.5 py-1.5 rounded-lg border border-purple-200 dark:border-slate-700 text-purple-800 dark:text-purple-300 text-[11px] font-semibold hover:bg-purple-50 dark:hover:bg-slate-800 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-1.5 rounded-lg bg-purple-800 hover:bg-purple-900 text-white text-[11px] font-bold cursor-pointer"
        >
          {editingId ? 'Save Changes' : `Publish ${TYPE_META[itemType].label}`}
        </button>
      </div>
    </form>
  );

  const renderItemCard = (ann: CampusAnnouncement) => {
    const itemTypeKey: NoticeBoardItemType = ann.type || 'notice';
    const meta = TYPE_META[itemTypeKey] || TYPE_META.notice;
    const options = ann.pollOptions || [];
    const totalVotes = options.reduce((sum, o) => sum + (o.voters?.length || 0), 0);
    const normalizedEmail = currentUserEmail.trim().toLowerCase();

    return (
      <div
        key={ann.id}
        className={`rounded-xl bg-white/90 dark:bg-slate-900/80 border space-y-1.5 transition-colors ${
          meta.cardTintClass
        } ${isSidebar ? 'p-2.5' : 'p-3.5 rounded-2xl'}`}
      >
        {/* Top Meta & Admin Actions */}
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {role === 'admin' && onUpdateAnnouncement ? (
              <div className="relative inline-flex items-center">
                <select
                  aria-label={`Change type for ${ann.title}`}
                  value={itemTypeKey}
                  onChange={(e) =>
                    handleQuickTypeChange(ann, e.target.value as NoticeBoardItemType)
                  }
                  className={`text-[10px] font-bold pl-2 pr-5 py-0.5 rounded-md border appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500 ${meta.badgeClass}`}
                >
                  <option value="notice">Notice</option>
                  <option value="update">Update</option>
                  <option value="alert">Alert</option>
                  <option value="poll">Poll</option>
                </select>
                <ChevronDown className="w-2.5 h-2.5 pointer-events-none absolute right-1.5 opacity-70" />
              </div>
            ) : (
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${meta.badgeClass}`}
              >
                {meta.icon}
                <span>{meta.label}</span>
              </span>
            )}

            {ann.pinned && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800 px-1.5 py-0.5 rounded-md">
                <Pin className="w-2.5 h-2.5 fill-amber-500 text-amber-600" />
                <span>Pinned</span>
              </span>
            )}

            {ann.updatedAt && (
              <span className="text-[9px] text-purple-500 dark:text-purple-400 font-mono">
                Edited
              </span>
            )}
          </div>

          {role === 'admin' && (
            <div className="flex items-center gap-0.5 shrink-0">
              {onTogglePin && (
                <button
                  type="button"
                  onClick={() => onTogglePin(ann.id)}
                  title={ann.pinned ? 'Unpin item' : 'Pin to top'}
                  className={`p-1 rounded-md cursor-pointer transition-colors ${
                    ann.pinned
                      ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/50'
                      : 'text-purple-500 hover:text-amber-600 hover:bg-purple-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Pin className="w-3 h-3" />
                </button>
              )}
              {onUpdateAnnouncement && (
                <button
                  type="button"
                  onClick={() => openEditForm(ann)}
                  title="Edit notice board item"
                  className="p-1 rounded-md text-purple-600 dark:text-purple-400 hover:text-purple-900 hover:bg-purple-100/70 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}
              {onDeleteAnnouncement && (
                <button
                  type="button"
                  onClick={() => onDeleteAnnouncement(ann.id)}
                  title="Delete notice board item"
                  className="p-1 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Title & Message */}
        <p className="font-bold text-xs text-purple-950 dark:text-purple-100 leading-snug">
          {ann.title}
        </p>
        {ann.message && (
          <p className="text-[11px] text-purple-800/85 dark:text-purple-300 leading-normal whitespace-pre-line">
            {ann.message}
          </p>
        )}

        {/* Interactive Poll Options */}
        {itemTypeKey === 'poll' && options.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {options.map((opt) => {
              const voteCount = opt.voters?.length || 0;
              const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              const hasVoted = Boolean(
                normalizedEmail &&
                  opt.voters?.some((v) => v.toLowerCase() === normalizedEmail)
              );

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onVotePoll && onVotePoll(ann.id, opt.id)}
                  disabled={!onVotePoll}
                  className={`relative w-full text-left rounded-lg border overflow-hidden transition-all cursor-pointer disabled:cursor-default ${
                    hasVoted
                      ? 'border-purple-500 dark:border-purple-400 ring-1 ring-purple-400/50'
                      : 'border-purple-200/80 dark:border-slate-700 hover:border-purple-400'
                  } bg-purple-50/40 dark:bg-slate-800/70`}
                >
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <rect
                      x="0"
                      y="0"
                      width={`${pct}%`}
                      height="100%"
                      className={
                        hasVoted
                          ? 'fill-purple-200/80 dark:fill-purple-700/50 transition-all duration-300'
                          : 'fill-purple-100/70 dark:fill-slate-700/50 transition-all duration-300'
                      }
                    />
                  </svg>
                  <div className="relative z-10 flex items-center justify-between gap-2 px-2.5 py-1.5 text-[11px]">
                    <span className="flex items-center gap-1.5 font-semibold text-purple-950 dark:text-purple-100 min-w-0">
                      {hasVoted && (
                        <Check className="w-3 h-3 text-purple-700 dark:text-purple-300 shrink-0" />
                      )}
                      <span className="truncate">{opt.label}</span>
                    </span>
                    <span className="font-mono text-[10px] font-bold text-purple-800 dark:text-purple-300 shrink-0 tabular-nums">
                      {pct}% ({voteCount})
                    </span>
                  </div>
                </button>
              );
            })}
            <div className="flex items-center justify-between text-[10px] text-purple-600/80 dark:text-purple-400 pt-0.5">
              <span>
                {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} cast
              </span>
              <span>Click an option to vote or change vote</span>
            </div>
          </div>
        )}

        {!isSidebar && (
          <div className="text-[10px] text-purple-500 dark:text-purple-400 pt-0.5 flex items-center justify-between">
            <span>Posted by {ann.author}</span>
            <span>{new Date(ann.updatedAt || ann.createdAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    );
  };

  if (isSidebar) {
    return (
      <div className="p-3 bg-gradient-to-br from-purple-50 to-indigo-50/60 dark:from-slate-800/80 dark:to-purple-950/40 rounded-2xl border border-purple-200/80 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-950 dark:text-purple-300 flex items-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
            <span>Notice Board</span>
          </span>
          {role === 'admin' && onAddAnnouncement ? (
            <button
              type="button"
              onClick={() => (isComposerOpen ? resetComposer() : openCreateForm())}
              className="text-[10px] font-bold text-purple-800 dark:text-purple-200 bg-purple-200/70 dark:bg-purple-900/70 hover:bg-purple-300 px-2 py-0.5 rounded cursor-pointer flex items-center gap-0.5"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>{isComposerOpen ? 'Close' : 'Post'}</span>
            </button>
          ) : (
            <span className="text-[9px] font-mono font-semibold text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-950 px-1.5 py-0.5 rounded">
              Official
            </span>
          )}
        </div>

        {composerForm}

        {announcements.length === 0 ? (
          <p className="text-[11px] text-purple-700/70 dark:text-purple-400 italic">
            No active campus notices at this time.
          </p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5 momentum-scroll">
            {announcements.map(renderItemCard)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xs">
      <div className="p-4 border-b border-purple-50 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center">
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-purple-950 dark:text-purple-100">
              Campus Notice Board
            </h2>
            <p className="text-[10px] text-purple-500 dark:text-purple-400">
              Official notices, campus updates, alerts & student polls
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-purple-50/70 dark:bg-slate-800 p-1 rounded-xl border border-purple-100 dark:border-slate-700">
            {(['all', 'notice', 'update', 'alert', 'poll'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setTypeFilter(f)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold capitalize transition-colors cursor-pointer ${
                  typeFilter === f
                    ? 'bg-purple-800 text-white shadow-2xs'
                    : 'text-purple-700 dark:text-purple-300 hover:bg-purple-100/70 dark:hover:bg-slate-700'
                }`}
              >
                {f === 'all' ? `All (${announcements.length})` : TYPE_META[f].label}
              </button>
            ))}
          </div>

          {role === 'admin' && onAddAnnouncement && (
            <button
              type="button"
              onClick={() => (isComposerOpen ? resetComposer() : openCreateForm())}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-800 hover:bg-purple-900 text-white text-xs font-bold shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isComposerOpen ? 'Close' : 'New Post'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-3.5 space-y-3">
        {composerForm}

        {visibleAnnouncements.length === 0 ? (
          <div className="p-6 text-center">
            <Megaphone className="w-8 h-8 mx-auto mb-2 text-purple-300 opacity-60" />
            <p className="text-xs font-semibold text-purple-950 dark:text-purple-200">
              No {typeFilter === 'all' ? 'notice board items' : `${TYPE_META[typeFilter].label.toLowerCase()}s`} yet
            </p>
            <p className="text-[11px] text-purple-500 dark:text-purple-400 mt-0.5">
              {role === 'admin'
                ? 'Click New Post above to publish a notice, update, alert, or poll.'
                : 'Check back later for official Students’ Council notices and polls.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {visibleAnnouncements.map(renderItemCard)}
          </div>
        )}
      </div>
    </div>
  );
};
