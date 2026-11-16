import React, { useState, useMemo, useEffect } from 'react';
import { 
  FeedbackReport, NavFilter, RoleMode, FeedbackStatus, ActivityItem, CampusEvent, UserProfile, CampusAnnouncement 
} from './types';
import { 
  matchesExactWords, exportCampusDataBackup, formatReportId 
} from './utils';
import { 
  auth, isFirebaseConfigured, subscribeToReports, subscribeToEvents, saveReportToDb, updateReportInDb, 
  appendActivityToReportInDb, deleteReportFromDb, saveEventToDb, updateEventInDb, deleteEventFromDb,
  subscribeToUsers, createUserProfile, approveUserInDb, rejectUserInDb, removeUserInDb,
  getUserProfile, signOutReal, signInWithGoogleReal, updateUserLastActive,
  subscribeToAnnouncements, saveAnnouncementToDb, updateAnnouncementInDb, voteAnnouncementPollInDb, deleteAnnouncementFromDb
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { NoticeAnnouncementPayload } from './components/NoticeBoard';

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
import { AdminApprovalQueue } from './components/AdminApprovalQueue';
import { GoogleAccountPickerModal } from './components/GoogleAccountPickerModal';
import { AdminAnalyticsModal } from './components/AdminAnalyticsModal';
import { HomeScreen } from './components/HomeScreen';
import { CheckCircle2, Calendar, Plus, User as UserIcon, Inbox, Home } from 'lucide-react';

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Modals & Navigation
  const [isGooglePickerOpen, setIsGooglePickerOpen] = useState(false);
  const [loginRole, setLoginRole] = useState<'student' | 'admin'>('student');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNewFeedbackModalOpen, setIsNewFeedbackModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<FeedbackReport | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  
  // Core Data
  const [reports, setReports] = useState<FeedbackReport[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [announcements, setAnnouncements] = useState<CampusAnnouncement[]>([]);
  
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
    const unsubA = subscribeToAnnouncements(setAnnouncements);
    return () => { unsubR(); unsubE(); unsubU(); unsubA(); };
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

  // Online presence heartbeat (every 60s & on tab visibility change)
  useEffect(() => {
    if (!userProfile?.email) return;
    updateUserLastActive(userProfile.email);
    const interval = setInterval(() => {
      updateUserLastActive(userProfile.email);
    }, 60_000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && userProfile?.email) {
        updateUserLastActive(userProfile.email);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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

  const handleUpdateStatus = async (id: string, newStatus: FeedbackStatus, adminNote?: string) => {
    const r = reports.find(rep => rep.id === id);
    if (!r) return;
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`, author: userProfile?.name || 'Admin', role: 'admin',
      message: adminNote?.trim()
        ? `${adminNote.trim()} (Status changed to ${newStatus.toUpperCase()})`
        : `Status manually changed to ${newStatus.toUpperCase()}.`,
      timestamp: new Date().toISOString(), statusChange: newStatus,
      badgeText: 'Official Staff'
    };
    const extraUpdates: Partial<FeedbackReport> =
      newStatus === 'resolved' && adminNote?.trim()
        ? { resolutionNotes: adminNote.trim() }
        : {};
    setReports(prev => prev.map(rep => rep.id === id ? { 
      ...rep, status: newStatus, ...extraUpdates, activities: [...(rep.activities || []), newActivity] 
    } : rep));
    await appendActivityToReportInDb(id, newActivity, newStatus, extraUpdates);
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
    const extraUpdates: Partial<FeedbackReport> =
      statusChange === 'resolved' && message.trim()
        ? { resolutionNotes: message.trim() }
        : {};
    setReports(prev => prev.map(rep => rep.id === id ? { 
      ...rep, status: nextStatus, ...extraUpdates, activities: [...(rep.activities || []), newActivity] 
    } : rep));
    await appendActivityToReportInDb(id, newActivity, statusChange, extraUpdates);
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
        await appendActivityToReportInDb(id, newActivity, newStatus);
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
    if (!hasUserRsvpd && evt.capacity && evt.rsvps >= evt.capacity) {
      showToast('This event has reached full capacity.');
      return;
    }
    const nextCount = hasUserRsvpd ? Math.max(0, evt.rsvps - 1) : evt.rsvps + 1;
    const updatedAttendees = hasUserRsvpd ? attendees.filter(e => e !== userProfile.email) : [...attendees, userProfile.email];
    setEvents(prev => prev.map(e => e.id === id ? { ...e, rsvps: nextCount, attendees: updatedAttendees } : e));
    await updateEventInDb(id, { rsvps: nextCount, attendees: updatedAttendees });
    showToast(hasUserRsvpd ? `RSVP cancelled` : `RSVP confirmed`);
  };

  const handleAddEvent = async (newEventData: Omit<CampusEvent, 'id' | 'rsvps' | 'hasRsvpd'>) => {
    let newId = `KCEV-${Math.floor(210 + Math.random() * 780)}`;
    while (events.some(e => e.id === newId)) {
      newId = `KCEV-${Math.floor(210 + Math.random() * 780)}`;
    }
    const fullEvent: CampusEvent = {
      ...newEventData,
      id: newId,
      rsvps: userProfile?.email ? 1 : 0,
      attendees: userProfile?.email ? [userProfile.email] : [],
    };
    setEvents(prev => [fullEvent, ...prev]);
    await saveEventToDb(fullEvent);
    showToast(`Event published!`);
  };

  const handleTogglePin = async (id: string) => {
    if (role !== 'admin') return;
    const r = reports.find((rep) => rep.id === id);
    if (!r) return;
    const nextPinned = !r.pinned;
    setReports(prev => prev.map(rep => rep.id === id ? { ...rep, pinned: nextPinned } : rep));
    await updateReportInDb(id, { pinned: nextPinned });
    showToast(nextPinned ? 'Report pinned to top of feed.' : 'Report unpinned.');
  };

  const handleAddAnnouncement = async (payload: NoticeAnnouncementPayload) => {
    if (role !== 'admin') return;
    const newAnnouncement: CampusAnnouncement = {
      id: `ann-${Date.now()}`,
      type: payload.type || 'notice',
      title: payload.title.trim(),
      message: payload.message.trim(),
      author: userProfile?.name || "Students' Council",
      createdAt: new Date().toISOString(),
      pinned: Boolean(payload.pinned),
      pollOptions: payload.pollOptions,
    };
    setAnnouncements(prev => {
      const next = [newAnnouncement, ...prev];
      return next.sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));
    });
    await saveAnnouncementToDb(newAnnouncement);
    showToast(`${payload.type === 'poll' ? 'Poll' : payload.type === 'alert' ? 'Alert' : payload.type === 'update' ? 'Update' : 'Notice'} posted to board.`);
  };

  const handleUpdateAnnouncement = async (id: string, updates: NoticeAnnouncementPayload) => {
    if (role !== 'admin') return;
    const nowIso = new Date().toISOString();
    const patch: Partial<CampusAnnouncement> = {
      type: updates.type,
      title: updates.title.trim(),
      message: updates.message.trim(),
      pinned: Boolean(updates.pinned),
      pollOptions: updates.pollOptions,
      updatedAt: nowIso,
    };
    setAnnouncements(prev =>
      prev
        .map(a => (a.id === id ? { ...a, ...patch } : a))
        .sort((a, b) => {
          const pinDiff = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
          if (pinDiff !== 0) return pinDiff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
    );
    await updateAnnouncementInDb(id, patch);
    showToast('Notice board item updated.');
  };

  const handleToggleAnnouncementPin = async (id: string) => {
    if (role !== 'admin') return;
    const target = announcements.find(a => a.id === id);
    if (!target) return;
    const nextPinned = !target.pinned;
    setAnnouncements(prev =>
      prev
        .map(a => (a.id === id ? { ...a, pinned: nextPinned } : a))
        .sort((a, b) => {
          const pinDiff = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
          if (pinDiff !== 0) return pinDiff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
    );
    await updateAnnouncementInDb(id, { pinned: nextPinned });
    showToast(nextPinned ? 'Notice pinned to top.' : 'Notice unpinned.');
  };

  const handleVoteAnnouncementPoll = async (announcementId: string, optionId: string) => {
    if (!userProfile?.email) return;
    const voterEmail = userProfile.email;
    const normalized = voterEmail.trim().toLowerCase();
    setAnnouncements(prev =>
      prev.map(ann => {
        if (ann.id !== announcementId) return ann;
        const options = ann.pollOptions || [];
        const target = options.find(o => o.id === optionId);
        const alreadyVoted = Boolean(target?.voters.some(v => v.toLowerCase() === normalized));
        return {
          ...ann,
          pollOptions: options.map(opt => {
            const filtered = (opt.voters || []).filter(v => v.toLowerCase() !== normalized);
            if (opt.id === optionId && !alreadyVoted) {
              return { ...opt, voters: [...filtered, voterEmail] };
            }
            return { ...opt, voters: filtered };
          }),
        };
      })
    );
    await voteAnnouncementPollInDb(announcementId, voterEmail, optionId);
    showToast('Poll vote recorded.');
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (role !== 'admin') return;
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    await deleteAnnouncementFromDb(id);
    showToast('Notice removed.');
  };

  const handleToggleUpvote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userProfile) return;
    const r = reports.find((rep) => rep.id === id);
    if (!r || r.status === 'draft') return;
    const existingEndorsers = r.endorsers || [];
    const isAlreadyEndorsed = existingEndorsers.some((end) => end.email === userProfile.email);
    let updatedEndorsers;
    if (isAlreadyEndorsed) {
      updatedEndorsers = existingEndorsers.filter((end) => end.email !== userProfile.email);
      showToast(`Support retracted.`);
    } else {
      updatedEndorsers = [{ id: `end-${Date.now()}`, name: userProfile.name, role: userProfile.title || userProfile.role, email: userProfile.email, timestamp: new Date().toISOString() }, ...existingEndorsers];
      showToast(`Support added.`);
    }
    const nextUpvotes = isAlreadyEndorsed ? Math.max(0, r.upvotes - 1) : r.upvotes + 1;
    setReports(prev => prev.map(rep => rep.id === id ? { ...rep, upvotes: nextUpvotes, endorsers: updatedEndorsers } : rep));
    await updateReportInDb(id, { upvotes: nextUpvotes, endorsers: updatedEndorsers });
  };

  const handlePublishDraft = async (id: string) => {
    const r = reports.find(rep => rep.id === id);
    if (!r || r.status !== 'draft') return;
    const nowIso = new Date().toISOString();
    const nextStatus: FeedbackStatus = r.type === 'initiative' ? 'pending-review' : 'open';
    const hasEndorsers = (r.endorsers?.length || 0) > 0;
    const endorsers = hasEndorsers
      ? r.endorsers
      : userProfile?.email
      ? [{ id: `end-${Date.now()}`, name: userProfile.name, role: userProfile.title || userProfile.role, email: userProfile.email, timestamp: nowIso }]
      : [];
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      author: r.isAnonymous ? 'Anonymous Student' : (userProfile?.name || 'Student'),
      role: 'student',
      message: r.type === 'initiative'
        ? "Published draft proposal for Students' Council review."
        : 'Published draft report.',
      timestamp: nowIso,
      statusChange: nextStatus,
    };
    const updatedReport: FeedbackReport = {
      ...r,
      status: nextStatus,
      createdAt: nowIso,
      upvotes: r.upvotes > 0 ? r.upvotes : 1,
      endorsers,
      activities: [...(r.activities || []), newActivity],
    };
    setReports(prev => prev.map(rep => rep.id === id ? updatedReport : rep));
    await saveReportToDb(updatedReport);
    showToast(r.type === 'initiative' ? 'Draft submitted for council review!' : 'Draft published!');
  };

  const handleSaveOrUpdateReport = async (newReportData: any, editingId?: string) => {
    const nowIso = new Date().toISOString();

    if (editingId) {
      const existing = reports.find(r => r.id === editingId);
      if (!existing) return;

      const isDraftSave = newReportData.status === 'draft';
      const nextStatus: FeedbackStatus = isDraftSave
        ? 'draft'
        : newReportData.type === 'initiative'
        ? 'pending-review'
        : 'open';

      const publishingFromDraft = existing.status === 'draft' && nextStatus !== 'draft';
      const resubmittingDeclined = existing.status === 'rejected' && nextStatus !== 'draft';

      const newActivity: ActivityItem = {
        id: `act-${Date.now()}`,
        author: newReportData.isAnonymous ? 'Anonymous Student' : (userProfile?.name || 'Student'),
        role: 'student',
        message: isDraftSave
          ? 'Updated draft.'
          : resubmittingDeclined
          ? 'Revised and resubmitted proposal for council review.'
          : publishingFromDraft
          ? (newReportData.type === 'initiative' ? "Published proposal for Students' Council review." : 'Published draft report.')
          : 'Updated report details.',
        timestamp: nowIso,
        ...(existing.status !== nextStatus ? { statusChange: nextStatus } : {}),
      };

      const endorsers =
        nextStatus !== 'draft' && (!existing.endorsers || existing.endorsers.length === 0) && userProfile?.email
          ? [{ id: `end-${Date.now()}`, name: userProfile.name, role: userProfile.title || userProfile.role, email: userProfile.email, timestamp: nowIso }]
          : existing.endorsers;

      const updatedReport: FeedbackReport = {
        ...existing,
        ...newReportData,
        id: editingId,
        status: nextStatus,
        createdAt: publishingFromDraft ? nowIso : existing.createdAt,
        upvotes: nextStatus === 'draft' ? 0 : (existing.upvotes > 0 ? existing.upvotes : 1),
        endorsers,
        rejectionReason: resubmittingDeclined ? undefined : existing.rejectionReason,
        activities: [...(existing.activities || []), newActivity],
      };

      setReports(prev => prev.map(rep => rep.id === editingId ? updatedReport : rep));
      await saveReportToDb(updatedReport);
      setEditingReport(null);
      setSelectedId(editingId);
      setPageView('detail');
      showToast(
        isDraftSave
          ? 'Draft updated.'
          : resubmittingDeclined
          ? 'Proposal revised and resubmitted!'
          : 'Report published!'
      );
      return;
    }

    const isDraft = newReportData.status === 'draft';
    const initialStatus: FeedbackStatus = isDraft
      ? 'draft'
      : newReportData.type === 'initiative'
      ? 'pending-review'
      : (newReportData.status || 'open');

    const prefix = isDraft ? 'KCDRF' : newReportData.type === 'initiative' ? 'KCIS' : 'KCOI';
    let newId = `${prefix}-${Math.floor(1050 + Math.random() * 8900)}`;
    while (reports.some(r => r.id === newId)) {
      newId = `${prefix}-${Math.floor(1050 + Math.random() * 8900)}`;
    }

    const createdReport: FeedbackReport = {
      ...newReportData, 
      id: newId,
      status: initialStatus,
      author: newReportData.author || userProfile?.name || 'Student', 
      authorEmail: userProfile?.email,
      authorRole: newReportData.authorRole || userProfile?.title || 'Student',
      authorRealName: userProfile?.name,
      authorStudentId: userProfile?.id,
      createdAt: nowIso, 
      upvotes: isDraft ? 0 : 1,
      endorsers: isDraft
        ? []
        : [{ id: `end-${Date.now()}`, name: userProfile?.name || 'Student', role: userProfile?.title || userProfile?.role || 'Student', email: userProfile?.email || '', timestamp: nowIso }],
      activities: [{
        id: `act-${Date.now()}`,
        author: newReportData.isAnonymous ? 'Anonymous Student' : (userProfile?.name || 'Student'),
        role: 'student',
        message: isDraft
          ? 'Saved report as draft.'
          : newReportData.type === 'initiative'
          ? "Submitted proposal for Students' Council review."
          : 'Submitted report.',
        timestamp: nowIso,
      }],
    };
    setReports((prev) => [createdReport, ...prev]);
    await saveReportToDb(createdReport);
    setSelectedId(newId); 
    setPageView('detail');
    if (isDraft) {
      showToast('Draft saved! View it anytime under Drafts.');
    } else if (createdReport.type === 'initiative') {
      showToast('Initiative proposal submitted for council review!');
    } else {
      showToast(`Report ${formatReportId(newId, createdReport.type, createdReport.status)} submitted!`);
    }
  };

  const handleApproveInitiative = async (id: string) => {
    if (role !== 'admin') return;
    const nowIso = new Date().toISOString();
    const targetReport = reports.find(r => r.id === id);
    if (!targetReport) return;
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      author: userProfile?.name || 'Council Staff',
      role: 'admin',
      message: 'Initiative proposal approved for Students\' Council action.',
      timestamp: nowIso,
      statusChange: 'open',
      badgeText: 'Official Council'
    };
    const updatedActivities = [...(targetReport.activities || []), newActivity];
    setReports(prev => prev.map(rep => rep.id === id ? {
      ...rep,
      status: 'open',
      reviewedBy: userProfile?.name || 'Council Staff',
      reviewedAt: nowIso,
      activities: updatedActivities
    } : rep));
    await appendActivityToReportInDb(id, newActivity, 'open', {
      reviewedBy: userProfile?.name || 'Council Staff',
      reviewedAt: nowIso,
    });
    showToast('Initiative proposal approved!');
  };

  const handleRejectInitiative = async (id: string, reason?: string) => {
    if (role !== 'admin') return;
    const nowIso = new Date().toISOString();
    const targetReport = reports.find(r => r.id === id);
    if (!targetReport) return;
    const rejectionMsg = reason?.trim() 
      ? `Initiative proposal declined. Reason: "${reason.trim()}"`
      : 'Initiative proposal declined by council administration.';
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      author: userProfile?.name || 'Council Staff',
      role: 'admin',
      message: rejectionMsg,
      timestamp: nowIso,
      statusChange: 'rejected',
      badgeText: 'Official Council'
    };
    const updatedActivities = [...(targetReport.activities || []), newActivity];
    setReports(prev => prev.map(rep => rep.id === id ? {
      ...rep,
      status: 'rejected',
      rejectionReason: reason?.trim() || undefined,
      reviewedBy: userProfile?.name || 'Council Staff',
      reviewedAt: nowIso,
      activities: updatedActivities
    } : rep));
    await appendActivityToReportInDb(id, newActivity, 'rejected', {
      rejectionReason: reason?.trim() || undefined,
      reviewedBy: userProfile?.name || 'Council Staff',
      reviewedAt: nowIso,
    });
    showToast('Initiative proposal declined.');
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
    exportCampusDataBackup(reports, events, userProfile, announcements);
    showToast('Data backup downloaded.');
  };
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string);
        if (!backup || (!Array.isArray(backup.reports) && !Array.isArray(backup.events) && !Array.isArray(backup.announcements))) {
          showToast('Invalid backup file: no reports, events, or announcements found.');
          return;
        }
        if (Array.isArray(backup.reports)) {
          setReports(backup.reports);
          for (const rep of backup.reports) await saveReportToDb(rep);
        }
        if (Array.isArray(backup.events)) {
          setEvents(backup.events);
          for (const ev of backup.events) await saveEventToDb(ev);
        }
        if (Array.isArray(backup.announcements)) {
          setAnnouncements(backup.announcements);
          for (const ann of backup.announcements) await saveAnnouncementToDb(ann);
        }
        if (backup.user && backup.user.email) {
          setUserProfile(backup.user);
          setRole(backup.user.role || 'student');
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
      const isAuthor = Boolean(
        userProfile && (item.authorEmail === userProfile.email || item.author === userProfile.name)
      );
      const searchableText = `${formatReportId(item.id, item.type, item.status)} ${item.id} ${item.title} ${item.description} ${item.location} ${item.isAnonymous ? '' : item.author}`;

      // Pending council approvals view (admin only)
      if (currentFilter === 'pending-approvals') {
        if (item.status !== 'pending-review') return false;
        return !searchQuery.trim() || matchesExactWords(searchableText, searchQuery);
      }

      // Drafts filter shows only current user's drafts
      if (currentFilter === 'drafts') {
        if (item.status !== 'draft' || !isAuthor) return false;
        return !searchQuery.trim() || matchesExactWords(searchableText, searchQuery);
      }

      // Never show drafts outside the Drafts tab
      if (item.status === 'draft') return false;

      // Hide pending-review reports from general feed unless author or admin
      if (item.status === 'pending-review' && !isAuthor && role !== 'admin') {
        return false;
      }

      if (currentFilter === 'open' && item.status !== 'open') return false;
      if (currentFilter === 'in-review' && !(item.status === 'in-review' || item.status === 'in-progress')) return false;
      if (currentFilter === 'resolved' && item.status !== 'resolved') return false;
      
      if (currentFilter === 'my-activity') {
        if (!userProfile) return false;
        const isEndorser = item.endorsers?.some(e => e.email === userProfile.email);
        if (!isAuthor && !isEndorser) return false;
      }

      if (currentFilter === 'facilities' && item.category !== 'facilities') return false;
      if (currentFilter === 'technology' && item.category !== 'technology') return false;
      if (currentFilter === 'academics' && item.category !== 'academics') return false;
      if (currentFilter === 'student-life' && item.category !== 'student-life') return false;
      if (currentFilter === 'safety' && item.category !== 'safety') return false;
      
      if (searchQuery.trim() && !matchesExactWords(searchableText, searchQuery)) return false;
      return true;
    });
  }, [reports, currentFilter, searchQuery, userProfile, role]);

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
          existingUsers={allUsers}
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
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim() && (pageView === 'home' || pageView === 'detail' || currentFilter === 'events')) {
            setCurrentFilter('all');
            setPageView('main');
          }
        }} 
        onOpenNewModal={() => { setEditingReport(null); setIsNewFeedbackModalOpen(true); }} 
        totalCount={reports.filter(r => r.status !== 'draft').length} 
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
            onOpenNewModal={() => { setEditingReport(null); setIsNewFeedbackModalOpen(true); }} 
            reports={reports} 
            role={role} 
            currentUser={userProfile}
            eventsCount={events.length}
            announcements={announcements}
            onAddAnnouncement={handleAddAnnouncement}
            onUpdateAnnouncement={handleUpdateAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onVoteAnnouncementPoll={handleVoteAnnouncementPoll}
            onToggleAnnouncementPin={handleToggleAnnouncementPin}
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
            role={role}
            reports={reports}
            events={events}
            allUsers={allUsers}
            announcements={announcements}
            onAddAnnouncement={handleAddAnnouncement}
            onUpdateAnnouncement={handleUpdateAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onVoteAnnouncementPoll={handleVoteAnnouncementPoll}
            onToggleAnnouncementPin={handleToggleAnnouncementPin}
            onSelectReport={(id) => { setSelectedId(id); setPageView('detail'); }}
            onToggleUpvote={handleToggleUpvote}
            onNavigateToEvents={() => { setCurrentFilter('events'); setPageView('main'); }}
            onNavigateToReports={() => { setCurrentFilter('all'); setPageView('main'); }}
            onOpenNewModal={() => { setEditingReport(null); setIsNewFeedbackModalOpen(true); }}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />
        ) : pageView === 'student-list' && role === 'admin' ? (
          <AdminStudentList 
            allUsers={allUsers}
            currentUserEmail={userProfile.email}
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
        ) : currentFilter === 'pending-approvals' && role === 'admin' && pageView === 'main' ? (
          <AdminApprovalQueue
            pendingReports={filteredReports}
            onApprove={handleApproveInitiative}
            onReject={handleRejectInitiative}
            onSelectReport={(id) => { setSelectedId(id); setPageView('detail'); }}
          />
        ) : pageView === 'main' ? (
          <FeedbackList 
            reports={filteredReports} selectedId={selectedId} 
            currentUser={userProfile as any} allUsers={allUsers} 
            onSelectReport={(id) => { setSelectedId(id); setPageView('detail'); }} 
            onToggleUpvote={handleToggleUpvote} 
            activeFilterTitle={
              currentFilter === 'all' ? 'All Reports' :
              currentFilter === 'pending-approvals' ? 'Pending Council Approvals' :
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
            onOpenNewModal={() => { setEditingReport(null); setIsNewFeedbackModalOpen(true); }}
          />
        ) : (
          <FeedbackDetail 
            report={reports.find(r => r.id === selectedId) || null} 
            role={role}
            currentUser={userProfile as any}
            allUsers={allUsers}
            onUpdateStatus={handleUpdateStatus}
            onAddActivity={handleAddActivity} 
            onToggleUpvote={handleToggleUpvote} 
            onBack={() => setPageView('main')} 
            onDeleteReport={handleDeleteReport}
            onTogglePin={handleTogglePin}
            onApproveInitiative={handleApproveInitiative}
            onRejectInitiative={handleRejectInitiative}
            onEditReport={(rep) => {
              setEditingReport(rep);
              setIsNewFeedbackModalOpen(true);
            }}
            onPublishDraft={handlePublishDraft}
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
            onClick={() => { setEditingReport(null); setIsNewFeedbackModalOpen(true); }}
            className="flex flex-col items-center justify-center -mt-5 w-12 h-12 rounded-full bg-gradient-to-r from-purple-800 to-indigo-700 text-white shadow-lg active:scale-95 transition-transform cursor-pointer"
          >
            <Plus className="w-6 h-6" />
          </button>
          <button
            onClick={() => { setCurrentFilter('events'); setPageView('main'); }}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
              currentFilter === 'events' ? 'text-purple-900 dark:text-purple-200' : 'text-purple-400'
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
        onClose={() => { setIsNewFeedbackModalOpen(false); setEditingReport(null); }}
        onSubmit={handleSaveOrUpdateReport}
        existingReports={reports}
        onSelectExistingReport={(id) => {
          setSelectedId(id); setPageView('detail'); setIsNewFeedbackModalOpen(false); setEditingReport(null);
        }}
        currentUser={userProfile}
        editingReport={editingReport}
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
          <CheckCircle2 className="w-4 h-4 text-purple-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}