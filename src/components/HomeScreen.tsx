import React, { useMemo } from 'react';
import { FeedbackReport, CampusEvent, UserProfile, isBirthdayToday } from '../types';
import { calculateSlaInfo, formatReportId, formatEventId } from '../utils';
import {
  Sparkles, Calendar, ThumbsUp, Cake, PartyPopper, Inbox,
  ArrowRight, Plus, MessageSquare, Flame, MapPin, Users,
  Clock, CheckCircle2, ChevronRight, Zap, Activity, User,
} from 'lucide-react';

interface HomeScreenProps {
  currentUser: UserProfile;
  reports: FeedbackReport[];
  events: CampusEvent[];
  allUsers: UserProfile[];
  onSelectReport: (id: string) => void;
  onToggleUpvote: (id: string, e: React.MouseEvent) => void;
  onNavigateToEvents: () => void;
  onNavigateToReports: () => void;
  onOpenNewModal: () => void;
  onOpenProfile: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentUser,
  reports,
  events,
  allUsers,
  onSelectReport,
  onToggleUpvote,
  onNavigateToEvents,
  onNavigateToReports,
  onOpenNewModal,
  onOpenProfile,
}) => {
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const myReports = useMemo(
    () =>
      reports
        .filter(
          (r) =>
            (r.authorEmail === currentUser.email || r.author === currentUser.name) ||
            r.endorsers?.some((e) => e.email === currentUser.email)
        )
        .filter((r) => r.status !== 'resolved' && r.status !== 'draft')
        .slice(0, 3),
    [reports, currentUser]
  );

  const trendingReports = useMemo(
    () =>
      [...reports]
        .filter((r) => r.status !== 'resolved' && r.status !== 'draft')
        .sort((a, b) => b.upvotes - a.upvotes)
        .slice(0, 3),
    [reports]
  );

  const myEvents = useMemo(
    () => events.filter((e) => e.attendees?.includes(currentUser.email)).slice(0, 3),
    [events, currentUser]
  );

  const upcomingEvents = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return [...events]
      .filter((e) => new Date(e.date).getTime() >= startOfToday.getTime())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 4);
  }, [events]);

  const todaysBirthdays = useMemo(
    () => allUsers.filter((u) => u.status === 'approved' && isBirthdayToday(u.birthday)),
    [allUsers]
  );

  const onlineUsers = useMemo(() => {
    const now = Date.now();
    const FIVE_MIN = 5 * 60 * 1000;
    return allUsers.filter(
      (u) =>
        u.status === 'approved' &&
        u.email.toLowerCase() !== currentUser.email.toLowerCase() &&
        u.lastActiveAt &&
        now - new Date(u.lastActiveAt).getTime() < FIVE_MIN
    );
  }, [allUsers, currentUser]);

  const isMyBirthday = isBirthdayToday(currentUser.birthday);

  return (
    <div className="flex-1 w-full bg-[#faf8fc] dark:bg-slate-950 overflow-y-auto select-none">
      <div className="max-w-6xl mx-auto p-3 sm:p-5 md:p-6 pb-28 sm:pb-12 space-y-4 sm:space-y-5">

        {/* ========== HERO ========== */}
        <div className={`rounded-3xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden ${
          isMyBirthday
            ? 'bg-gradient-to-br from-amber-400 via-pink-500 to-purple-700'
            : 'bg-gradient-to-br from-purple-700 via-purple-800 to-pink-600'
        }`}>
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-300/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {currentUser.photo ? (
                <img
                  src={currentUser.photo}
                  alt={currentUser.name}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 shadow-md ${
                    isMyBirthday ? 'border-amber-300 ring-4 ring-pink-300/50' : 'border-white/40'
                  }`}
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">
                  {greeting}
                </p>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {currentUser.name}
                  {isMyBirthday && ' 🎂'}
                </h1>
                <p className="text-xs sm:text-sm text-white/80 font-medium">
                  {currentUser.major || 'Student'} · {currentUser.classYear || 'Class of 2026'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={onOpenNewModal}
                className="flex items-center gap-1.5 bg-white text-purple-800 hover:bg-purple-50 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                New Report
              </button>
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3.5 py-2 rounded-xl text-xs font-bold backdrop-blur-sm border border-white/30 transition-all cursor-pointer active:scale-95"
              >
                <User className="w-3.5 h-3.5" />
                My Profile
              </button>
            </div>
          </div>

          {isMyBirthday && (
            <div className="relative z-10 mt-4 bg-white/20 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-2 text-sm font-bold">
              <PartyPopper className="w-5 h-5 text-amber-300" />
              <span>Happy Birthday! The whole campus is celebrating with you today 🎉</span>
            </div>
          )}
        </div>

        {/* ========== QUICK STATS ========== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {[
            {
              label: 'Open Tickets',
              value: reports.filter((r) => r.status === 'open').length,
              icon: <Inbox className="w-4 h-4" />,
              color: 'text-purple-700 dark:text-purple-300',
              bg: 'bg-purple-50 dark:bg-purple-950/40',
            },
            {
              label: 'Resolved',
              value: reports.filter((r) => r.status === 'resolved').length,
              icon: <CheckCircle2 className="w-4 h-4" />,
              color: 'text-emerald-700 dark:text-emerald-300',
              bg: 'bg-emerald-50 dark:bg-emerald-950/40',
            },
            {
              label: 'Events',
              value: events.length,
              icon: <Calendar className="w-4 h-4" />,
              color: 'text-pink-700 dark:text-pink-300',
              bg: 'bg-pink-50 dark:bg-pink-950/40',
            },
            {
              label: 'Students',
              value: allUsers.filter((u) => u.status === 'approved').length,
              icon: <Users className="w-4 h-4" />,
              color: 'text-indigo-700 dark:text-indigo-300',
              bg: 'bg-indigo-50 dark:bg-indigo-950/40',
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-2.5 shadow-2xs"
            >
              <div className={`w-8 h-8 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                {stat.icon}
              </div>
              <div className="min-w-0">
                <div className="text-lg font-extrabold text-purple-950 dark:text-purple-100 tabular-nums leading-none">
                  {stat.value}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-purple-500 dark:text-purple-400 truncate">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ========== MAIN GRID ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

          {/* My Tickets */}
          <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xs flex flex-col">
            <div className="p-4 border-b border-purple-50 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                  <Inbox className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-purple-950 dark:text-purple-100">My Active Tickets</h2>
                  <p className="text-[10px] text-purple-500 dark:text-purple-400">
                    Reports you authored or endorsed
                  </p>
                </div>
              </div>
              <button
                onClick={onNavigateToReports}
                className="text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:text-purple-950 flex items-center gap-0.5 cursor-pointer"
              >
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1 p-3 space-y-2">
              {myReports.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-purple-300 opacity-60" />
                  <p className="text-xs font-semibold text-purple-950 dark:text-purple-200">
                    No active tickets
                  </p>
                  <p className="text-[11px] text-purple-500 dark:text-purple-400 mt-0.5 mb-3">
                    Submit your first report to get started.
                  </p>
                  <button
                    onClick={onOpenNewModal}
                    className="text-[11px] font-bold bg-purple-800 hover:bg-purple-900 text-white px-3 py-1.5 rounded-lg cursor-pointer inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> New Report
                  </button>
                </div>
              ) : (
                myReports.map((r) => {
                  const sla = calculateSlaInfo(r.createdAt, r.urgency, r.status);
                  const endorsed = r.endorsers?.some((e) => e.email === currentUser.email);
                  return (
                    <button
                      key={r.id}
                      onClick={() => onSelectReport(r.id)}
                      className="w-full text-left p-2.5 rounded-2xl hover:bg-purple-50/60 dark:hover:bg-slate-800 border border-purple-100/70 dark:border-slate-800 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {formatReportId(r.id, r.type, r.status)}
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          sla.isBreached
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold'
                            : sla.isResolved
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                        }`}>
                          {sla.isResolved ? 'Resolved' : sla.isBreached ? 'Overdue' : `${sla.remainingHours}h`}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-purple-950 dark:text-purple-100 truncate group-hover:text-purple-700">
                        {r.title}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-purple-500 dark:text-purple-400 mt-1">
                        <span className="flex items-center gap-0.5">
                          <ThumbsUp className="w-2.5 h-2.5" /> {r.upvotes}
                        </span>
                        <span>·</span>
                        <span className="capitalize">{r.status.replace('-', ' ')}</span>
                        {endorsed && (
                          <>
                            <span>·</span>
                            <span className="text-pink-600 dark:text-pink-400 font-bold">Endorsed</span>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Trending */}
          <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xs flex flex-col">
            <div className="p-4 border-b border-purple-50 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-purple-950 dark:text-purple-100">Trending This Week</h2>
                  <p className="text-[10px] text-purple-500 dark:text-purple-400">
                    Highest student endorsements
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-3 space-y-2">
              {trendingReports.map((r, i) => {
                const hasUpvoted = r.endorsers?.some((e) => e.email === currentUser.email);
                return (
                  <div
                    key={r.id}
                    className="p-2.5 rounded-2xl bg-gradient-to-br from-pink-50/70 to-purple-50/70 dark:from-slate-800 dark:to-purple-950/30 border border-pink-200/60 dark:border-slate-700 hover:border-pink-400 transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          i === 0
                            ? 'bg-amber-400 text-amber-950'
                            : i === 1
                            ? 'bg-slate-300 text-slate-800'
                            : 'bg-orange-300 text-orange-950'
                        }`}>
                          #{i + 1}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-purple-600 dark:text-purple-400">
                          {formatReportId(r.id, r.type, r.status)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => onToggleUpvote(r.id, e)}
                        className={`flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                          hasUpvoted
                            ? 'bg-pink-200 dark:bg-pink-900 text-pink-800 dark:text-pink-200'
                            : 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 hover:bg-pink-100'
                        }`}
                      >
                        <ThumbsUp className={`w-2.5 h-2.5 ${hasUpvoted ? 'fill-pink-500 text-pink-500' : ''}`} />
                        {r.upvotes}
                      </button>
                    </div>
                    <button
                      onClick={() => onSelectReport(r.id)}
                      className="w-full text-left cursor-pointer"
                    >
                      <div className="text-xs font-bold text-purple-950 dark:text-purple-100 truncate group-hover:text-pink-600">
                        {r.title}
                      </div>
                      <div className="text-[10px] text-purple-600 dark:text-purple-400 truncate mt-0.5 capitalize">
                        {r.category.replace('-', ' ')} · {r.urgency} priority
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Birthdays Today */}
          <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-purple-50 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <Cake className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-purple-950 dark:text-purple-100">Birthdays Today</h2>
                  <p className="text-[10px] text-purple-500 dark:text-purple-400">
                    {todaysBirthdays.length > 0 ? 'Celebrate with them!' : 'No birthdays today'}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3">
              {todaysBirthdays.length === 0 ? (
                <div className="p-6 text-center">
                  <Cake className="w-8 h-8 mx-auto mb-2 text-purple-300 opacity-60" />
                  <p className="text-[11px] text-purple-500 dark:text-purple-400">
                    No birthday celebrations scheduled for today.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {todaysBirthdays.map((u) => (
                    <div
                      key={u.email}
                      className="flex items-center gap-2 p-2 rounded-2xl bg-gradient-to-r from-amber-50 to-pink-50 dark:from-amber-950/30 dark:to-pink-950/30 border border-amber-200 dark:border-amber-900"
                    >
                      {u.photo ? (
                        <img
                          src={u.photo}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-300 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-xs font-bold text-amber-900 dark:text-amber-100 shrink-0">
                          {u.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-purple-950 dark:text-purple-100 truncate">
                          {u.name}
                          {u.email.toLowerCase() === currentUser.email.toLowerCase() && ' (You)'}
                        </div>
                        <div className="text-[10px] text-purple-600 dark:text-purple-400 truncate">
                          {u.classYear || u.major || 'Student'}
                        </div>
                      </div>
                      <span className="text-lg shrink-0">🎂</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Online Now */}
          <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-purple-50 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-purple-950 dark:text-purple-100">Online Now</h2>
                  <p className="text-[10px] text-purple-500 dark:text-purple-400">
                    {onlineUsers.length} {onlineUsers.length === 1 ? 'student' : 'students'} active in the last 5 minutes
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3">
              {onlineUsers.length === 0 ? (
                <div className="p-6 text-center">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-purple-300 opacity-60" />
                  <p className="text-[11px] text-purple-500 dark:text-purple-400">
                    No one else is online right now.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {onlineUsers.slice(0, 12).map((u) => (
                    <div
                      key={u.email}
                      className="flex items-center gap-1.5 pr-2 pl-1 py-1 rounded-full bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900"
                      title={`${u.name} — ${u.major || 'Student'}`}
                    >
                      <div className="relative">
                        {u.photo ? (
                          <img
                            src={u.photo}
                            alt={u.name}
                            className="w-6 h-6 rounded-full object-cover border border-emerald-300"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 text-[9px] font-bold flex items-center justify-center">
                            {u.name.charAt(0)}
                          </div>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white dark:ring-slate-900" />
                      </div>
                      <span className="text-[10px] font-semibold text-purple-950 dark:text-purple-100 truncate max-w-[80px]">
                        {u.name.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========== UPCOMING EVENTS ========== */}
        <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-purple-50 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-purple-950 dark:text-purple-100">Upcoming Events</h2>
                <p className="text-[10px] text-purple-500 dark:text-purple-400">
                  {myEvents.length > 0 ? `You're going to ${myEvents.length} event${myEvents.length > 1 ? 's' : ''}` : 'RSVP to save your spot'}
                </p>
              </div>
            </div>
            <button
              onClick={onNavigateToEvents}
              className="text-[11px] font-bold text-pink-700 dark:text-pink-300 hover:text-pink-950 flex items-center gap-0.5 cursor-pointer"
            >
              All events <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {upcomingEvents.length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-4 p-6 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-300 opacity-60" />
                <p className="text-xs text-purple-500 dark:text-purple-400">
                  No upcoming events scheduled.
                </p>
              </div>
            ) : (
              upcomingEvents.map((e) => {
                const isGoing = e.attendees?.includes(currentUser.email);
                const dateObj = new Date(e.date);
                return (
                  <button
                    key={e.id}
                    onClick={onNavigateToEvents}
                    className="text-left p-3 rounded-2xl bg-purple-50/60 dark:bg-slate-800/60 border border-purple-100 dark:border-slate-700 hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-10 h-11 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-slate-700 flex flex-col items-center justify-center shrink-0 overflow-hidden">
                        <div className="bg-purple-800 dark:bg-purple-700 w-full text-[8px] font-bold text-white py-0.5 tracking-wider text-center">
                          {dateObj.toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}
                        </div>
                        <div className="text-xs font-extrabold text-purple-950 dark:text-purple-100 leading-none pt-0.5">
                          {dateObj.getDate()}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-mono text-purple-500 dark:text-purple-400 truncate">
                          {formatEventId(e.id)}
                        </div>
                        {isGoing && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 px-1.5 py-0.5 rounded">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Going
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-purple-950 dark:text-purple-100 line-clamp-2 group-hover:text-purple-700 mb-1">
                      {e.title}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-purple-500 dark:text-purple-400">
                      <MapPin className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{e.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-purple-500 dark:text-purple-400 mt-0.5">
                      <Clock className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{e.time}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};