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
  CampusEvent
} from './types';
import { isBirthdayToday } from './types';
import { INITIAL_REPORTS, INITIAL_EVENTS } from './mockData';
import { 
  matchesExactWords, 
  safeLocalStorageSet, 
  exportCampusDataBackup 
} from './utils';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { FeedbackList } from './components/FeedbackList';
import { FeedbackDetail } from './components/FeedbackDetail';
import { EventsSection } from './components/EventsSection';
import { NewFeedbackModal } from './components/NewFeedbackModal';
import { UserProfileModal } from './components/UserProfileModal';
import { PortalPage } from './components/PortalPage';
import { 
  CheckCircle2, 
  Sparkles, 
  Cake, 
  Layers, 
  Calendar, 
  Plus, 
  User as UserIcon, 
  LogOut,
  Inbox
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);

  // Fix #10 & #3: Safe localStorage loading and resilient seed fallback
  const [reports, setReports] = useState<FeedbackReport[]>(() => {
    try {
      const saved = localStorage.getItem('campus_feedback_reports');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // fallback
    }
    return INITIAL_REPORTS;
  });

  const [events, setEvents] = useState<CampusEvent[]>(() => {
    try {
      const saved = localStorage.getItem('campus_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // fallback
    }
    return INITIAL_EVENTS;
  });

  const [selectedId, setSelectedId] = useState<string | null>(() => {
    return INITIAL_REPORTS[0]?.id || null;
  });

  const [role, setRole] = useState<RoleMode>('student');
  const [currentFilter, setCurrentFilter] = useState<NavFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pageView, setPageView] = useState<'main' | 'detail'>('main');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Fix #15: Virtual keyboard detection to hide mobile bottom bar while typing
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        setIsKeyboardActive(true);
      }
    };

    const handleFocusOut = () => {
      setIsKeyboardActive(false);
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const handleSignIn = (user: AuthUser, initialSelectedId?: string) => {
    setCurrentUser(user);
    setRole(user.role);
    if (initialSelectedId) {
      setSelectedId(initialSelectedId);
      setPageView('detail');
    } else {
      setPageView('main');
    }
    showToast(`Signed in as ${user.name} (${user.role === 'admin' ? 'Campus Admin' : 'Student'})`);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setPageView('main');
    showToast('Returned to Campus Portal.');
  };

  // Fix #3: Safe localStorage persistence that catches QuotaExceededError
  useEffect(() => {
    safeLocalStorageSet('campus_feedback_reports', reports);
  }, [reports]);

  useEffect(() => {
    safeLocalStorageSet('campus_events', events);
  }, [events]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Fix #10: Export & Import backup handlers
  const handleExportBackup = () => {
    exportCampusDataBackup(reports, events, currentUser);
    showToast('Campus data vault backup downloaded (.json).');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.reports && Array.isArray(parsed.reports)) {
          setReports(parsed.reports);
          safeLocalStorageSet('campus_feedback_reports', parsed.reports);
        }
        if (parsed.events && Array.isArray(parsed.events)) {
          setEvents(parsed.events);
          safeLocalStorageSet('campus_events', parsed.events);
        }
        if (parsed.user) {
          setCurrentUser(parsed.user);
        }
        showToast('All campus reports and profile restored successfully from backup!');
      } catch (err) {
        showToast('Failed to parse backup file. Please select a valid JSON backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Fix #5: Student/Admin Delete Report Handler
  const handleDeleteReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    showToast(`Report #${id} has been permanently deleted.`);
    setPageView('main');
  };

  // Fix #12: Admin Bulk Update Status Handler
  const handleBulkUpdateStatus = (ids: string[], newStatus: FeedbackStatus) => {
    const nowIso = new Date().toISOString();
    const idSet = new Set(ids);

    setReports((prev) =>
      prev.map((r) => {
        if (idSet.has(r.id)) {
          const statusAct: ActivityItem = {
            id: `act-${Date.now()}-${r.id}`,
            author: currentUser?.name || 'Campus Administrator',
            role: 'admin',
            message: `Ticket status bulk-updated to ${newStatus.toUpperCase()} during triage review.`,
            timestamp: nowIso,
            statusChange: newStatus,
            badgeText: 'Official Campus Administrator',
          };
          return {
            ...r,
            status: newStatus,
            activities: [...r.activities, statusAct],
          };
        }
        return r;
      })
    );

    showToast(`Bulk updated status of ${ids.length} reports to "${newStatus}".`);
  };

  const handleToggleEventRsvp = (id: string) => {
    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === id) {
          const nextHasRsvpd = !evt.hasRsvpd;
          const nextCount = nextHasRsvpd ? evt.rsvps + 1 : Math.max(0, evt.rsvps - 1);
          showToast(nextHasRsvpd ? `RSVP confirmed for "${evt.title}"` : `RSVP cancelled for "${evt.title}"`);
          return {
            ...evt,
            rsvps: nextCount,
            hasRsvpd: nextHasRsvpd,
          };
        }
        return evt;
      })
    );
  };

  const handleAddEvent = (newEventData: Omit<CampusEvent, 'id' | 'rsvps' | 'hasRsvpd'>) => {
    const newId = `EVT-${Math.floor(210 + Math.random() * 780)}`;
    const created: CampusEvent = {
      ...newEventData,
      id: newId,
      rsvps: 1,
      hasRsvpd: true,
    };
    setEvents((prev) => [created, ...prev]);
    showToast(`Event "${created.title}" published to campus roster!`);
  };

  // Fix #8: Filtered reports with exact-word matching instead of partial letters
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      // 1. Sidebar Filter
      if (currentFilter === 'open' && item.status !== 'open') return false;
      if (currentFilter === 'in-review' && !(item.status === 'in-review' || item.status === 'in-progress')) return false;
      if (currentFilter === 'resolved' && item.status !== 'resolved') return false;
      if (currentFilter === 'drafts' && item.status !== 'draft') return false;
      if (currentFilter === 'facilities' && item.category !== 'facilities') return false;
      if (currentFilter === 'technology' && item.category !== 'technology') return false;
      if (currentFilter === 'academics' && item.category !== 'academics') return false;
      if (currentFilter === 'student-life' && item.category !== 'student-life') return false;
      if (currentFilter === 'safety' && item.category !== 'safety') return false;

      // 2. Exact-Word Search Matching
      if (searchQuery.trim()) {
        const textToSearch = `${item.title} ${item.description} ${item.location} ${item.category} ${item.author} ${item.id} ${item.department || ''}`;
        if (!matchesExactWords(textToSearch, searchQuery)) {
          return false;
        }
      }

      return true;
    });
  }, [reports, currentFilter, searchQuery]);

  // Ensure a report is selected if available
  useEffect(() => {
    if (filteredReports.length > 0) {
      const exists = filteredReports.some((r) => r.id === selectedId);
      if (!exists) {
        setSelectedId(filteredReports[0].id);
      }
    } else {
      setSelectedId(null);
    }
  }, [filteredReports, selectedId]);

  const selectedReport = useMemo(() => {
    return reports.find((r) => r.id === selectedId) || null;
  }, [reports, selectedId]);

  // Fix #6: Upvote with clean Undo
  const handleToggleUpvote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextHasUpvoted = !r.hasUpvoted;
          const nextCount = nextHasUpvoted ? r.upvotes + 1 : Math.max(0, r.upvotes - 1);

          let updatedEndorsers = r.endorsers ? [...r.endorsers] : [];
          const currentUserName = currentUser?.name || 'Verified Student';
          const currentUserEmail = currentUser?.email || 'student@campus.edu';
          const currentUserTitle = currentUser?.title || 'Campus Student';

          if (nextHasUpvoted) {
            const exists = updatedEndorsers.some((end) => end.name === currentUserName);
            if (!exists) {
              updatedEndorsers = [
                {
                  id: `end-${Date.now()}`,
                  name: currentUserName,
                  role: currentUserTitle,
                  email: currentUserEmail,
                  studentId: `STU-${Math.floor(2000 + Math.random() * 7900)}`,
                  timestamp: new Date().toISOString(),
                },
                ...updatedEndorsers,
              ];
            }
            showToast(`Endorsement added for #${id}.`);
          } else {
            updatedEndorsers = updatedEndorsers.filter((end) => end.name !== currentUserName && end.email !== currentUserEmail);
            showToast(`Endorsement retracted for #${id}.`);
          }

          return {
            ...r,
            upvotes: nextCount,
            hasUpvoted: nextHasUpvoted,
            endorsers: updatedEndorsers,
          };
        }
        return r;
      })
    );
  };

  const handleUpdateStatus = (id: string, newStatus: FeedbackStatus) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const statusActivity: ActivityItem = {
            id: `act-${Date.now()}`,
            author: role === 'admin' ? 'Campus Administration' : 'System',
            role: role === 'admin' ? 'admin' : 'system',
            message: `Ticket status manually changed from ${r.status} to ${newStatus}.`,
            timestamp: new Date().toISOString(),
            statusChange: newStatus,
          };
          return {
            ...r,
            status: newStatus,
            activities: [...r.activities, statusActivity],
          };
        }
        return r;
      })
    );
    showToast(`Status updated to "${newStatus}" for #${id}`);
  };

  const handleAddActivity = (
    id: string, 
    message: string, 
    activityRole: 'admin' | 'student', 
    statusChange?: FeedbackStatus
  ) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === id) {
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

          return {
            ...r,
            status: statusChange || r.status,
            activities: [...r.activities, newAct],
          };
        }
        return r;
      })
    );
    showToast(activityRole === 'admin' ? 'Official response published.' : 'Student reply posted.');
  };

  const handleCreateReport = (
    newReportData: Omit<FeedbackReport, 'id' | 'createdAt' | 'upvotes' | 'activities'>
  ) => {
    const randomNum = Math.floor(1050 + Math.random() * 8900);
    const newId = `FB-${randomNum}`;
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
      hasUpvoted: true,
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
          message: `Assigned routing category: ${newReportData.category.toUpperCase()} -> Department: ${newReportData.department || 'Campus Operations'}. Status set to Open.`,
          timestamp: nowIso,
        }
      ],
    };

    setReports((prev) => [createdReport, ...prev]);
    setSelectedId(newId);
    setPageView('detail');
    showToast(`Feedback #${newId} submitted successfully!`);
  };

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

  if (!currentUser) {
    return (
      <>
        <PortalPage
          reports={reports}
          events={events}
          onSignIn={handleSignIn}
        />
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-purple-950 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg border border-purple-800 flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="h-[100dvh] w-full max-w-full flex flex-col bg-[#faf8fc] text-slate-800 antialiased overflow-hidden select-none">
      {/* Top Bar Navigation */}
      <TopBar
        role={role}
        onRoleChange={setRole}
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
      />

      {/* Birthday Celebration Banner when today is the student's birthday */}
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
              <span className="hidden md:inline text-purple-100 text-[11px]">
                Enjoy complimentary BCA month solidarity treats & student wellness perks on campus today.
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

      {/* Role Banner / Sub-Bar when Admin mode is active */}
      {role === 'admin' && (
        <div className="bg-purple-900 text-purple-100 text-[11px] px-3 sm:px-4 py-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-purple-800 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping shrink-0" />
            <span className="font-semibold text-white">Campus Administrator Triage Active:</span>
            <span className="hidden md:inline">Authorized as {currentUser.name}. You have permissions to reclassify urgencies, update ticket statuses, and publish official university replies.</span>
            <span className="md:hidden text-purple-200">Staff: {currentUser.name}</span>
          </div>
          <button
            onClick={() => setRole('student')}
            className="text-pink-300 hover:text-white underline font-semibold text-[10px] cursor-pointer self-start sm:self-auto"
          >
            Switch to Student View
          </button>
        </div>
      )}

      {/* Main App Workspace: Collapsible Sidebar + Master Page vs Next Page Detail View */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Navigation Sidebar */}
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
          />
        )}

        {/* Master-Detail Page Navigation: Events Section vs Campus Reports Main Page vs Detail Next Page */}
        {currentFilter === 'events' ? (
          <EventsSection
            events={events}
            role={role}
            onToggleRsvp={handleToggleEventRsvp}
            onAddEvent={handleAddEvent}
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

      {/* Fix #1 & #15: Mobile Bottom Navigation Bar with auto-hide when virtual keyboard is active */}
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
            onClick={() => {
              setCurrentFilter('events');
            }}
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
            title="Create new feedback"
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
            title="Sign out of portal"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* New Feedback Submission Modal */}
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

      {/* Student Profile & Birthday Settings Modal */}
      {currentUser && (
        <UserProfileModal
          user={currentUser}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={(updated) => {
            setCurrentUser(updated);
            showToast(
              isBirthdayToday(updated.birthday)
                ? `Profile updated! 🎂 Happy Birthday, ${updated.name}!`
                : `Profile updated successfully.`
            );
          }}
          onSignOut={handleSignOut}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 md:bottom-5 right-5 z-50 bg-purple-950 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg border border-purple-800 flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
