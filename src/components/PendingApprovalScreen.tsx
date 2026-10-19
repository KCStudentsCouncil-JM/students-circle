import React, { useState } from 'react';
import { AuthUser, PendingStudent } from '../types';
import { Ribbon, ShieldAlert, LogOut, CheckCircle2 } from 'lucide-react';

interface Props {
  currentUser: AuthUser;
  pendingStudents: PendingStudent[];
  onSubmit: (student: PendingStudent) => void;
  onSignOut: () => void;
}

export const PendingApprovalScreen: React.FC<Props> = ({ currentUser, pendingStudents, onSubmit, onSignOut }) => {
  const [name, setName] = useState(currentUser.name);
  const [major, setMajor] = useState('');
  const [classYear, setClassYear] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const hasPending = pendingStudents.some(s => s.email === currentUser.email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: currentUser.email,
      name,
      email: currentUser.email,
      major,
      classYear,
      requestedAt: new Date().toISOString()
    });
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-purple-200 shadow-xl space-y-6 text-center">
        <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <div>
          <h1 className="text-xl font-bold text-purple-950">Account Approval Required</h1>
          <p className="text-xs text-purple-700/80 mt-1">
            To prevent unauthorized access, your account must be verified by a campus administrator.
          </p>
        </div>

        {hasPending || isSubmitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-sm space-y-2">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
            <p className="font-bold">Request Submitted</p>
            <p className="text-xs">Your account is currently pending admin approval. Please check back later.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-semibold text-purple-900 block mb-1">Full Name</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2.5 text-xs border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-purple-900 block mb-1">Email Address</label>
              <input disabled type="text" value={currentUser.email} className="w-full p-2.5 text-xs border border-purple-200 rounded-lg bg-slate-50 text-slate-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-purple-900 block mb-1">Major</label>
                <input required type="text" value={major} onChange={e => setMajor(e.target.value)} placeholder="e.g. Computer Science" className="w-full p-2.5 text-xs border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-purple-900 block mb-1">Class Year</label>
                <input required type="text" value={classYear} onChange={e => setClassYear(e.target.value)} placeholder="e.g. Class of '26" className="w-full p-2.5 text-xs border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-purple-800 hover:bg-purple-900 text-white font-bold text-sm rounded-xl transition-all shadow-md">
              Submit for Approval
            </button>
          </form>
        )}

        <button onClick={onSignOut} className="text-xs text-rose-600 font-semibold flex items-center justify-center gap-1 w-full hover:underline mt-2">
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </div>
  );
};