/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  FeedbackReport, 
  NavFilter, 
  RoleMode, 
  FeedbackStatus,
  ActivityItem,
  AuthUser,
  CampusEvent,
  ApprovedStudent,
  PendingStudent
} from './types';
import { isBirthdayToday } from './types';
import { 
  matchesExactWords, 
  exportCampusDataBackup,
  formatReportId,
  formatEventId
} from './utils';
import { 
  subscribeToReports, 
  subscribeToEvents, 
  saveReportToDb, 
  updateReportInDb, 
  deleteReportFromDb, 
  saveEventToDb, 
  updateEventInDb,
  deleteEventFromDb,
  subscribeToApprovedStudents,
  subscribeToPendingStudents,
  submitPendingStudent,
  approveStudentInDb,
  rejectStudentInDb,
  removeApprovedStudentInDb
} from './firebase';

import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { FeedbackList } from './components/FeedbackList';
import { FeedbackDetail } from './components/FeedbackDetail';
import { EventsSection } from './components/EventsSection';
import { NewFeedbackModal } from './components/NewFeedbackModal';
import { UserProfileModal } from './components/UserProfileModal';
import { GoogleAccountPickerModal } from './components/GoogleAccountPickerModal';
import { PortalPage } from './components/PortalPage';
import { PendingApprovalScreen } from './components/PendingApprovalScreen';
import { AdminStudentList } from './components/AdminStudentList';
import { 
  CheckCircle2, 
  Calendar, 
  Plus, 
  User as UserIcon, 
  LogOut,
  Inbox
} from 'lucide-react';

export default function App() {
  // 1. Force Login
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('campus_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed;
      }
    } catch { /* fallback */ }
    return null;
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);

  // 2. Core Data
  const [reports, setReports] = useState<FeedbackReport[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  
  // 3. Admin Approval Data
  const [approvedStudents, setApprovedStudents] = useState<ApprovedStudent[]>([]);
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [role, setRole] = useState<RoleMode>('student');
  const [currentFilter, setCurrentFilter] = useState<NavFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pageView, setPageView] = useState<'main' | 'detail' | 'student-list'>('main');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // 4. Connect to Firestore
  useEffect(() => {
    if (!currentUser) return;

    const unsubReports = subscribeToReports((data) => setReports(data));
    const unsubEvents = subscribeToEvents((data) => setEvents(data));
    const unsubApp = subscribeToApprovedStudents(setApprovedStudents);
    const unsubPend = subscribeToPendingStudents(setPendingStudents);

    return () => {
      unsubReports();
      unsubEvents();
      unsubApp();
      unsubPend();
    };
  }, [currentUser]);

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
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

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('campus_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('campus_auth_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg: string) => setToastMessage(msg);

  const handleSignIn = (user: AuthUser, initialSelectedId?: string) => {
    setCurrentUser(user);
    setRole(user.role);
    if (initialSelectedId) {
      setSelectedId(initialSelectedId);
      setPageView('detail');
    } else {
      setPageView('main');
    }
    showToast(`Verified and signed in as ${user.name}`);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setReports([]);
    setEvents([]);
    setPageView('main');
    showToast('Signed out securely.');
  };

  const handleExportBackup = () => {
    exportCampusDataBackup(reports, events, currentUser);
    showToast('Campus data backup downloaded.');
  };

  // --- DATABASE ACTIONS ---

  const handleDeleteReport = async (id: string) => {
    await deleteReportFromDb(id);
    showToast(`Report deleted from cloud.`);
    setPageView('main');
  };

  const handleDeleteEvent = async (id: string) => {
    if (role !== 'admin') return;
    await deleteEventFromDb(id);
    showToast(`Event deleted permanently.`);
  };

  const handleBulkUpdateStatus = async (ids: string[], newStatus: FeedbackStatus) => {
    const idSet = new Set(ids);
    const nowIso = new Date().toISOString();

    for (const r of reports) {
      if (idSet.has(r.id)) {
        const statusAct: ActivityItem = {
          id: `act-${Date.now()}-${r.id}`,
          author: currentUser?.name || 'Campus Administrator',
          role: 'admin',
          message: `Ticket status bulk-updated to ${newStatus.toUpperCase()}.`,
          timestamp: nowIso,
          statusChange: newStatus,
          badgeText: 'Official Campus Administrator',
        };
        await updateReportInDb(r.id, {
          status: newStatus,
          activities: [...r.activities, statusAct],
        });
      }
    }
    showToast(`Bulk updated ${ids.length} reports globally.`);
  };

  // --- EVENT RSVP & CREATION ---
  const handleToggleEventRsvp = async (id: string) => {
    if (!currentUser?.email) return; 
    const evt = events.find((e) => e.id === id);
    if (!evt) return;

    const attendees = evt.attendees || [];
    const hasUserRsvpd = attendees.includes(currentUser.email);

    let updatedAttendees;
    let nextCount;

    if (hasUserRsvpd) {
      updatedAttendees = attendees.filter(email => email !== currentUser.email);
      nextCount = Math.max(0, evt.rsvps - 1);
      showToast(`RSVP cancelled`);
    } else {
      updatedAttendees = [...attendees, currentUser.email];
      nextCount = evt.rsvps + 1;
      showToast(`RSVP confirmed`);
    }

    await updateEventInDb(id, { 
      rsvps: nextCount, 
      attendees: updatedAttendees 
    });
  };

  const handleAddEvent = async (newEventData: Omit<CampusEvent, 'id' | 'rsvps' | 'hasRsvpd'>) => {
    // Generate KCEV prefix
    const newId = `KCEV-${Math.floor(210 + Math.random() * 780)}`;
    const created: CampusEvent = {
      ...newEventData,
      id: newId,
      rsvps: currentUser?.email ? 1 : 0,
      attendees: currentUser?.email ? [currentUser.email] : [], 
    };
    await saveEventToDb(created);
    showToast(`Event ${formatEventId(created.id)} published globally!`);
  };

  // --- UPVOTE LOGIC ---
  const handleToggleUpvote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;

    const r = reports.find((rep) => rep.id === id);
    if (!r) return;

    const currentUserEmail = currentUser.email;
    const currentUserName = currentUser.name;
    const currentUserTitle = currentUser.title || 'Campus Student';

    const existingEndorsers = r.endorsers || [];
    const isAlreadyEndorsed = existingEndorsers.some((end) => end.email === currentUserEmail);

    let updatedEndorsers;
    let nextCount;

    if (isAlreadyEndorsed) {
      updatedEndorsers = existingEndorsers.filter((end) => end.email !== currentUserEmail);
      nextCount = Math.max(0, r.upvotes - 1);
      showToast(`Endorsement retracted.`);
    } else {
      updatedEndorsers = [
        {
          id: `end-${Date.now()}`,
          name: currentUserName,
          role: currentUserTitle,
          email: currentUserEmail,
          studentId: `STU-${Math.floor(2000 + Math.random() * 7900)}`,
          timestamp: new Date().toISOString(),
        },
        ...existingEndorsers,
      ];
      nextCount = r.upvotes + 1;
      showToast(`Endorsement added.`);
    }

    await updateReportInDb(id, {
      upvotes: nextCount,
      endorsers: updatedEndorsers,
    });
  };

  const handleUpdateStatus = async (id: string, newStatus: FeedbackStatus) => {
    const r = reports.find((rep) => rep.id === id);
    if (!r) return;

    const statusActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      author: role === 'admin' ? 'Campus Administration' : 'System',
      role: role === 'admin' ? 'admin' : 'system',
      message: `Ticket status manually changed from ${r.status} to ${newStatus}.`,
      timestamp: new Date().toISOString(),
      statusChange: newStatus,
    };

    await updateReportInDb(id, {
      status: newStatus,
      activities: [...r.activities, statusActivity],
    });
    showToast(`Status updated to "${newStatus}".`);
  };

  const handleAddActivity = async (
    id: string, 
    message: string, 
    activityRole: 'admin' | 'student', 
    statusChange?: FeedbackStatus
  ) => {
    const r = reports.find((rep) => rep.id === id);
    if (!r) return;

    const authorDisplay = activityRole === 'admin'
      ? (currentUser?.name || 'Dean of Students Operations')
      : (currentUser?.name || 'Student Reporter');

    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      author: authorDisplay,
      role: activityRole,
      message,
      timestamp: new Date().toISOString(),
      statusChange,
      badgeText: activityRole === 'admin' ? 'Official Campus Administrator' : undefined,
    };

    await updateReportInDb(id, {
      status: statusChange || r.status,
      activities: [...r.activities, newAct],
    });
    showToast(activityRole === 'admin' ? 'Official response published.' : 'Student reply posted.');
  };

  // --- REPORT CREATION ---
  const handleCreateReport = async (
    newReportData: Omit<FeedbackReport, 'id' | 'createdAt' | 'upvotes' | 'activities'>
  ) => {
    const randomNum = Math.floor(1050 + Math.random() * 8900);
    
    // Generate prefix based on type and status
    let prefix = 'KCIS';
    if (newReportData.type === 'initiative') prefix = 'KCIS';
    else if (newReportData.status === 'open') prefix = 'KCOI';
    else if (newReportData.status === 'in-review') prefix = 'KCIRV';
    else if (newReportData.status === 'resolved') prefix = 'KCRS';
    else if (newReportData.status === 'draft') prefix = 'KCDRF';
    
    const newId = `${prefix}-${randomNum}`;
    const nowIso = new Date().toISOString();

    const authorFinal = newReportData.isAnonymous
      ? 'Anonymous Student'
      : (currentUser?.name || newReportData.author);

    const studentIdGen = `STU-2026-${Math.floor(1000 + Math.random() * 8999)}`;
    const studentEmailGen = currentUser?.email || 'student@campus.edu';

    const createdReport: FeedbackReport = {
      ...newReportData,
      id: newId,
      author: authorFinal,
      authorRole: newReportData.isAnonymous ? 'Enrolled Student' : (currentUser?.title || newReportData.authorRole),
      authorRealName: newReportData.author,
      authorEmail: studentEmailGen,
      authorStudentId: studentIdGen,
      createdAt: nowIso,
      upvotes: 1,
      endorsers: [
        {
          id: `end-${Date.now()}`,
          name: authorFinal,
          role: currentUser?.title || 'Enrolled Student',
          email: studentEmailGen,
          studentId: studentIdGen,
          timestamp: nowIso,
        }
      ],
      activities: [
        {
          id: `act-${Date.now()}`,
          author: authorFinal,
          role: 'student',
          message: `${newReportData.type === 'issue' ? 'Issue filed' : 'Initiative proposal registered'} via Campus Feedback Assistant.`,
          timestamp: nowIso,
        },
        {
          id: `act-${Date.now() + 1}`,
          author: 'System Automated Router',
          role: 'system',
          message: `Assigned routing category: ${newReportData.category.toUpperCase()} -> Status set to Open.`,
          timestamp: nowIso,
        }
      ],
    };

    try {
      await saveReportToDb(createdReport);
      setReports((prev) => [createdReport, ...prev]);
      setSelectedId(newId);
      setPageView('detail');
      showToast(`Feedback ${formatReportId(newId, createdReport.type, createdReport.status)} submitted globally!`);
    } catch (error: any) {
      console.error("Submission failed:", error);
      showToast(`Failed to submit: ${error.message || 'Check your database rules'}`);
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      if (currentFilter === 'open' && item.status !== 'open') return false;
      if (currentFilter === 'in-review' && !(item.status === 'in-review' || item.status === 'in-progress')) return false;
      if (currentFilter === 'resolved' && item.status !== 'resolved') return false;
      if (currentFilter === 'drafts' && item.status !== 'draft') return false;
      if (currentFilter === 'facilities' && item.category !== 'facilities') return false;
      if (currentFilter === 'technology' && item.category !== 'technology') return false;
      if (currentFilter === 'academics' && item.category !== 'academics') return false;
      if (currentFilter === 'student-life' && item.category !== 'student-life') return false;
      if (currentFilter === 'safety' && item.category !== 'safety') return false;

      if (searchQuery.trim()) {
        const textToSearch = `${item.title} ${item.description} ${item.location} ${item.category} ${item.author} ${item.id} ${item.department || ''}`;
        if (!matchesExactWords(textToSearch, searchQuery)) return false;
      }
      return true;
    });
  }, [reports, currentFilter, searchQuery]);

  useEffect(() => {
    if (filteredReports.length > 0) {
      const exists = filteredReports.some((r) => r.id === selectedId);
      if (!exists) setSelectedId(filteredReports[0].id);
    } else {
      setSelectedId(null);
    }
  }, [filteredReports, selectedId]);

  const selectedReport = useMemo(() => {
    return reports.find((r) => r.id === selectedId) || null;
  }, [reports, selectedId]);

  const activeFilterTitle = useMemo(() => {
    switch (currentFilter) {
      case 'all': return 'All Campus Reports & Initiatives';
      case 'events': return 'Upcoming Events in the School';
      case 'open': return 'Open For Action';
      case 'in-review': return 'In Review & Active';
      case 'resolved': return 'Resolved Archives';
      case 'drafts': return 'Saved Drafts';
      case 'facilities': return 'Facilities & Maintenance';
      case 'technology': return 'IT & Network Systems';
      case 'academics': return 'Academic Initiatives';
      case 'student-life': return 'Student Life & Events';
      case 'safety': return 'Safety & Security';
      default: return 'Feedback Reports';
    }
  }, [currentFilter]);

  // --- RENDER LOGIC ---

  if (!currentUser) {
    return (
      <PortalPage 
        reports={reports} 
        events={events} 
        onSignIn={handleSignIn} 
      />
    );
  }

  // Check approval status
  const isApproved = currentUser.role === 'admin' || approvedStudents.some(s => s.email === currentUser.email);

  if (!isApproved) {
    return (
      <PendingApprovalScreen 
        currentUser={currentUser} 
        pendingStudents={pendingStudents} 
        onSubmit={(student) => {
          submitPendingStudent(student);
          showToast('Approval request sent to admins.');
        }} 
        onSignOut={handleSignOut} 
      />
    );
  }

  return (
    <div className="h-[100dvh] w-full max-w-full flex flex-col bg-[#faf8fc] text-slate-800 antialiased overflow-hidden select-none">
      <TopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenNewModal={() => setIsModalOpen(true)}
        totalCount={reports.length}
        openCount={reports.filter((r) => r.status === 'open').length}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenGoogleSignIn={() => setIsGoogleModalOpen(true)}
      />

      {isBirthdayToday(currentUser?.birthday) && (
        <div className="bg-gradient-to-r from-pink-600 via-amber-400 to-purple-700 text-white text-xs px-3 sm:px-5 py-2 flex items-center justify-between gap-2 shadow-xs shrink-0 select-none animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            <span className="text-base sm:text-lg animate-bounce shrink-0">🎂</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-white/25 backdrop-blur-xs text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/30">
                Birthday Honoree!
              </span>
              <span className="font-semibold text-xs sm:text-sm truncate">
                Happy Birthday, <strong className="font-black text-amber-100">{currentUser?.name}</strong>!
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="text-[11px] font-bold bg-white text-purple-950 px-3 py-1 rounded-lg hover:bg-pink-50 transition-colors shrink-0 shadow-2xs cursor-pointer touch-manipulation"
          >
            Edit Profile
          </button>
        </div>
      )}

      {role === 'admin' && (
        <div className="bg-purple-900 text-purple-100 text-[11px] px-3 sm:px-4 py-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-purple-800 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping shrink-0" />
            <span className="font-semibold text-white">Campus Administrator Triage Active:</span>
            <span className="hidden md:inline">Authorized as {currentUser?.name || 'Staff'}. You have permissions to reclassify urgencies, update ticket statuses, and publish official university replies.</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {isSidebarOpen && (
          <Sidebar
            currentFilter={currentFilter}
            onSelectFilter={(filter) => {
              setCurrentFilter(filter);
              setPageView('main');
            }}
            onOpenNewModal={() => setIsModalOpen(true)}
            reports={reports}
            role={role}
            eventsCount={events.length}
            onClose={() => setIsSidebarOpen(false)}
            onSignOut={handleSignOut}
            onExportBackup={handleExportBackup}
            onOpenStudentList={() => setPageView('student-list')} // <--- NEW PROP
          />
        )}

        {/* VIEW ROUTER */}
        {pageView === 'student-list' && role === 'admin' ? (
          <AdminStudentList 
            pendingStudents={pendingStudents}
            approvedStudents={approvedStudents}
            onApprove={approveStudentInDb}
            onReject={rejectStudentInDb}
            onRemove={removeApprovedStudentInDb}
            onBack={() => setPageView('main')}
          />
        ) : currentFilter === 'events' ? (
          <EventsSection
            events={events}
            role={role}
            currentUser={currentUser} 
            onToggleRsvp={handleToggleEventRsvp}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent} 
            onSelectFeedbackReport={(fbId) => {
              setSelectedId(fbId);
              setCurrentFilter('all');
              setPageView('detail');
            }}
            onBackToReports={() => setCurrentFilter('all')}
          />
        ) : pageView === 'main' ? (
          <FeedbackList
            reports={filteredReports}
            selectedId={selectedId}
            currentUser={currentUser} 
            onSelectReport={(id) => {
              setSelectedId(id);
              setPageView('detail');
            }}
            onToggleUpvote={handleToggleUpvote}
            activeFilterTitle={activeFilterTitle}
            onNavigateToEvents={() => setCurrentFilter('events')}
            eventsCount={events.length}
            role={role}
            onBulkUpdateStatus={handleBulkUpdateStatus}
          />
        ) : (
          <FeedbackDetail
            report={selectedReport}
            role={role}
            currentUser={currentUser}
            onUpdateStatus={handleUpdateStatus}
            onAddActivity={handleAddActivity}
            onToggleUpvote={handleToggleUpvote}
            onBack={() => setPageView('main')}
            onDeleteReport={handleDeleteReport}
            otherReports={reports.filter((r) => r.id !== selectedId)}
            onSelectOtherReport={(id) => {
              setSelectedId(id);
            }}
          />
        )}
      </div>

      {!isKeyboardActive && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-purple-100 px-3 py-2 flex items-center justify-around shadow-lg">
          <button
            onClick={() => {
              setCurrentFilter('all');
              setPageView('main');
            }}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
              currentFilter !== 'events' && pageView === 'main' ? 'text-purple-900' : 'text-purple-400'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Reports</span>
          </button>

          <button
            onClick={() => setCurrentFilter('events')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
              currentFilter === 'events' ? 'text-pink-600' : 'text-purple-400'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Events</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex flex-col items-center justify-center -mt-4 w-11 h-11 rounded-full bg-gradient-to-r from-purple-800 to-pink-600 text-white shadow-md active:scale-95 transition-transform cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex flex-col items-center gap-1 text-[10px] font-semibold text-purple-400 hover:text-purple-900 transition-colors cursor-pointer"
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile</span>
          </button>

          <button
            onClick={handleSignOut}
            className="flex flex-col items-center gap-1 text-[10px] font-semibold text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}

      <NewFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateReport}
        existingReports={reports}
        onSelectExistingReport={(id) => {
          setSelectedId(id);
          setPageView('detail');
        }}
      />

      {currentUser && (
        <UserProfileModal
          user={currentUser}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={(updated) => {
            setCurrentUser(updated);
            showToast(`Profile updated successfully.`);
          }}
          onSignOut={handleSignOut}
          onExportBackup={handleExportBackup}
        />
      )}

      <GoogleAccountPickerModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={(user) => {
          handleSignIn(user);
          setIsGoogleModalOpen(false);
        }}
      />

      {toastMessage && (
        <div className="fixed bottom-16 md:bottom-5 right-5 z-50 bg-purple-950 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg border border-purple-800 flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}