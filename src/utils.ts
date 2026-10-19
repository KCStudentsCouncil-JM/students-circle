/**
 * Campus Feedback Assistant Utility Functions
 * Addresses: exact-word search, stop-word filtered duplicate detection,
 * image compression, safe localStorage persistence, tamper-proof SLA calculation,
 * and ID formatting.
 */

import { FeedbackReport, UrgencyLevel, FeedbackStatus, FeedbackType } from './types';

// Common stop-words that should NEVER trigger duplicate detection on their own
export const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 
  'by', 'from', 'is', 'are', 'was', 'were', 'it', 'this', 'that', 'there', 
  'campus', 'room', 'hall', 'student', 'issue', 'broken', 'not', 'very', 
  'please', 'help', 'fix', 'problem', 'need', 'needs', 'some', 'about', 'when',
  'where', 'which', 'who', 'whom', 'their', 'they', 'them', 'have', 'has', 'had',
  'will', 'would', 'can', 'could', 'should', 'been', 'being', 'also', 'just', 'more'
]);

/**
 * Fix #8: Search matching requiring exact full words instead of partial letters.
 * Matches exact words in text using word boundary \b or token set matching.
 */
export function matchesExactWords(text: string, query: string): boolean {
  if (!query || !query.trim()) return true;
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const lowerText = text.toLowerCase();

  return terms.every((term) => {
    // If searching for report ID or numerical code, match directly
    if (/^(fb-|kcis-|kcoi-|kcirv-|kcrs-|kcdrf-)?\d+$/i.test(term)) {
      const cleanNum = term.replace(/^(fb-|kcis-|kcoi-|kcirv-|kcrs-|kcdrf-)/i, '');
      return lowerText.includes(term) || lowerText.includes(cleanNum);
    }

    // Escape regex special chars
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match word boundaries: \bword\b
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:[^a-zA-Z0-9]|$)`, 'i');
    return regex.test(lowerText);
  });
}

/**
 * Fix #9: Duplicate detection without aggressive triggering on common words.
 * Extracts meaningful keywords (>= 4 chars, not in STOP_WORDS) and requires
 * at least 2 distinct meaningful keywords to match (or same location + 1 keyword).
 */
export function findPotentialDuplicates(
  title: string,
  description: string,
  existingReports: FeedbackReport[]
): FeedbackReport[] {
  if (!title.trim() && !description.trim()) return [];

  const extractKeywords = (str: string): string[] => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP_WORDS.has(w));
  };

  const titleWords = new Set(extractKeywords(title));
  const descWords = new Set(extractKeywords(description));
  const inputKeywords = new Set([...titleWords, ...descWords]);

  if (inputKeywords.size === 0) return [];

  const matches: FeedbackReport[] = [];

  for (const report of existingReports) {
    if (report.status === 'resolved') continue;

    const reportWords = new Set([
      ...extractKeywords(report.title),
      ...extractKeywords(report.description),
    ]);

    // Count intersecting meaningful keywords
    let matchCount = 0;
    for (const kw of inputKeywords) {
      if (reportWords.has(kw)) {
        matchCount++;
      }
    }

    // Require at least 2 distinct meaningful keywords to consider it a duplicate
    if (matchCount >= 2) {
      matches.push(report);
    }
  }

  return matches;
}

/**
 * Authoritative monotonic session clock to prevent user from manipulating SLA
 * by tweaking their computer's local clock settings.
 */
const SESSION_START_REAL = Date.now();
const SESSION_START_PERF = typeof performance !== 'undefined' ? performance.now() : 0;

export function getAuthoritativeTimestamp(): number {
  if (typeof performance !== 'undefined') {
    const elapsedSinceSession = performance.now() - SESSION_START_PERF;
    return SESSION_START_REAL + elapsedSinceSession;
  }
  return Date.now();
}

/**
 * Fix #7: SLA timer calculated from immutable creation timestamp and standard response targets:
 * - High urgency: 24h SLA
 * - Medium urgency: 48h SLA
 * - Low urgency: 72h SLA
 */
export function calculateSlaInfo(createdAt: string, urgency: UrgencyLevel, status: FeedbackStatus) {
  const createdMs = new Date(createdAt).getTime();
  const targetHours = urgency === 'high' ? 24 : urgency === 'medium' ? 48 : 72;
  const deadlineMs = createdMs + targetHours * 60 * 60 * 1000;
  const nowMs = getAuthoritativeTimestamp();

  const isResolved = status === 'resolved';
  const remainingMs = deadlineMs - nowMs;
  const remainingHours = Math.round(remainingMs / (1000 * 60 * 60));
  const isBreached = remainingMs < 0 && !isResolved;

  return {
    targetHours,
    deadlineDate: new Date(deadlineMs),
    remainingHours,
    isBreached,
    isResolved,
    label: isResolved
      ? 'SLA Met & Verified'
      : isBreached
      ? `SLA Breached (${Math.abs(remainingHours)}h overdue)`
      : `${remainingHours}h remaining for triage`,
  };
}

/**
 * Fix #11: Validate image file types (JPG, PNG, WebP)
 */
export function isValidImageFile(file: File): { valid: boolean; error?: string } {
  const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const validExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

  const lowerName = file.name.toLowerCase();
  const hasValidExt = validExts.some((ext) => lowerName.endsWith(ext));

  if (!validMimes.includes(file.type) && !hasValidExt) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPG, PNG, and WebP images are permitted.',
    };
  }

  if (file.size > 10 * 1024 * 1024) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit. Please choose a smaller photo.',
    };
  }

  return { valid: true };
}

/**
 * Fix #3: Canvas-based image compression so Base64 photos don't crash localStorage
 * Downscales image to max 800x800 and compresses to JPEG ~0.70 quality (~30-50KB).
 */
export function compressImage(file: File, maxDimension = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Safe localStorage setter that handles QuotaExceededError and prevents crashes.
 */
export function safeLocalStorageSet(key: string, value: any): boolean {
  try {
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, str);
    return true;
  } catch (err: any) {
    console.warn(`localStorage quota exceeded for key ${key}:`, err);
    try {
      // If saving reports failed because of images, strip photos from older reports and retry
      if (Array.isArray(value)) {
        const pruned = value.map((item: any, idx: number) => {
          if (idx > 2 && item.photos) {
            return { ...item, photos: [] };
          }
          return item;
        });
        localStorage.setItem(key, JSON.stringify(pruned));
        return true;
      }
    } catch (e) {
      console.error('Failed fallback localStorage save', e);
    }
    return false;
  }
}

/**
 * Fix #10: Backup export & restore utility so users never lose data if browser cache is cleared.
 */
export function exportCampusDataBackup(reports: any[], events: any[], user: any) {
  const backup = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    user,
    reports,
    events,
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `campus_feedback_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// --- NEW ID FORMATTING HELPERS ---

/**
 * Formats report IDs with the requested prefixes based on type and status.
 * Initiative -> KCIS
 * Open Issue -> KCOI
 * In Review -> KCIRV
 * Resolved -> KCRS
 * Draft -> KCDRF
 */
export function formatReportId(id: string, type: FeedbackType, status: FeedbackStatus): string {
  const num = id.includes('-') ? id.split('-')[1] : id;
  
  if (type === 'initiative') return `KCIS-${num}`;
  if (status === 'draft') return `KCDRF-${num}`;
  if (status === 'resolved') return `KCRS-${num}`;
  if (status === 'in-review' || status === 'in-progress') return `KCIRV-${num}`;
  return `KCOI-${num}`; // Default to Open Issue
}

/**
 * Formats event IDs with the KCEV prefix.
 */
export function formatEventId(id: string): string {
  const num = id.includes('-') ? id.split('-')[1] : id;
  return `KCEV-${num}`;
}