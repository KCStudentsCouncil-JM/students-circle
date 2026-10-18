import React, { useState } from 'react';
import { FeedbackReport, RoleMode, AuthUser, CampusEvent, isBirthdayToday } from '../types';
import { INITIAL_EVENTS } from '../mockData';
import { UserProfileModal } from './UserProfileModal';
import { GoogleAccountPickerModal } from './GoogleAccountPickerModal';
import { 
  GraduationCap, 
  ShieldCheck, 
  AlertTriangle, 
  Ribbon, 
  ArrowRight, 
  ThumbsUp, 
  MapPin, 
  Clock, 
  Sparkles, 
  Wrench, 
  Wifi, 
  CheckCircle2, 
  Shield, 
  Building2,
  ChevronRight,
  User,
  Users,
  KeyRound,
  Calendar,
  Download,
  Cake,
  Edit3,
  Check
} from 'lucide-react';

interface PortalPageProps {
  reports: FeedbackReport[];
  events?: CampusEvent[];
  onSignIn: (user: AuthUser, initialSelectedId?: string) => void;
  onPreviewIssue?: (report: FeedbackReport) => void;
}

export const PortalPage: React.FC<PortalPageProps> = ({
  reports,
  events = INITIAL_EVENTS,
  onSignIn,
}) => {
  const [rightTab, setRightTab] = useState<'issues' | 'events'>('issues');
  const [previewEvent, setPreviewEvent] = useState<CampusEvent | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGooglePickerOpen, setIsGooglePickerOpen] = useState(false);

  const getTodayDateStr = () => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `2004-${m}-${day}`;
  };

  // Full student profile supporting Google account, photo, class, and birthday highlight
  const [studentProfile, setStudentProfile] = useState<AuthUser>({
    id: 'usr-student-01',
    name: 'Dylon Ocha',
    email: 'dylonnnaocha@gmail.com',
    role: 'student',
    title: "Engineering Researcher · Class of '26",
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
    birthday: getTodayDateStr(), // Today by default for birthday highlight!
    classYear: "Class of '26 (Junior)",
    major: 'Engineering',
    provider: 'google',
  });

  const [adminPersona, setAdminPersona] = useState<AuthUser>({
    id: 'usr-admin-01',
    name: 'Dean Sarah Jenkins',
    email: 's.jenkins@campus.edu',
    title: 'Dean of Student Affairs & Campus Operations',
    role: 'admin',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    provider: 'sso',
  });

  const [previewItem, setPreviewItem] = useState<FeedbackReport | null>(null);

  // Urgent and newly submitted issues
  const urgentReports = reports.filter((r) => r.urgency === 'high' || r.status === 'open');

  const handleStudentLogin = (targetReportId?: string, overrideUser?: AuthUser) => {
    onSignIn(overrideUser || studentProfile, targetReportId);
  };

  const handleAdminLogin = (targetReportId?: string) => {
    onSignIn(adminPersona, targetReportId);
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 24) {
      return `${Math.max(1, diffHours)}h ago`;
    }
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
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                BCA Month
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-purple-700/80 truncate max-w-[220px] sm:max-w-none">
              University Student Voice & Leadership Hub
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span className="font-medium text-[11px]">University SSO Portal</span>
          </div>
          <span className="text-purple-400">·</span>
          <span className="text-purple-900/70 font-mono text-[11px]">
            {reports.length} Reports Registered
          </span>
        </div>
      </header>

      {/* Main Content Hub */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 flex flex-col justify-center">
        {/* Hero Title & BCA Solemnity Intro */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-800 text-[11px] sm:text-xs font-semibold mb-1 shadow-2xs">
            <Ribbon className="w-3.5 h-3.5 text-pink-600 shrink-0" />
            <span>Breast Cancer Awareness Month · Campus Solidarity</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-purple-950 tracking-tight leading-tight">
            Sign In to Report, Endorse, or Triage Campus Feedback
          </h1>
          <p className="text-xs sm:text-sm text-purple-900/70 max-w-xl mx-auto leading-relaxed">
            Modeled after Apple's Feedback Assistant. Choose your role below to submit facility reports, track proposals, or triage urgent student matters.
          </p>
        </div>

        {/* 2-Column Gateway Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Column 1: Role Authentication Gateway (Left 5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-purple-950/70 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                <span>Select Your Campus Role</span>
              </h2>
              <span className="text-[11px] text-purple-600 font-medium">1-Click Fast Access</span>
            </div>

            {/* Student Role Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-purple-200/90 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-purple-700 to-pink-600 flex items-center justify-center text-white shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-5 h-5" />
                    {isBirthdayToday(studentProfile.birthday) && (
                      <span className="absolute -top-1 -right-1 bg-amber-400 text-purple-950 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-xs animate-bounce">
                        🎂
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-purple-950 tracking-tight">
                        Sign In as Enrolled Student
                      </h3>
                      {isBirthdayToday(studentProfile.birthday) && (
                        <span className="text-[10px] bg-gradient-to-r from-amber-400 to-pink-500 text-white font-extrabold px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Birthday Today!
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-purple-700/80">
                      Report defects, pitch initiatives, endorse ideas & RSVP to events
                    </p>
                  </div>
                </div>
              </div>

              {/* Google Sign-In Primary Action: Opens Authentic Google Chooser Modal */}
              <button
                type="button"
                onClick={() => setIsGooglePickerOpen(true)}
                className="w-full mb-3 flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2.5 px-4 rounded-xl border border-slate-300 shadow-2xs hover:shadow-xs transition-all active:scale-[0.99] cursor-pointer touch-manipulation"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Sign in with Google Account</span>
              </button>

              {/* Active Profile Bar with Photo, Class, and Birthday Edit button */}
              <div className="mb-3 p-2.5 sm:p-3 bg-purple-50/70 rounded-xl border border-purple-100 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img 
                      src={studentProfile.photo} 
                      alt={studentProfile.name}
                      className={`w-9 h-9 rounded-lg object-cover border-2 shrink-0 ${
                        isBirthdayToday(studentProfile.birthday) ? 'border-amber-400 ring-2 ring-pink-400' : 'border-purple-200'
                      }`}
                    />
                    {isBirthdayToday(studentProfile.birthday) && (
                      <span className="absolute -top-1 -right-1 text-[10px]">🎂</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-purple-950 truncate">{studentProfile.name}</span>
                      <span className="text-[10px] text-purple-600 font-mono">({studentProfile.classYear || "CS '26"})</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-purple-700/80 truncate">
                      <span>{studentProfile.email}</span>
                      {isBirthdayToday(studentProfile.birthday) && (
                        <span className="text-pink-600 font-bold ml-1">· 🎂 Birthday Today!</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="px-2.5 py-1.5 bg-white hover:bg-purple-100/80 text-purple-700 rounded-lg border border-purple-200 text-[11px] font-semibold transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                  title="Edit student profile, photo, class, and birthday"
                >
                  <Edit3 className="w-3 h-3 text-purple-500" />
                  <span>Profile</span>
                </button>
              </div>

              {/* Student Persona Presets */}
              <div className="space-y-2 mb-4 bg-purple-50/50 p-2.5 rounded-xl border border-purple-100 text-xs">
                <div className="flex items-center justify-between text-[11px] text-purple-900 font-medium">
                  <span className="text-purple-500 font-semibold uppercase text-[10px] tracking-wider">
                    Select Persona or Birthday Test:
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setStudentProfile({
                      id: 'usr-student-01',
                      name: 'Dylon Ocha',
                      email: 'dylonnnaocha@gmail.com',
                      role: 'student',
                      title: "Engineering Researcher · Class of '26",
                      photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
                      birthday: getTodayDateStr(), // Today for highlight!
                      classYear: "Class of '26 (Junior)",
                      major: 'Engineering',
                      provider: 'google',
                    })}
                    className={`text-left p-2 rounded-lg border text-[11px] transition-all cursor-pointer touch-manipulation flex items-center justify-between ${
                      studentProfile.name === 'Dylon Ocha'
                        ? 'bg-purple-700 text-white border-purple-800 font-semibold shadow-xs'
                        : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-100'
                    }`}
                  >
                    <span>Dylon Ocha</span>
                    <span className="text-[10px] bg-amber-400 text-purple-950 px-1.5 py-0.5 rounded-full font-bold ml-1">🎂 Today</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentProfile({
                      id: 'usr-student-02',
                      name: 'Elena Rostova',
                      email: 'e.rostova@campus.edu',
                      role: 'student',
                      title: "Computer Science '26 · Senate Rep",
                      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
                      birthday: '2004-12-15',
                      classYear: "Class of '26 (Junior)",
                      major: 'Computer Science',
                      provider: 'google',
                    })}
                    className={`text-left p-2 rounded-lg border text-[11px] transition-all cursor-pointer touch-manipulation ${
                      studentProfile.name === 'Elena Rostova'
                        ? 'bg-purple-700 text-white border-purple-800 font-semibold shadow-xs'
                        : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-100'
                    }`}
                  >
                    Elena Rostova (CS '26)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsGooglePickerOpen(true)}
                    className="sm:col-span-2 text-center p-2 rounded-lg border border-dashed border-purple-300 hover:border-purple-500 bg-white hover:bg-purple-50 text-[11px] font-semibold text-purple-700 transition-all cursor-pointer touch-manipulation flex items-center justify-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-purple-600" />
                    <span>Choose from All Google Accounts or Add Custom Student</span>
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleStudentLogin()}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-800 to-pink-700 hover:from-purple-900 hover:to-pink-800 text-white text-xs font-semibold py-3 px-4 rounded-xl shadow-xs transition-all active:scale-[0.99] border border-purple-900 cursor-pointer touch-manipulation"
              >
                <span>Enter Student Assistant as {studentProfile.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

              {/* Campus Administrator Role Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-purple-200/90 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-700 group-hover:bg-purple-900 group-hover:text-pink-300 transition-colors shadow-xs shrink-0">
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
                </div>

                {/* Admin Persona Presets */}
                <div className="space-y-2 mb-4 bg-purple-50/50 p-2.5 rounded-xl border border-purple-100 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-purple-900 font-medium">
                    <span className="text-purple-500 font-semibold uppercase text-[10px] tracking-wider">
                      Select Staff Persona:
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAdminPersona({
                        id: 'usr-admin-01',
                        name: 'Dean Sarah Jenkins',
                        email: 's.jenkins@campus.edu',
                        title: 'Dean of Student Affairs',
                        role: 'admin',
                        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
                        provider: 'sso',
                      })}
                      className={`text-left p-2 rounded-lg border text-[11px] transition-all cursor-pointer touch-manipulation ${
                        adminPersona.name === 'Dean Sarah Jenkins'
                          ? 'bg-purple-900 text-white border-purple-950 font-semibold shadow-xs'
                          : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-100'
                      }`}
                    >
                      Dean Sarah Jenkins
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminPersona({
                        id: 'usr-admin-02',
                        name: 'Marcus Vance',
                        email: 'm.vance@campus.edu',
                        title: 'Facilities & Network Lead',
                        role: 'admin',
                        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
                        provider: 'sso',
                      })}
                      className={`text-left p-2 rounded-lg border text-[11px] transition-all cursor-pointer touch-manipulation ${
                        adminPersona.name === 'Marcus Vance'
                          ? 'bg-purple-900 text-white border-purple-950 font-semibold shadow-xs'
                          : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-100'
                      }`}
                    >
                      Marcus Vance (IT/Ops)
                    </button>
                  </div>
                  <div className="pt-1 text-[11px] text-purple-800/80 truncate">
                    Authorizing: <strong className="text-purple-950">{adminPersona.name}</strong> ({adminPersona.title})
                  </div>
                </div>

              {/* Action Button */}
              <button
                onClick={() => handleAdminLogin()}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-900 to-slate-900 hover:from-purple-950 hover:to-black text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-all active:scale-[0.99] border border-purple-950"
              >
                <span>Launch Admin Triage Console</span>
                <ArrowRight className="w-3.5 h-3.5 text-pink-400" />
              </button>
            </div>

            {/* Breast Cancer Awareness Month Solidarity Footnote */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-pink-50/80 via-white to-purple-50/80 border border-pink-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
                <Ribbon className="w-4 h-4" />
              </div>
              <div className="text-[11px] text-purple-900/80">
                <span className="font-semibold text-pink-800 block">BCA Month Campus Support</span>
                Free wellness screenings and student health consultations available this month at the Student Health Pavilion.
              </div>
            </div>
          </div>

          {/* Column 2: Live Feed of Urgent Issues OR Upcoming School Events (Right 7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Tab Selector Header */}
            <div className="flex items-center justify-between pb-1 border-b border-purple-100 flex-wrap gap-2">
              <div className="flex items-center gap-1 p-0.5 bg-purple-100/70 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRightTab('issues')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer touch-manipulation ${
                    rightTab === 'issues'
                      ? 'bg-white text-purple-950 shadow-2xs'
                      : 'text-purple-700 hover:text-purple-950'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-pink-600" />
                  <span>Urgent Issues</span>
                  <span className="font-mono text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-full">
                    {urgentReports.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRightTab('events')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer touch-manipulation ${
                    rightTab === 'events'
                      ? 'bg-white text-purple-950 shadow-2xs'
                      : 'text-purple-700 hover:text-purple-950'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-purple-700" />
                  <span>Upcoming School Events</span>
                  <span className="font-mono text-[10px] bg-pink-100 text-pink-800 px-1.5 py-0.2 rounded-full font-bold">
                    {events.length}
                  </span>
                </button>
              </div>

              <span className="text-[11px] text-purple-600 font-mono">
                {rightTab === 'issues' ? 'Live Issue Queue' : 'Campus Calendar 2026'}
              </span>
            </div>

            {/* View A: Urgent Reports Cards List */}
            {rightTab === 'issues' ? (
              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {urgentReports.map((item) => {
                  const isUrgent = item.urgency === 'high';
                  return (
                    <div
                      key={item.id}
                      onClick={() => setPreviewItem(item)}
                      className="bg-white rounded-xl p-4 border border-purple-100 hover:border-purple-300 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="font-mono font-semibold text-purple-900">
                            #{item.id}
                          </span>
                          <span className="text-purple-300">·</span>
                          <span className="capitalize text-purple-700 font-medium">
                            {item.category.replace('-', ' ')}
                          </span>
                          <span className="text-purple-300">·</span>
                          <span className="text-purple-400 font-mono text-[10px]">
                            {formatRelativeTime(item.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isUrgent && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                              <AlertTriangle className="w-3 h-3 text-pink-600" />
                              Urgent
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 capitalize">
                            {item.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-semibold text-xs text-purple-950 group-hover:text-purple-700 transition-colors leading-snug line-clamp-1 mb-1">
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-purple-50 flex-wrap gap-2">
                        <div className="flex items-center gap-1 text-purple-800/70 truncate max-w-[240px]">
                          <MapPin className="w-3 h-3 text-purple-400 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-purple-700 font-mono text-[10px] bg-purple-50 px-1.5 py-0.5 rounded">
                            <ThumbsUp className="w-3 h-3 text-purple-500" />
                            <span>{item.upvotes} endorsements</span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStudentLogin(item.id);
                            }}
                            className="text-[11px] font-semibold text-purple-700 hover:text-purple-950 flex items-center gap-0.5"
                          >
                            <span>Open in App</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* View B: Upcoming School Events List */
              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {events.map((evt) => {
                  const [y, m, d] = evt.date.split('-');
                  const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
                  const monthName = dateObj.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
                  const weekdayName = dateObj.toLocaleDateString(undefined, { weekday: 'short' });

                  return (
                    <div
                      key={evt.id}
                      onClick={() => setPreviewEvent(evt)}
                      className="bg-white rounded-xl p-4 border border-purple-100 hover:border-purple-300 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        {/* Date Tile */}
                        <div className="w-12 h-13 rounded-xl bg-purple-50 border border-purple-200 flex flex-col items-center justify-center shrink-0 overflow-hidden text-center shadow-2xs">
                          <span className="bg-purple-800 w-full text-[9px] font-bold text-white py-0.5 tracking-wider">
                            {monthName}
                          </span>
                          <span className="text-base font-extrabold text-purple-950 tabular-nums leading-none pt-1">
                            {d}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] font-mono text-purple-400">
                              {weekdayName} · {evt.time}
                            </span>
                            {evt.category === 'bca-awareness' && (
                              <span className="text-[10px] font-bold text-pink-700 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Ribbon className="w-3 h-3 text-pink-500" />
                                <span>BCA Month</span>
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-xs sm:text-sm text-purple-950 group-hover:text-purple-700 transition-colors leading-snug line-clamp-1 mb-1">
                            {evt.title}
                          </h4>

                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2.5">
                            {evt.description}
                          </p>

                          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-purple-50 flex-wrap gap-2">
                            <div className="flex items-center gap-1 text-purple-800/80 truncate max-w-[200px]">
                              <MapPin className="w-3 h-3 text-purple-500 shrink-0" />
                              <span className="truncate">{evt.location}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-purple-600 font-mono bg-purple-50 px-2 py-0.5 rounded">
                                {evt.rsvps} Attending
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStudentLogin();
                                }}
                                className="text-[11px] font-semibold text-purple-700 hover:text-purple-950 flex items-center gap-0.5"
                              >
                                <span>RSVP in App</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Preview for an Urgent Issue clicked on Front Page */}
        {previewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/40 backdrop-blur-xs select-none">
            <div className="bg-white rounded-2xl border border-purple-200 shadow-2xl max-w-lg w-full max-h-[92dvh] flex flex-col p-4 sm:p-6 space-y-3.5 sm:space-y-4 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
              <div className="flex items-start justify-between gap-3 border-b border-purple-100 pb-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-purple-700 mb-1">
                    <span>#{previewItem.id}</span>
                    <span>·</span>
                    <span className="capitalize">{previewItem.category.replace('-', ' ')}</span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-purple-950 leading-snug">
                    {previewItem.title}
                  </h3>
                </div>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="text-purple-400 hover:text-purple-900 p-1.5 rounded-lg cursor-pointer touch-manipulation"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs overflow-y-auto pr-1">
                <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100">
                  <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">
                    Location & Impact
                  </div>
                  <div className="font-semibold text-purple-950">{previewItem.location}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                    Full Description
                  </div>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs max-h-48 overflow-y-auto">
                    {previewItem.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-[11px] text-purple-600 font-mono">
                  {previewItem.upvotes} student endorsements
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleStudentLogin(previewItem.id)}
                    className="flex-1 sm:flex-initial px-3 py-2 text-xs font-semibold rounded-lg bg-purple-100 text-purple-900 hover:bg-purple-200 transition-colors cursor-pointer touch-manipulation text-center"
                  >
                    View as Student
                  </button>
                  <button
                    onClick={() => handleAdminLogin(previewItem.id)}
                    className="flex-1 sm:flex-initial px-3 py-2 text-xs font-semibold rounded-lg bg-purple-900 text-white hover:bg-purple-950 transition-colors cursor-pointer touch-manipulation text-center"
                  >
                    Triage as Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Preview for an Event clicked on Front Page */}
        {previewEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/40 backdrop-blur-xs select-none">
            <div className="bg-white rounded-2xl border border-purple-200 shadow-2xl max-w-lg w-full max-h-[92dvh] flex flex-col p-4 sm:p-6 space-y-3.5 sm:space-y-4 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
              <div className="flex items-start justify-between gap-3 border-b border-purple-100 pb-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-purple-700 mb-1">
                    <span>{previewEvent.date}</span>
                    <span>·</span>
                    <span>{previewEvent.time}</span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-purple-950 leading-snug">
                    {previewEvent.title}
                  </h3>
                </div>
                <button
                  onClick={() => setPreviewEvent(null)}
                  className="text-purple-400 hover:text-purple-900 p-1.5 rounded-lg cursor-pointer touch-manipulation"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs overflow-y-auto pr-1">
                <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-purple-950 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-purple-600" />
                    <span>Location: {previewEvent.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-purple-700">
                    <Users className="w-3.5 h-3.5 text-purple-500" />
                    <span>Host: {previewEvent.organizer}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                    Event Details & Activities
                  </div>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs max-h-48 overflow-y-auto">
                    {previewEvent.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-[11px] text-purple-600 font-mono">
                  {previewEvent.rsvps} students attending
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setPreviewEvent(null);
                      handleStudentLogin();
                    }}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-lg bg-purple-900 text-white hover:bg-purple-950 transition-colors cursor-pointer touch-manipulation text-center"
                  >
                    Enter Assistant & RSVP
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Profile & Birthday Setup Modal */}
        <UserProfileModal
          user={studentProfile}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={(updated) => setStudentProfile(updated)}
        />

        {/* Fix #4: Authentic Google Account Picker with multi-account & custom account creation */}
        <GoogleAccountPickerModal
          isOpen={isGooglePickerOpen}
          onClose={() => setIsGooglePickerOpen(false)}
          onSelectAccount={(acc) => {
            setStudentProfile(acc);
            handleStudentLogin(undefined, acc);
          }}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-100/80 bg-white/80 py-3 px-6 text-center text-xs text-purple-900/60 shrink-0">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span>Campus Feedback Assistant & Incident Management</span>
            <span>·</span>
            <span>Modeled on Apple Feedback Assistant</span>
          </div>
          <div className="flex items-center gap-1.5 text-pink-700 font-medium">
            <Ribbon className="w-3.5 h-3.5 text-pink-500" />
            <span>Solemnity of Breast Cancer Awareness Month 🎗️</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
