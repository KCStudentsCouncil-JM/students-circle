import React, { useState } from 'react';
import { FeedbackReport, CampusEvent } from '../types';
import { GraduationCap, ShieldCheck, KeyRound } from 'lucide-react';

interface PortalPageProps {
  reports: FeedbackReport[];
  events?: CampusEvent[];
  onSignInClick: (role: 'student' | 'admin') => void;
  isGooglePickerOpen: boolean;
  onCloseGooglePicker: () => void;
}

export const PortalPage: React.FC<PortalPageProps> = ({
  reports, events = [], onSignInClick, isGooglePickerOpen, onCloseGooglePicker
}) => {
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminSecret, setAdminSecret] = useState('');
  const [adminError, setAdminError] = useState('');
  const ADMIN_KEY = "CAMPUS2026";

  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminSecret === ADMIN_KEY) {
      setAdminError('');
      setShowAdminPrompt(false);
      onSignInClick('admin');
    } else {
      setAdminError('Invalid Secret Key.');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        
       {/* Header */}
        <div className="text-center space-y-2">
          {/* NEW LOGO IMAGE */}
          <div className="w-40 h-40 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-lg overflow-hidden border border-purple-100 p-1">
            <img 
              src={`${import.meta.env.BASE_URL}SCBCALogo.jpg`} 
              alt="KC Students Circle Logo" 
              className="w-full h-full object-contain rounded-xl" 
            />
          </div>
          <h1 className="text-2xl font-extrabold text-purple-950">KC Students Circle</h1>
          <p className="text-sm text-purple-700/80">University Student Voice & Leadership Hub</p>
        </div>
        {/* Auth Buttons */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-200 shadow-xl space-y-4">
          
          <button
            onClick={() => onSignInClick('student')}
            className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-purple-100 hover:border-purple-400 bg-purple-50/30 hover:bg-purple-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-purple-950">Login as Student</h3>
                <p className="text-xs text-purple-600">Submit reports, endorse & RSVP</p>
              </div>
            </div>
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-purple-100"></div></div>
            <div className="relative flex justify-center"><span className="bg-white px-2 text-xs text-purple-400">OR</span></div>
          </div>

          {!showAdminPrompt ? (
            <button
              onClick={() => setShowAdminPrompt(true)}
              className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-900">Login as Admin</h3>
                  <p className="text-xs text-slate-500">Triage, approve students & manage</p>
                </div>
              </div>
            </button>
          ) : (
            <form onSubmit={handleAdminVerify} className="space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Admin Secret Key</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    placeholder="Enter admin secret..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {adminError && <p className="text-xs text-rose-600 font-bold">{adminError}</p>}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAdminPrompt(false)} className="px-3 py-2 text-xs font-bold text-slate-600">Cancel</button>
                <button type="submit" className="flex-1 bg-slate-900 text-white text-xs font-bold py-2 rounded-xl hover:bg-black">Verify & Login</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};