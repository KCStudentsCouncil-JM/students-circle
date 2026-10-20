import React, { useState, useMemo, useEffect } from 'react';
import { 
  FeedbackReport, NavFilter, RoleMode, FeedbackStatus, ActivityItem, CampusEvent, UserProfile 
} from './types';
import { 
  matchesExactWords, exportCampusDataBackup, formatReportId 
} from './utils';
import { 
  auth, isFirebaseConfigured, subscribeToReports, subscribeToEvents, saveReportToDb, updateReportInDb, 
  deleteReportFromDb, saveEventToDb, updateEventInDb, deleteEventFromDb,
  subscribeToUsers, createUserProfile, approveUserInDb, rejectUserInDb, removeUserInDb,
  getUserProfile, signOutReal, signInWithGoogleReal, updateUserLastActive
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { FeedbackList } from './components/FeedbackList';
import { FeedbackDetail } from './components/FeedbackDetail';
import { EventsSection } from './components/EventsSection';
import { NewFeedbackModal } from './components/NewFeedbackModal';
import { UserProfileModal } from './components/UserProfileModal';
import { PortalPage } from './components/PortalPage';
import { OnboardingScreen } from './components/OnboardingScreen';
import { AdminStudentList } from './components/AdminStudentList';
import { GoogleAccountPickerModal } from './components/GoogleAccountPickerModal';
import { AdminAnalyticsModal } from './components/AdminAnalyticsModal';
import { HomeScreen } from './components/HomeScreen';
import { CheckCircle2, Calendar, Plus, User as UserIcon, LogOut, Inbox, Home } from 'lucide-react';

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Modals & Navigation
  const [isGooglePickerOpen, setIsGooglePickerOpen] = useState(false);
  const [loginRole, setLoginRole] = useState<'student' | 'admin'>('student');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNewFeedbackModalOpen, setIsNewFeedbackModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  
  // Core Data
  const [reports, setReports] = useState<FeedbackReport[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  
  // UI State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [role, setRole] = useState<RoleMode>('student');
  const [currentFilter, setCurrentFilter] = useState<NavFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pageView, setPageView] = useState<'home' | 'main' | 'detail' | 'student-list'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  // 1. Data subscriptions
  useEffect(() => {
    const unsubR = subscribeToReports(setReports);
    const unsubE = subscribeToEvents(setEvents);
    const unsubU = subscribeToUsers(setAllUsers);
    return () => { unsubR(); unsubE(); unsubU(); };
  }, []);

  // 2. Auth state
  useEffect(() => {
    if (auth && isFirebaseConfigured()) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setFirebaseUser(user);
        try {
          if (user && user.email) {
            const profile = await getUserProfile(user.email);
            setUserProfile(profile);
            if (profile) setRole(profile.role);
          } else {
            setUserProfile(null);
          }
        } catch (err) {
          console.error("Auth profile fetch error:", err);
          setUserProfile(null);
        } finally {
          setIsLoadingAuth(false);
        }
      });
      return () => unsubscribe();
    } else {
      try {
        const stored = localStorage.getItem('campus_active_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          setFirebaseUser(parsed);
          getUserProfile(parsed.email).then(profile => {
            setUserProfile(profile);
            if (profile) setRole(profile.role);
            setIsLoadingAuth(false);
          }).catch(() => setIsLoadingAuth(false));
          return;
        }
      } catch (e) { /* ignore */ }
      setIsLoadingAuth(false);
    }
  }, []);

  // Sync userProfile when allUsers changes (approval flows)
  useEffect(() => {
    if (!userProfile?.email) return;
    const fresh = allUsers.find(
      (u) => u.email.toLowerCase() === userProfile.email.toLowerCase()
    );
    if (
      fresh &&
      (fresh.status !== userProfile.status ||
        fresh.role !== userProfile.role ||
        fresh.name !== userProfile.name ||
        fresh.photo !== userProfile.photo)
    ) {
      setUserProfile(fresh);
      setRole(fresh.role);
    }
  }, [allUsers, userProfile?.email]);

  // Online presence heartbeat (every 60s)
  useEffect(() => {
    if (!userProfile?.email) return;
    updateUserLastActive(userProfile.email);
    const interval = setInterval(() => {
      updateUserLastActive(userProfile.email);
    }, 60_000);
    return () => clearInterval(interval);
  }, [userProfile?.email]);

  // Keyboard detection (Optimized for Mobile Bottom Nav)
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        setIsKeyboardActive(true);
      }
    };
    const handleFocusOut = () => setIsKeyboardActive(false);
    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);
    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg: string) => setToastMessage(msg);

  const handleSignOut = async () => {
    await signOutReal();
    setFirebaseUser(null);
    setUserProfile(null);
    setPageView('home');
    showToast('Signed out securely.');
  };

  const handleOnboardingSubmit = async (profile: UserProfile) => {
    await createUserProfile(profile);
    setUserProfile(profile);
    setAllUsers(prev => [profile, ...prev.filter(u => u.email !== profile.email)]);
    showToast('Request sent to school administrators.');
  };

  const handleGoogleLogin = async (simulatedUser?: { email: string; name: string; photoURL?: string }) => {
    try {
      let user: any = null;
      if (simulatedUser) {
        user = simulatedUser;
        localStorage.setItem('campus_active_user', JSON.stringify(simulatedUser));
      } else {
        user = await signInWithGoogleReal();
      }
      
      setFirebaseUser(user);
      const email = user.email || 'student@kc.edu.jm';
      let profile = await getUserProfile(email);

      if (loginRole === 'admin') {
        if (!profile) {
          const newAdmin: UserProfile = {
            id: email,
            name: user.displayName || user.name || 'Staff Member',
            email,
            role: 'admin',
            status: 'approved',
            title: 'School Administrator',
            photo: user.photoURL || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
            createdAt: new Date().toISOString()
          };
          await createUserProfile(newAdmin);
          setUserProfile(newAdmin);
          setRole('admin');
        } else {
          const updatedAdmin: UserProfile = { ...profile, role: 'admin', status: 'approved' };
          await createUserProfile(updatedAdmin);
          setUserProfile(updatedAdmin);
          setRole('admin');
        }
        setPageView('home');
      } else {
        if (!profile) {
          const found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (found) profile = found;
        }
        setUserProfile(profile);
        setRole(profile?.role || 'student');
        if (profile) setPageView('home');
      }
    } catch (error: any) {
      showToast(error.message || 'Login failed');
    }
  };

  const handleDeleteReport = async (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
    setSelectedId(null);
    await deleteReportFromDb(id);
    showToast(`Report deleted.`);
    setPageView('main');
  };

  const handleDeleteEvent = async (id: string) => {
    if (role !== 'admin') return;
    setEvents(prev => prev.filter(e => e.id !== id));
    await deleteEventFromDb(id);
    showToast(`Event deleted.`);
  };

  const handleUpdateStatus = async (id: string, newStatus: FeedbackStatus) => {
    const r = reports.find(rep => rep.id === id);
    if (!r) return;
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`, author: userProfile?.name || 'Admin', role: 'admin',
      message: `Status manually changed to ${newStatus.toUpperCase()}.`,
      timestamp: new Date().toISOString(), statusChange: newStatus,
      badgeText: 'Official Staff'
    };
    setReports(prev => prev.map(rep => rep.id === id ? { 
      ...rep, status: newStatus, activities: [...(rep.activities || []), newActivity] 
    } : rep));
    await updateReportInDb(id, { status: newStatus, activities: [...(r.activities || []), newActivity] });
    showToast(`Status updated to ${newStatus}.`);
  };

  const handleAddActivity = async (
    id: string, message: string, activityRole: 'admin' | 'student',
    statusChange?: FeedbackStatus, parentId?: string, photos?: string[], videos?: string[]
  ) => {
    const r = reports.find(rep => rep.id === id);
    if (!r) return;
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`, author: userProfile?.name || 'User', role: activityRole,
      message, timestamp: new Date().toISOString(), statusChange,
      badgeText: activityRole === 'admin' ? 'Official Staff' : undefined,
      parentId,
      photos: photos && photos.length > 0 ? photos : undefined,
      videos: videos && videos.length > 0 ? videos : undefined,
    };
    const nextStatus = statusChange || r.status;
    setReports(prev => prev.map(rep => rep.id === id ? { 
      ...rep, status: nextStatus, activities: [...(rep.activities || []), newActivity] 
    } : rep));
    await updateReportInDb(id, { status: nextStatus, activities: [...(r.activities || []), newActivity] });
    showToast(activityRole === 'admin' ? 'Official response published.' : 'Reply posted.');
  };

  const handleBulkUpdateStatus = async (ids: string[], newStatus: FeedbackStatus) => {
    const nowIso = new Date().toISOString();
    setReports(prev => prev.map(rep => {
      if (!ids.includes(rep.id)) return rep;
      const newActivity: ActivityItem = {
        id: `act-${Date.now()}-${rep.id}`, author: userProfile?.name || 'Admin', role: 'admin',
        message: `Report bulk-updated to ${newStatus.toUpperCase()}.`,
        timestamp: nowIso, statusChange: newStatus,
      };
      return { ...rep, status: newStatus, activities: [...(rep.activities || []), newActivity] };
    }));
    for (const id of ids) {
      const r = reports.find(rep => rep.id === id);
      if (r) {
        const newActivity: ActivityItem = {
          id: `act-${Date.now()}-${id}`, author: userProfile?.name || 'Admin', role: 'admin',
          message: `Report bulk-updated to ${newStatus.toUpperCase()}.`,
          timestamp: nowIso, statusChange: newStatus,
        };
        await updateReportInDb(id, { status: newStatus, activities: [...(r.activities || []), newActivity] });
      }
    }
    showToast(`Bulk updated ${ids.length} reports.`);
  };
  
  const handleToggleEventRsvp = async (id: string) => {
    if (!userProfile?.email) return; 
    const evt = events.find((e) => e.id === id);
    if (!evt) return;
    const attendees = evt.attendees || [];
    const hasUserRsvpd = attendees.includes(userProfile.email);
    const nextCount = hasUserRsvpd ? Math.max(0, evt.rsvps - 1) : evt.rsvps + 1;
    const updatedAttendees = hasUserRsvpd ? attendees.filter(e => e !== userProfile.email) : [...attendees, userProfile.email];
    setEvents(prev => prev.map(e => e.id === id ? { ...e, rsvps: nextCount, attendees: updatedAttendees } : e));
    await updateEventInDb(id, { rsvps: nextCount, attendees: updatedAttendees });
    showToast(hasUserRsvpd ? `RSVP cancelled` : `RSVP confirmed`);
  };

  const handleAddEvent = async (newEventData: Omit<CampusEvent, 'id' | 'rsvps' | 'hasRsvpd'>) => {
    const newId = `KCEV-${Math.floor(210 + Math.random() * 780)}`;
    const fullEvent: CampusEvent = { ...newEventData, id: newId, rsvps: 1, attendees: [userProfile?.email || ''] };
    setEvents(prev => [fullEvent, ...prev]);
    await saveEventToDb(fullEvent);
    showToast(`Event published!`);
  };

  const handleToggleUpvote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userProfile) return;
    const r = reports.find((rep) => rep.id === id);
    if (!r) return;
    const existingEndorsers = r.endorsers || [];
    const isAlreadyEndorsed = existingEndorsers.some((end) => end.email === userProfile.email);
    let updatedEndorsers;
    if (isAlreadyEndorsed) {
      updatedEndorsers = existingEndorsers.filter((end) => end.email !== userProfile.email);
      showToast(`Support retracted.`);
    } else {
      updatedEndorsers = [{ id: `end-${Date.now()}`, name: userProfile.name, role: userProfile.role, email: userProfile.email, timestamp: new Date().toISOString() }, ...existingEndorsers];
      showToast(`Support added.`);
    }
    setReports(prev => prev.map(rep => rep.id === id ? { ...rep, upvotes: updatedEndorsers.length, endorsers: updatedEndorsers } : rep));
    await updateReportInDb(id, { upvotes: updatedEndorsers.length, endorsers: updatedEndorsers });
  };

  const handleCreateReport = async (newReportData: any) => {
    let prefix = newReportData.type === 'initiative' ? 'KCIS' : newReportData.status === 'open' ? 'KCOI' : 'KCIRV';
    const newId = `${prefix}-${Math.floor(1050 + Math.random() * 8900)}`;
    const nowIso = new Date().toISOString();
    const createdReport: FeedbackReport = {
      ...newReportData, id: newId,
      author: newReportData.author || userProfile?.name || 'Student', 
      authorEmail: userProfile?.email,
      authorRole: newReportData.authorRole || userProfile?.title || 'Student',
      authorRealName: userProfile?.name,
      authorStudentId: userProfile?.id,
      createdAt: nowIso, upvotes: 1,
      endorsers: [{ id: `end-${Date.now()}`, name: userProfile?.name || 'Student', role: userProfile?.role || 'Student', email: userProfile?.email || '', timestamp: nowIso }],
      activities: [{ id: `act-${Date.now()}`, author: userProfile?.name || 'Student', role: 'student', message: 'Submitted report.', timestamp: nowIso }],
    };
    setReports((prev) => [createdReport, ...prev]);
    await saveReportToDb(createdReport);
    setSelectedId(newId); 
    setPageView('detail');
    showToast(`Report ${formatReportId(newId, createdReport.type, createdReport.status)} submitted!`);
  };

  const handleApproveUser = async (email: string) => {
    setAllUsers(prev => prev.map(u => u.email === email ? { ...u, status: 'approved' } : u));
    await approveUserInDb(email);
    showToast(`Student access approved.`);
  };
  const handleRejectUser = async (email: string) => {
    setAllUsers(prev => prev.map(u => u.email === email ? { ...u, status: 'rejected' } : u));
    await rejectUserInDb(email);
    showToast(`Student request rejected.`);
  };
  const handleRemoveUser = async (email: string) => {
    setAllUsers(prev => prev.filter(u => u.email !== email));
    await removeUserInDb(email);
    showToast(`Student access revoked.`);
  };

  const handleExportBackup = () => {
    exportCampusDataBackup(reports, events, userProfile);
    showToast('Data backup downloaded.');
  };
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string);
        if (Array.isArray(backup?.reports)) {
          setReports(backup.reports);
          for (const rep of backup.reports) await saveReportToDb(rep);
        }
        if (Array.isArray(backup?.events)) {
          setEvents(backup.events);
          for (const ev of backup.events) await saveEventToDb(ev);
        }
        if (backup?.user) {
          setUserProfile(backup.user);
          await createUserProfile(backup.user);
        }
        showToast('Backup restored successfully!');
      } catch {
        showToast('Failed to import backup. Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredReports = useMemo(() => {
    return reports.filter(item => {
      if (currentFilter === 'open' && item.status !== 'open') return false;
      if (currentFilter === 'in-review' && !(item.status === 'in-review' || item.status === 'in-progress')) return false;
      if (currentFilter === 'resolved' && item.status !== 'resolved') return false;
      if (currentFilter === 'drafts' && item.status !== 'draft') return false;
      
      if (currentFilter === 'my-activity') {
        if (!userProfile) return false;
        const isAuthor = item.authorEmail === userProfile.email || item.author === userProfile.name;
        const isEndorser = item.endorsers?.some(e => e.email === userProfile.email);
        if (!isAuthor && !isEndorser) return false;
      }

      if (currentFilter === 'facilities' && item.category !== 'facilities') return false;
      if (currentFilter === 'technology' && item.category !== 'technology') return false;
      if (currentFilter === 'academics' && item.category !== 'academics') return false;
      if (currentFilter === 'student-life' && item.category !== 'student-life') return false;
      if (currentFilter === 'safety' && item.category !== 'safety') return false;
      
      if (searchQuery.trim() && !matchesExactWords(`${item.title} ${item.description}`, searchQuery)) return false;
      return true;
    });
  }, [reports, currentFilter, searchQuery, userProfile]);

  // --- RENDER LOGIC ---
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#faf8fc] dark:bg-slate-950 flex flex-col items-center justify-center text-purple-700 dark:text-purple-300 font-bold gap-3">
        <div className="w-8 h-8 border-3 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono">Loading KC Portal...</span>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <>
        <PortalPage 
          reports={reports} events={events}
          onSignInClick={(r) => { setLoginRole(r); setIsGooglePickerOpen(true); }} 
          isGooglePickerOpen={isGooglePickerOpen} 
          onCloseGooglePicker={() => setIsGooglePickerOpen(false)} 
        />
        <GoogleAccountPickerModal 
          isOpen={isGooglePickerOpen} 
          onClose={() => setIsGooglePickerOpen(false)} 
          targetRole={loginRole} 
          onSelectAccount={(simulated) => handleGoogleLogin(simulated)} 
        />
      </>
    );
  }

  if (userProfile?.status === 'pending') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf8fc] dark:bg-slate-950 p-4 text-center">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-purple-950 dark:text-purple-100 mb-2">Approval Pending</h1>
        <p className="text-purple-700 dark:text-purple-300 max-w-sm mb-6">Your student verification request is currently being reviewed by staff. Please check back later.</p>
        <button onClick={handleSignOut} className="text-sm font-bold text-rose-600 hover:underline cursor-pointer">Sign Out</button>
      </div>
    );
  }

  if (!userProfile || userProfile.status === 'rejected') {
    return <OnboardingScreen firebaseUser={firebaseUser} onSubmit={handleOnboardingSubmit} onSignOut={handleSignOut} />;
  }

  // APPROVED USER DASHBOARD
  return (
    <div className="h-[100dvh] w-full max-w-full flex flex-col bg-[#faf8fc] dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased overflow-hidden select-none transition-colors">
      <TopBar 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
        onOpenNewModal={() => setIsNewFeedbackModalOpen(true)} 
        totalCount={reports.length} 
        openCount={reports.filter(r => r.status === 'open').length} 
        currentUser={userProfile} 
        onSignOut={handleSignOut} 
        onGoHome={() => { setPageView('home'); setCurrentFilter('all'); }} 
        isSidebarOpen={isSidebarOpen} 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenGoogleSignIn={() => setIsGooglePickerOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
      />
      
      <div className="flex-1 flex overflow-hidden relative">
        {isSidebarOpen && (
          <Sidebar 
            currentFilter={currentFilter} 
            onSelectFilter={(f) => { setCurrentFilter(f); setPageView('main'); }} 
            onOpenNewModal={() => setIsNewFeedbackModalOpen(true)} 
            reports={reports} 
            role={role} 
            eventsCount={events.length} 
            onClose={() => setIsSidebarOpen(false)} 
            onSignOut={handleSignOut} 
            onExportBackup={handleExportBackup} 
            onOpenStudentList={() => setPageView('student-list')} 
            onOpenAnalytics={() => setIsAnalyticsOpen(true)}
          />
        )}

        {pageView === 'home' ? (
          <HomeScreen
            currentUser={userProfile}
            reports={reports}
            events={events}
            allUsers={allUsers}
            onSelectReport={(id) => { setSelectedId(id); setPageView('detail'); }}
            onToggleUpvote={handleToggleUpvote}
            onNavigateToEvents={() => { setCurrentFilter('events'); setPageView('main'); }}
            onNavigateToReports={() => { setCurrentFilter('all'); setPageView('main'); }}
            onOpenNewModal={() => setIsNewFeedbackModalOpen(true)}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />
        ) : pageView === 'student-list' && role === 'admin' ? (
          <AdminStudentList 
            allUsers={allUsers} 
            onApprove={handleApproveUser} 
            onReject={handleRejectUser} 
            onRemove={handleRemoveUser} 
            onBack={() => setPageView('home')} 
          />
        ) : currentFilter === 'events' ? (
          <EventsSection 
            events={events} role={role} currentUser={userProfile as any} 
            onToggleRsvp={handleToggleEventRsvp} onAddEvent={handleAddEvent} 
            onDeleteEvent={handleDeleteEvent} onBackToReports={() => { setCurrentFilter('all'); setPageView('home'); }} 
          />
        ) : pageView === 'main' ? (
          <FeedbackList 
            reports={filteredReports} selectedId={selectedId} 
            currentUser={userProfile as any} allUsers={allUsers} 
            onSelectReport={(id) => { setSelectedId(id); setPageView('detail'); }} 
            onToggleUpvote={handleToggleUpvote} 
            activeFilterTitle={
              currentFilter === 'all' ? 'All Reports' :
              currentFilter === 'open' ? 'Open Issues' :
              currentFilter === 'in-review' ? 'In Review & Active' :
              currentFilter === 'resolved' ? 'Resolved Reports' :
              currentFilter === 'drafts' ? 'Drafts' :
              currentFilter === 'my-activity' ? 'My Activity & Supported' :
              `${currentFilter.replace('-', ' ').toUpperCase()} Reports`
            } 
            onNavigateToEvents={() => { setCurrentFilter('events'); setPageView('main'); }} 
            eventsCount={events.length} role={role} 
            onBulkUpdateStatus={handleBulkUpdateStatus}
            onOpenNewModal={() => setIsNewFeedbackModalOpen(true)}
          />
        ) : (
          <FeedbackDetail 
            report={reports.find(r => r.id === selectedId) || null} 
            role={role} currentUser={userProfile as any} 
            onUpdateStatus={handleUpdateStatus} onAddActivity={handleAddActivity} 
            onToggleUpvote={handleToggleUpvote} 
            onBack={() => setPageView('main')} 
            onDeleteReport={handleDeleteReport} 
            otherReports={reports.filter(r => r.id !== selectedId).slice(0, 5)} 
            onSelectOtherReport={(id) => { setSelectedId(id); }} 
          />
        )}
      </div>

      {/* MOBILE BOTTOM NAVIGATION - Hidden on Tablets (md) & Desktops */}
      {!isKeyboardActive && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-purple-100 dark:border-slate-800 px-3 pt-2 pb-safe flex items-center justify-around shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <button
            onClick={() => { setPageView('home'); setCurrentFilter('all'); }}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
              pageView === 'home' ? 'text-purple-900 dark:text-purple-200' : 'text-purple-400'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>
          <button
            onClick={() => { setCurrentFilter('all'); setPageView('main'); }}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
              currentFilter !== 'events' && pageView === 'main' ? 'text-purple-900 dark:text-purple-200' : 'text-purple-400'
            }`}
          >
            <Inbox className="w-5 h-5" />
            <span>Reports</span>
          </button>
          <button
            onClick={() => setIsNewFeedbackModalOpen(true)}
            className="flex flex-col items-center justify-center -mt-5 w-12 h-12 rounded-full bg-gradient-to-r from-purple-800 to-pink-600 text-white shadow-lg active:scale-95 transition-transform cursor-pointer"
          >
            <Plus className="w-6 h-6" />
          </button>
          <button
            onClick={() => { setCurrentFilter('events'); setPageView('main'); }}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
              currentFilter === 'events' ? 'text-pink-600 dark:text-pink-400' : 'text-purple-400'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Events</span>
          </button>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-1 text-[10px] font-semibold text-purple-400 hover:text-purple-900 dark:hover:text-purple-200 transition-colors cursor-pointer"
          >
            <UserIcon className="w-5 h-5" />
            <span>Profile</span>
          </button>
        </div>
      )}

      {/* MODALS */}
      <NewFeedbackModal
        isOpen={isNewFeedbackModalOpen}
        onClose={() => setIsNewFeedbackModalOpen(false)}
        onSubmit={handleCreateReport}
        existingReports={reports}
        onSelectExistingReport={(id) => {
          setSelectedId(id); setPageView('detail'); setIsNewFeedbackModalOpen(false);
        }}
        currentUser={userProfile}
      />

      {userProfile && (
        <UserProfileModal
          user={userProfile as any}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={(updated) => {
            setUserProfile({ ...userProfile, ...updated });
            createUserProfile({ ...userProfile, ...updated }); 
            setAllUsers(prev => prev.map(u => u.email === updated.email ? { ...u, ...updated } : u));
            showToast('Profile updated successfully.');
          }}
          onSignOut={handleSignOut}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
        />
      )}

      <AdminAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        reports={reports}
        events={events}
        allUsers={allUsers}
      />

      {/* TOAST - Adjusted for Mobile Bottom Nav */}
      {toastMessage && (
        <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 bg-purple-950 dark:bg-purple-900 text-white text-xs px-4 py-3 rounded-xl shadow-lg border border-purple-800 dark:border-purple-700 flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}