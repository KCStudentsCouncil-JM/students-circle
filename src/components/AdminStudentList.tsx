import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import { Users, ArrowLeft, CheckCircle, XCircle, Trash2, Search, UserCheck, ShieldCheck } from 'lucide-react';

interface AdminStudentListProps {
  allUsers: UserProfile[];
  currentUserEmail?: string;
  onApprove: (email: string) => void;
  onReject: (email: string) => void;
  onRemove: (email: string) => void;
  onBack: () => void;
}

export const AdminStudentList: React.FC<AdminStudentListProps> = ({ 
  allUsers,
  currentUserEmail,
  onApprove, 
  onReject, 
  onRemove, 
  onBack 
}) => {
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return allUsers.filter(u => {
      if (u.status !== tab) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchesName = (u.name || '').toLowerCase().includes(q);
        const matchesEmail = (u.email || '').toLowerCase().includes(q);
        const matchesMajor = (u.major || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesMajor) return false;
      }
      return true;
    });
  }, [allUsers, tab, search]);

  const pendingCount = allUsers.filter(u => u.status === 'pending').length;
  const approvedCount = allUsers.filter(u => u.status === 'approved').length;
  const rejectedCount = allUsers.filter(u => u.status === 'rejected').length;

  return (
    <div className="flex-1 bg-[#faf8fc] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col h-full overflow-hidden select-none">
      {/* Top Bar */}
      <div className="p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-purple-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-purple-50 dark:hover:bg-slate-800 text-purple-700 dark:text-purple-300 rounded-xl transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-purple-950 dark:text-purple-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" /> 
              <span>Student Account Verification</span>
            </h1>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Manage enrollment verifications and campus portal access
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1.5 bg-purple-50 dark:bg-slate-800 p-1 rounded-xl border border-purple-100 dark:border-slate-700 self-start sm:self-auto">
          <button 
            onClick={() => setTab('pending')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              tab === 'pending' 
                ? 'bg-white dark:bg-slate-700 text-purple-950 dark:text-white shadow-2xs' 
                : 'text-purple-600 dark:text-purple-300 hover:text-purple-950'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button 
            onClick={() => setTab('approved')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              tab === 'approved' 
                ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-2xs' 
                : 'text-purple-600 dark:text-purple-300 hover:text-purple-950'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button 
            onClick={() => setTab('rejected')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              tab === 'rejected' 
                ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 shadow-2xs' 
                : 'text-purple-600 dark:text-purple-300 hover:text-purple-950'
            }`}
          >
            Declined ({rejectedCount})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-purple-100 dark:border-slate-800">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search user by name, email, or stream..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full pl-9 pr-3 py-2 text-xs border border-purple-200 dark:border-slate-700 rounded-xl bg-purple-50/50 dark:bg-slate-800 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400" 
          />
        </div>
      </div>

      {/* User Roster Grid */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {filtered.length === 0 ? (
          <div className="text-center text-purple-500 dark:text-purple-400 mt-16 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-purple-100 dark:border-slate-800 max-w-md mx-auto">
            <UserCheck className="w-10 h-10 mx-auto mb-2 text-purple-400 opacity-60" />
            <p className="font-semibold text-sm">No {tab} users found</p>
            <p className="text-xs text-purple-400 mt-1">
              {search ? 'Try clearing your search query.' : `There are currently no accounts in the ${tab} queue.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(user => {
              const isSelf = currentUserEmail && user.email.toLowerCase() === currentUserEmail.toLowerCase();
              return (
                <div 
                  key={user.email} 
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-purple-200 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all space-y-3"
                >
                  <div className="flex items-start gap-3">
                    {user.photo ? (
                      <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-xl object-cover border border-purple-200 dark:border-slate-700 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center shrink-0 text-sm">
                        {(user.name || 'U').charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-sm text-purple-950 dark:text-purple-100 truncate">{user.name}</h3>
                        {user.role === 'admin' && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                            <ShieldCheck className="w-2.5 h-2.5" /> Staff
                          </span>
                        )}
                        {isSelf && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-mono truncate">{user.email}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {user.title || `${user.major || 'Student'} · ${user.classYear || 'KC'}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-purple-100 dark:border-slate-800">
                    {tab === 'pending' ? (
                      <>
                        <button 
                          onClick={() => onApprove(user.email)} 
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> 
                          <span>Approve</span>
                        </button>
                        <button 
                          onClick={() => onReject(user.email)} 
                          className="bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-400 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer border border-rose-200 dark:border-rose-900"
                          title="Reject Verification"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : tab === 'rejected' ? (
                      <>
                        <button 
                          onClick={() => onApprove(user.email)} 
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> 
                          <span>Re-Approve</span>
                        </button>
                        <button 
                          onClick={() => onRemove(user.email)} 
                          className="bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-400 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer border border-rose-200 dark:border-rose-900"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </>
                    ) : isSelf ? (
                      <div className="w-full text-center text-[11px] font-semibold text-purple-600 dark:text-purple-400 py-2">
                        Active Admin Session
                      </div>
                    ) : (
                      <button 
                        onClick={() => onRemove(user.email)} 
                        className="w-full bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-400 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-rose-200 dark:border-rose-900"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> 
                        <span>Revoke Access</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};