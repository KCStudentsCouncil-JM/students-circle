export type FeedbackType = 'issue' | 'initiative';
export type Category = 'facilities' | 'technology' | 'academics' | 'student-life' | 'safety';
export type UrgencyLevel = 'low' | 'medium' | 'high';
export type FeedbackStatus = 'open' | 'in-review' | 'in-progress' | 'resolved' | 'draft';

export interface ActivityItem {
  id: string;
  author: string;
  role: 'admin' | 'student' | 'system';
  message: string;
  timestamp: string;
  statusChange?: FeedbackStatus;
  badgeText?: string;
}

export interface Endorser {
  id: string;
  name: string;
  role: string;
  email: string;
  studentId?: string;
  timestamp: string;
}

export interface FeedbackReport {
  id: string;
  title: string;
  type: FeedbackType;
  category: Category;
  urgency: UrgencyLevel;
  status: FeedbackStatus;
  description: string;
  location: string;
  department?: string;
  isAnonymous: boolean;
  author: string;
  authorRole: string;
  authorRealName?: string;
  authorEmail?: string;
  authorStudentId?: string;
  createdAt: string;
  upvotes: number;
  hasUpvoted?: boolean;
  photos?: string[];
  endorsers?: Endorser[];
  activities: ActivityItem[];
  resolutionNotes?: string;
}

export type RoleMode = 'student' | 'admin';
export type EventCategory = 'bca-awareness' | 'academic' | 'student-life' | 'career' | 'athletics' | 'arts';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  category: EventCategory;
  rsvps: number;
  hasRsvpd?: boolean;
  attendees?: string[]; 
  linkedFeedbackId?: string;
  tags: string[];
  capacity?: number;
  isOfficialUniversityEvent: boolean;
  featured?: boolean;
  videoUrl?: string;
}

export type NavFilter = 
  | 'all' | 'open' | 'in-review' | 'in-progress' | 'resolved' | 'drafts'
  | 'events' | 'initiatives' | 'issues' | 'facilities' | 'technology' 
  | 'academics' | 'student-life' | 'safety';

// Unified User Profile for everything
export interface UserProfile {
  id: string; // Email is used as the ID
  name: string;
  email: string;
  role: RoleMode;
  status: 'pending' | 'approved' | 'rejected';
  major?: string;
  classYear?: string;
  photo?: string;
  birthday?: string;
  title?: string; // Used by UI components
  createdAt: string;
}

export function isBirthdayToday(birthday?: string): boolean {
  if (!birthday) return false;
  try {
    const parts = birthday.trim().split('-');
    let month = parseInt(parts[1] || parts[0], 10);
    let day = parseInt(parts[2] || parts[1], 10);
    const today = new Date();
    return today.getMonth() + 1 === month && today.getDate() === day;
  } catch (e) {
    return false;
  }
}