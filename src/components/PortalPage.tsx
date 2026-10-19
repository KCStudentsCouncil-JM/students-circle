import React, { useState } from 'react';
import { FeedbackReport, AuthUser, CampusEvent } from '../types';
import { GoogleAccountPickerModal } from './GoogleAccountPickerModal';
import { 
  GraduationCap, 
  ShieldCheck, 
  Ribbon, 
  ArrowRight, 
  MapPin, 
  AlertTriangle, 
  Calendar,
  Users,
  KeyRound
} from 'lucide-react';

interface PortalPageProps {
  reports: FeedbackReport[];
  events?: CampusEvent[];
  onSignIn: (user: AuthUser, initialSelectedId?: string) => void;
}

export const PortalPage: React.FC<PortalPageProps> = ({
  reports,
  events = [],
  onSignIn,
}) => {
  const [rightTab, setRightTab] = useState<'issues' | 'events'>('issues');
  const [previewEvent, setPreviewEvent] = useState<CampusEvent | null>(null);
  const [previewItem, setPreviewItem] = useState<FeedbackReport | null>(null);
  
  // Google Login Modal State
  const [isGooglePickerOpen, setIsGooglePickerOpen] = useState(false);
  const [loginTargetRole, setLoginTargetRole] = useState<'student' | 'admin'>('student');

  // Admin Secret Key State
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminSecret, setAdminSecret] = useState('');
  const [adminError, setAdminError] = useState('');
  const ADMIN_KEY = "CAMPUS2026"; 

  const openLogin = (role: 'student' | 'admin') => {
    setLoginTargetRole(role);
    setIsGooglePickerOpen(true);
  };

  const handleAdminVerify = () => {
    if (adminSecret === ADMIN_KEY) {
      setShowAdminPrompt(false);
      setAdminError('');
      setAdminSecret('');
      openLogin('admin'); 
    } else {
      setAdminError('Invalid Secret Key. Access Denied.');
    }
  };

  const urgentReports = reports.filter((r) => r.urgency === 'high' || r.status === 'open');

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 24) return `${Math.max(1, diffHours)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] text-slate-800 flex flex-col select-none">
      {/* Top Portal Navigation Bar */}
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-purple-100 px-4 sm:px-8 lg:px-10 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-700 via-purple-800 to-pink-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Ribbon className="w-4 h-4 text-pink-200" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-purple-950">
                Campus Feedback Assistant
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-purple-700/80 truncate max-w-[220px] sm:max-w-none">
              University Student Voice & Leadership Hub
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Hub */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 flex flex-col justify-center">
        {/* Hero Title */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8 space-y-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-purple-950 tracking-tight leading-tight">
            Sign In to Report, Endorse, or Triage Campus Feedback
          </h1>
          <p className="text-xs sm:text-sm text-purple-900/70 max-w-xl mx-auto leading-relaxed">
            Submit facility reports, track proposals, or triage urgent student matters. All accounts require Google verification.
          </p>
        </div>

        {/* 2-Column Gateway Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Role Authentication Gateway */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-950/70 pb-1">
              Select Your Campus Role
            </h2>

            {/* Student Role Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-purple-200/90 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-pink-600 flex items-center justify-center text-white shadow-xs shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-purple-950 tracking-tight">
                    Sign In as Enrolled Student
                  </h3>
                  <p className="text-[11px] text-purple-700/80">
                    Report defects, pitch initiatives, endorse ideas & RSVP to events
                  </p>
                </div>
              </div>

              <button
                onClick={() => openLogin('student')}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-800 to-pink-700 hover:from-purple-900 hover:to-pink-800 text-white text-xs font-semibold py-3 px-4 rounded-xl shadow-xs transition-all active:scale-[0.99] border border-purple-900 cursor-pointer touch-manipulation"
              >
                <span>Verify & Enter as Student</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Campus Administrator Role Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-purple-200/90 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-700 shadow-xs shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-purple-950">
                    Sign In as Campus Administrator
                  </h3>
                  <p className="text-[11px] text-purple-700/70">
                    Triage queue, assign crews & publish official updates
                  </p>
                </div>
              </div>

              {/* ADMIN SECRET KEY LOGIC */}
              {showAdminPrompt ? (
                <div className="space-y-2 mb-2 animate-in fade-in slide-in-from-top-2">
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="Enter Admin Secret Key..."
                      value={adminSecret}
                      onChange={(e) => setAdminSecret(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-slate-50"
                      onKeyDown={(e) => e.key === 'Enter' && handleAdminVerify()}
                    />
                  </div>
                  {adminError && <p className="text-[10px] text-rose-600 font-bold px-1">{adminError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleAdminVerify}
                      className="flex-1 bg-purple-900 hover:bg-purple-950 text-white text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Verify Key
                    </button>
                    <button
                      onClick={() => { setShowAdminPrompt(false); setAdminError(''); setAdminSecret(''); }}
                      className="px-3 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAdminPrompt(true)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-900 to-slate-900 hover:from-purple-950 hover:to-black text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-all active:scale-[0.99] border border-purple-950 cursor-pointer touch-manipulation"
                >
                  <span>Enter Admin Secret Key</span>
                  <ArrowRight className="w-3.5 h-3.5 text-pink-400" />
                </button>
              )}
            </div>
          </div>

          {/* Column 2: Live Feed of Urgent Issues OR Upcoming School Events */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-purple-100 flex-wrap gap-2">
              <div className="flex items-center gap-1 p-0.5 bg-purple-100/70 rounded-xl">
                <button
                  onClick={() => setRightTab('issues')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    rightTab === 'issues' ? 'bg-white text-purple-950 shadow-2xs' : 'text-purple-700'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-pink-600" />
                  <span>Urgent Issues</span>
                </button>
                <button
                  onClick={() => setRightTab('events')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    rightTab === 'events' ? 'bg-white text-purple-950 shadow-2xs' : 'text-purple-700'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-purple-700" />
                  <span>Upcoming Events</span>
                </button>
              </div>
            </div>

            {/* View A: Urgent Reports */}
            {rightTab === 'issues' && (
              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {urgentReports.length === 0 ? (
                  <div className="p-8 text-center text-purple-600 bg-white rounded-xl border border-purple-100">
                    No open issues currently. The campus is all clear!
                  </div>
                ) : (
                  urgentReports.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setPreviewItem(item)}
                      className="bg-white rounded-xl p-4 border border-purple-100 hover:border-purple-300 shadow-xs transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="font-mono font-semibold text-purple-900">#{item.id}</span>
                          <span className="text-purple-300">·</span>
                          <span className="capitalize text-purple-700 font-medium">{item.category.replace('-', ' ')}</span>
                        </div>
                        {item.urgency === 'high' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                            <AlertTriangle className="w-3 h-3" /> Urgent
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-xs text-purple-950 leading-snug line-clamp-1 mb-1">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">{item.description}</p>
                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-purple-50">
                        <div className="flex items-center gap-1 text-purple-800/70">
                          <MapPin className="w-3 h-3" /> {item.location}
                        </div>
                        <span className="text-purple-600 font-mono text-[10px]">{formatRelativeTime(item.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* View B: Upcoming Events */}
            {rightTab === 'events' && (
              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                 {events.length === 0 ? (
                  <div className="p-8 text-center text-purple-600 bg-white rounded-xl border border-purple-100">
                    No upcoming events scheduled yet.
                  </div>
                ) : (
                  events.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => setPreviewEvent(evt)}
                      className="bg-white rounded-xl p-4 border border-purple-100 hover:border-purple-300 shadow-xs transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono text-purple-500">{evt.date} · {evt.time}</span>
                          </div>
                          <h4 className="font-bold text-xs text-purple-950 leading-snug line-clamp-1 mb-1">{evt.title}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2">{evt.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-purple-700">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {evt.location}</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {evt.rsvps} Attending</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Preview for an Urgent Issue */}
        {previewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-purple-200 shadow-2xl max-w-lg w-full flex flex-col p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between border-b border-purple-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-purple-950">{previewItem.title}</h3>
                  <p className="text-xs text-purple-600 mt-1">{previewItem.location}</p>
                </div>
                <button onClick={() => setPreviewItem(null)} className="text-purple-400 hover:text-purple-900 p-1 cursor-pointer">✕</button>
              </div>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-48 overflow-y-auto">{previewItem.description}</p>
              <div className="pt-2 border-t border-purple-100 flex justify-end gap-2">
                <button onClick={() => setPreviewItem(null)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-100 text-purple-900 hover:bg-purple-200">Close</button>
                <button onClick={() => { setPreviewItem(null); openLogin('student'); }} className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-purple-900 text-white hover:bg-purple-950">Sign In to View</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Preview for an Event */}
        {previewEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-purple-200 shadow-2xl max-w-lg w-full flex flex-col p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
               <div className="flex items-start justify-between border-b border-purple-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-purple-950">{previewEvent.title}</h3>
                  <p className="text-xs text-purple-600 mt-1">{previewEvent.date} · {previewEvent.location}</p>
                </div>
                <button onClick={() => setPreviewEvent(null)} className="text-purple-400 hover:text-purple-900 p-1 cursor-pointer">✕</button>
              </div>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-48 overflow-y-auto">{previewEvent.description}</p>
              <div className="pt-2 border-t border-purple-100 flex justify-end gap-2">
                <button onClick={() => setPreviewEvent(null)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-100 text-purple-900 hover:bg-purple-200">Close</button>
                <button onClick={() => { setPreviewEvent(null); openLogin('student'); }} className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-purple-900 text-white hover:bg-purple-950">Sign In to RSVP</button>
              </div>
            </div>
          </div>
        )}

        {/* Google Auth Modal */}
        <GoogleAccountPickerModal
          isOpen={isGooglePickerOpen}
          onClose={() => setIsGooglePickerOpen(false)}
          targetRole={loginTargetRole}
          onSelectAccount={(acc) => {
            onSignIn(acc);
            setIsGooglePickerOpen(false);
          }}
        />
      </main>
    </div>
  );
};