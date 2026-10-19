import React, { useState, useMemo } from 'react';
import { ApprovedStudent, PendingStudent } from '../types';
import { 
  Users, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Search, 
  GraduationCap, 
  Clock, 
  Calendar, 
  Mail, 
  UserCheck, 
  AlertCircle 
} from 'lucide-react';

interface AdminStudentListProps {
  pendingStudents: PendingStudent[];
  approvedStudents: ApprovedStudent[];
  onApprove: (student: PendingStudent) => void | Promise<void>;
  onReject: (email: string) => void | Promise<void>;
  onRemove: (email: string) => void | Promise<void>;
  onBack: () => void;
}

export const AdminStudentList: React.FC<AdminStudentListProps> = ({
  pendingStudents,
  approvedStudents,
  onApprove,
  onReject,
  onRemove,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [studentToRemove, setStudentToRemove] = useState<ApprovedStudent | null>(null);
  const [studentToReject, setStudentToReject] = useState<PendingStudent | null>(null);

  const filteredPending = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return pendingStudents;
    return pendingStudents.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.major && s.major.toLowerCase().includes(q)) ||
        (s.classYear && s.classYear.toLowerCase().includes(q))
    );
  }, [pendingStudents, searchQuery]);

  const filteredApproved = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return approvedStudents;
    return approvedStudents.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.major && s.major.toLowerCase().includes(q)) ||
        (s.classYear && s.classYear.toLowerCase().includes(q))
    );
  }, [approvedStudents, searchQuery]);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#faf8fc] overflow-hidden select-none">
      {/* Top Banner / Navigation Header */}
      <div className="bg-white border-b border-purple-100/90 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-purple-700 hover:text-purple-950 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer"
            title="Back to Reports"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-purple-950 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Student Account Roster
              </h1>
              <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full">
                Admin Console
              </span>
            </div>
            <p className="text-xs text-purple-700/80 mt-0.5">
              Review verification requests and manage authorized student accounts
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-purple-100/60 p-1 rounded-xl self-start sm:self-auto border border-purple-200/50">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-white text-purple-950 shadow-xs'
                : 'text-purple-700 hover:text-purple-950'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Pending</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'pending' ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-purple-200 text-purple-800'
            }`}>
              {pendingStudents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'approved'
                ? 'bg-white text-purple-950 shadow-xs'
                : 'text-purple-700 hover:text-purple-950'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Approved</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'approved' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-purple-200 text-purple-800'
            }`}>
              {approvedStudents.length}
            </span>
          </button>
        </div>
      </div>

      {/* Search and stats bar */}
      <div className="px-4 sm:px-6 py-3 bg-white/70 border-b border-purple-100 flex items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            placeholder="Search students by name, email, major..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-purple-50/50 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div className="text-xs text-purple-800 font-medium hidden sm:block">
          Showing {activeTab === 'pending' ? filteredPending.length : filteredApproved.length} of{' '}
          {activeTab === 'pending' ? pendingStudents.length : approvedStudents.length} records
        </div>
      </div>

      {/* Main List Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 sm:pb-12">
        {activeTab === 'pending' ? (
          filteredPending.length === 0 ? (
            <div className="bg-white rounded-2xl border border-purple-100 p-8 text-center max-w-md mx-auto my-8 space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-purple-950">No Pending Requests</h3>
              <p className="text-xs text-purple-700/70">
                All student verification requests have been addressed. New student sign-ups will show up here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPending.map((student) => (
                <div
                  key={student.id || student.email}
                  className="bg-white rounded-2xl border border-amber-200 shadow-xs p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-sm">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-purple-950">{student.name}</h3>
                          <div className="flex items-center gap-1 text-xs text-purple-600 font-mono">
                            <Mail className="w-3 h-3 text-purple-400" />
                            <span>{student.email}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                        Pending
                      </span>
                    </div>

                    <div className="bg-purple-50/60 rounded-xl p-2.5 space-y-1.5 text-xs text-purple-900 border border-purple-100">
                      {student.major && (
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                          <span className="font-semibold text-purple-700">Major:</span>
                          <span className="truncate">{student.major}</span>
                        </div>
                      )}
                      {student.classYear && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-500" />
                          <span className="font-semibold text-purple-700">Class:</span>
                          <span>{student.classYear}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-[10px] text-purple-600">
                        <Clock className="w-3 h-3 text-purple-400" />
                        <span>Requested: {formatDate(student.requestedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-purple-100 mt-4 flex items-center gap-2">
                    <button
                      onClick={() => onApprove(student)}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => setStudentToReject(student)}
                      className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl border border-rose-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          filteredApproved.length === 0 ? (
            <div className="bg-white rounded-2xl border border-purple-100 p-8 text-center max-w-md mx-auto my-8 space-y-2">
              <Users className="w-10 h-10 text-purple-400 mx-auto" />
              <h3 className="text-sm font-bold text-purple-950">No Approved Students Found</h3>
              <p className="text-xs text-purple-700/70">
                Approved students will appear in this roster once pending requests are verified.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApproved.map((student) => (
                <div
                  key={student.id || student.email}
                  className="bg-white rounded-2xl border border-purple-200 shadow-xs p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center shrink-0 text-sm">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-purple-950">{student.name}</h3>
                          <div className="flex items-center gap-1 text-xs text-purple-600 font-mono">
                            <Mail className="w-3 h-3 text-purple-400" />
                            <span>{student.email}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="w-2.5 h-2.5" />
                        Verified
                      </span>
                    </div>

                    <div className="bg-purple-50/60 rounded-xl p-2.5 space-y-1.5 text-xs text-purple-900 border border-purple-100">
                      {student.major && (
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                          <span className="font-semibold text-purple-700">Major:</span>
                          <span className="truncate">{student.major}</span>
                        </div>
                      )}
                      {student.classYear && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-500" />
                          <span className="font-semibold text-purple-700">Class:</span>
                          <span>{student.classYear}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-[10px] text-purple-600">
                        <Clock className="w-3 h-3 text-purple-400" />
                        <span>Approved: {formatDate(student.approvedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-purple-100 mt-4 flex items-center justify-end">
                    <button
                      onClick={() => setStudentToRemove(student)}
                      className="py-1.5 px-3 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Revoke access"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Revoke Access</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Reject Confirmation Modal */}
      {studentToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/50 backdrop-blur-xs select-none">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full border border-rose-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Reject Approval Request?</h3>
                <p className="text-xs text-slate-500">
                  Reject request for {studentToReject.name} ({studentToReject.email})
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStudentToReject(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onReject(studentToReject.email);
                  setStudentToReject(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove / Revoke Confirmation Modal */}
      {studentToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/50 backdrop-blur-xs select-none">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full border border-rose-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Revoke Student Access?</h3>
                <p className="text-xs text-slate-500">
                  This will remove {studentToRemove.name} ({studentToRemove.email}) from approved students. They will need to re-apply.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStudentToRemove(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onRemove(studentToRemove.email);
                  setStudentToRemove(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Confirm Revoke
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
