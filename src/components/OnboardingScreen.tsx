import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Ribbon, ArrowRight, ShieldAlert } from 'lucide-react';

interface Props {
  firebaseUser: any; // from firebase auth
  onSubmit: (profile: UserProfile) => void;
  onSignOut: () => void;
}

export const OnboardingScreen: React.FC<Props> = ({ firebaseUser, onSubmit, onSignOut }) => {
  const [name, setName] = useState(firebaseUser.displayName || '');
  const [major, setMajor] = useState('');
  const [classYear, setClassYear] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: firebaseUser.email,
      name,
      email: firebaseUser.email,
      role: 'student',
      status: 'pending',
      major,
      classYear,
      photo: firebaseUser.photoURL,
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-purple-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-md border border-purple-100 p-1 overflow-hidden">
            <img 
              src={`${import.meta.env.BASE_URL}KCBCALogo.png`} 
              alt="KC BCA Logo" 
              className="w-full h-full object-contain rounded-xl" 
            />
          </div>
          <h1 className="text-xl font-bold text-purple-950">Complete Your Student Profile</h1>
          <p className="text-xs text-purple-700/80">KC Students Circle · Verification Request</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-purple-900 block mb-1">Email</label>
            <input disabled type="text" value={firebaseUser.email} className="w-full p-2.5 text-xs border border-purple-200 rounded-lg bg-slate-50 text-slate-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-purple-900 block mb-1">Full Name</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2.5 text-xs border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-purple-900 block mb-1">Academic Focus (Major)</label>
            <input required type="text" value={major} onChange={e => setMajor(e.target.value)} placeholder="e.g. Computer Science" className="w-full p-2.5 text-xs border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-purple-900 block mb-1">Class Year</label>
            <input required type="text" value={classYear} onChange={e => setClassYear(e.target.value)} placeholder="e.g. Class of '26" className="w-full p-2.5 text-xs border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>

          <button type="submit" className="w-full py-3 bg-purple-800 hover:bg-purple-900 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2">
            Submit for Approval <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        
        <button onClick={onSignOut} className="text-xs text-rose-600 font-bold w-full text-center hover:underline">Cancel and Sign Out</button>
      </div>
    </div>
  );
};