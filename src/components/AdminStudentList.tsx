import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import { Users, ArrowLeft, CheckCircle, XCircle, Trash2, Search } from 'lucide-react';

interface AdminStudentListProps {
  allUsers: UserProfile[];
  onApprove: (email: string) => void;
  onReject: (email: string) => void;
  onRemove: (email: string) => void;
  onBack: () => void;
}

export const AdminStudentList: React.FC<AdminStudentListProps> = ({ allUsers, onApprove, onReject, onRemove, onBack }) => {
  const [tab, setTab] = useState<'pending' | 'approved'>('pending');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return allUsers.filter(u => {
      if (tab === 'pending' && u.status !== 'pending') return false;
      if (tab === 'approved' && u.status !== 'approved') return false;
      if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allUsers, tab, search]);

  return (
    <div className="flex-1 bg-[#faf8fc] flex flex-col h-full overflow-hidden">
      <div className="p-4 bg-white border-b border-purple-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-purple-50 rounded-lg"><ArrowLeft className="w-5 h-5 text-purple-700" /></button>
          <h1 className="text-lg font-bold text-purple-950 flex items-center gap-2"><Users className="w-5 h-5" /> Manage Students</h1>
        </div>
        <div className="flex gap-2 bg-purple-50 p-1 rounded-xl">
          <button onClick={() => setTab('pending')} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${tab === 'pending' ? 'bg-white text-purple-950 shadow' : 'text-purple-600'}`}>Pending ({allUsers.filter(u => u.status === 'pending').length})</button>
          <button onClick={() => setTab('approved')} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${tab === 'approved' ? 'bg-white text-emerald-950 shadow' : 'text-emerald-600'}`}>Approved ({allUsers.filter(u => u.status === 'approved').length})</button>
        </div>
      </div>

      <div className="p-4 bg-white border-b border-purple-100">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-1.5 text-xs border border-purple-200 rounded-lg" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {filtered.length === 0 ? <p className="text-center text-purple-500 mt-10">No users found.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(user => (
              <div key={user.email} className="bg-white p-4 rounded-2xl border border-purple-200 shadow-sm space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-purple-950">{user.name}</h3>
                  <p className="text-xs text-purple-600 font-mono">{user.email}</p>
                  <p className="text-xs text-slate-500 mt-1">{user.major} · {user.classYear}</p>
                </div>
                <div className="flex gap-2 pt-2 border-t border-purple-100">
                  {tab === 'pending' ? (
                    <>
                      <button onClick={() => onApprove(user.email)} className="flex-1 bg-emerald-600 text-white text-xs font-bold py-1.5 rounded-lg flex justify-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Approve</button>
                      <button onClick={() => onReject(user.email)} className="bg-rose-50 text-rose-700 text-xs font-bold py-1.5 px-3 rounded-lg"><XCircle className="w-3.5 h-3.5" /></button>
                    </>
                  ) : (
                    <button onClick={() => onRemove(user.email)} className="w-full bg-rose-50 text-rose-700 text-xs font-bold py-1.5 rounded-lg flex justify-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Revoke Access</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};