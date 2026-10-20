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
  parentId?: string; // Supports threaded replies
  photos?: string[];
  videos?: string[];
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
  videos?: string[]; // Gallery video attachments (up to 20MB)
  endorsers?: Endorser[];
  activities: ActivityItem[];
  resolutionNotes?: string;
  pinned?: boolean; // Admin pinned priority notice
}

export type RoleMode = 'student' | 'admin';
export type EventCategory = 'bca-awareness' | 'academic' | 'student-life' | 'career' | 'athletics' | 'arts';
export type EventType = 'single-day' | 'multi-day';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  eventType?: EventType;
  date: string; // Start date YYYY-MM-DD
  endDate?: string; // Optional end date for multi-day events
  durationDays?: number; // e.g. 3 days
  time: string; // e.g., "2:00 PM - 5:00 PM" or "9:00 AM - 4:00 PM Daily"
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
  galleryPhotos?: string[]; // Event recap photo gallery
}

export type NavFilter = 
  | 'all' | 'my-activity' | 'open' | 'in-review' | 'in-progress' | 'resolved' | 'drafts'
  | 'events' | 'initiatives' | 'issues' | 'facilities' | 'technology' 
  | 'academics' | 'student-life' | 'safety';

// Notification system
export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'status' | 'reply' | 'event' | 'pin';
  linkReportId?: string;
}

// Quick Poll Data
export interface QuickPoll {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
  totalVotes: number;
  votedOptionId?: string;
}

// Unified User Profile for everything
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: RoleMode;
  status: 'pending' | 'approved' | 'rejected';
  major?: string;
  classYear?: string;
  photo?: string;
  birthday?: string;
  title?: string;
  lastActiveAt?: string;  // ← NEW: tracks online presence
  createdAt: string;
}

export function isBirthdayToday(birthday?: string): boolean {
  if (!birthday) return false;
  try {
    const cleaned = birthday.trim().replace(/\//g, '-');
    const parts = cleaned.split('-').map(p => parseInt(p, 10)).filter(n => !isNaN(n));
    if (parts.length < 2) return false;

    let month = 0;
    let day = 0;

    if (parts.length >= 3) {
      if (parts[0] > 1900) {
        // YYYY-MM-DD
        month = parts[1];
        day = parts[2];
      } else {
        // DD-MM-YYYY or MM-DD-YYYY
        month = parts[1];
        day = parts[0];
      }
    } else if (parts.length === 2) {
      // MM-DD
      month = parts[0];
      day = parts[1];
    } else {
      return false;
    }

    const today = new Date();
    return today.getMonth() + 1 === month && today.getDate() === day;
  } catch (e) {
    return false;
  }
}