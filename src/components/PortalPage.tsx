import React, { useState } from 'react';
import { FeedbackReport, CampusEvent } from '../types';
import { GraduationCap, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';

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
    if (adminSecret.trim() === ADMIN_KEY) {
      setAdminError('');
      setShowAdminPrompt(false);
      onSignInClick('admin');
    } else {
      setAdminError('Invalid Secret Key!! HAHA YOU THOUGHT, text Dylon');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors select-none text-slate-800 dark:text-slate-100">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-36 h-36 sm:w-40 sm:h-40 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto shadow-xl overflow-hidden border border-purple-100 dark:border-slate-800 p-1.5 transition-transform hover:scale-105 duration-200">
            <img 
              src={`${import.meta.env.BASE_URL}KCBCALogo.png`} 
              alt="KC Students Circle Logo" 
              className="w-full h-full object-contain rounded-2xl" 
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-purple-950 dark:text-purple-100 tracking-tight">
              KC Students Circle
            </h1>
            <p className="text-xs sm:text-sm text-purple-700/80 dark:text-purple-300 mt-1">
              University Student Voice, Initiatives & Leadership Hub
            </p>
          </div>
        </div>

        {/* Auth Buttons Box */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-purple-200 dark:border-slate-800 shadow-xl space-y-4">
          
          <button
            onClick={() => onSignInClick('student')}
            className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-purple-100 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 bg-purple-50/40 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-slate-800 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-sm sm:text-base text-purple-950 dark:text-purple-100">Login as Student</h3>
                <p className="text-xs text-purple-600 dark:text-purple-400">Submit reports, upvote proposals & RSVP</p>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-700 dark:text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Continue →
            </span>
          </button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-100 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-mono text-purple-400 dark:text-purple-500">
                OR
              </span>
            </div>
          </div>

          {!showAdminPrompt ? (
            <button
              onClick={() => setShowAdminPrompt(true)}
              className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">Login as Campus Admin</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Triage issues, verify student profiles & manage</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Verify →
              </span>
            </button>
          ) : (
            <form onSubmit={handleAdminVerify} className="space-y-3 animate-in fade-in slide-in-from-top-2 p-3 bg-purple-50/30 dark:bg-slate-800/50 rounded-2xl border border-purple-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Admin Secret Key</label>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">Key: Breast Cancer POPS</span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    placeholder="Text Dylon for key"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    autoFocus
                  />
                </div>
                {adminError && <p className="text-xs text-rose-600 font-bold">{adminError}</p>}
              </div>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowAdminPrompt(false)} 
                  className="px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-purple-950 dark:bg-purple-800 hover:bg-black text-white text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Verify & Continue
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Live Campus Stats summary */}
        <div className="flex items-center justify-around py-3 px-4 bg-white/70 dark:bg-slate-900/70 rounded-2xl border border-purple-100 dark:border-slate-800 text-center text-xs">
          <div>
            <span className="block font-bold text-purple-950 dark:text-purple-200 font-mono">{reports.length}</span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400">Total Reports</span>
          </div>
          <div className="h-6 w-px bg-purple-200 dark:bg-slate-800" />
          <div>
            <span className="block font-bold text-pink-600 dark:text-pink-400 font-mono">
              {reports.filter(r => r.type === 'initiative').length}
            </span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400">Initiatives</span>
          </div>
          <div className="h-6 w-px bg-purple-200 dark:bg-slate-800" />
          <div>
            <span className="block font-bold text-emerald-600 dark:text-emerald-400 font-mono">{events.length}</span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400">Campus Events</span>
          </div>
        </div>
      </div>
    </div>
  );
};