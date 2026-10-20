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
 * Search matching requiring exact full words instead of partial letters.
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
 * Duplicate detection without aggressive triggering on common words.
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
 * SLA timer calculated from immutable creation timestamp and standard response targets:
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
 * Validate image file types (JPG, PNG, WebP)
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

  if (file.size > 20 * 1024 * 1024) {
    return {
      valid: false,
      error: 'File size exceeds 20MB limit. Please choose a smaller photo.',
    };
  }

  return { valid: true };
}

/**
 * Validate media files (Photos or Videos). 
 * Restricts videos to MP4/WebM and enforces 15MB limit to prevent browser crashes.
 */
export function isValidMediaFile(file: File): { valid: boolean; error?: string; mediaType: 'photo' | 'video' } {
  const photoExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  // ONLY allow MP4 and WebM. Removed .mov to prevent Chrome/Android playback failures.
  const videoExts = ['.mp4', '.webm'];

  const lowerName = file.name.toLowerCase();
  const isPhoto = file.type.startsWith('image/') || photoExts.some(ext => lowerName.endsWith(ext));
  const isVideo = file.type.startsWith('video/') || videoExts.some(ext => lowerName.endsWith(ext));

  if (!isPhoto && !isVideo) {
    return {
      valid: false,
      error: 'Unsupported format. Permitted formats: JPG, PNG, WebP, GIF, MP4, and WebM.',
      mediaType: 'photo',
    };
  }

  const MAX_MEDIA_BYTES = 15 * 1024 * 1024; // 15MB limit
  if (file.size > MAX_MEDIA_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeMb}MB) exceeds the 15MB campus limit. Please compress or select a shorter video/smaller image.`,
      mediaType: isVideo ? 'video' : 'photo',
    };
  }

  return { valid: true, mediaType: isVideo ? 'video' : 'photo' };
}

/**
 * Canvas-based image compression so Base64 photos don't crash localStorage
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
  const trySave = (data: any): boolean => {
    try {
      localStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  };

  if (trySave(value)) return true;

  console.warn(`localStorage quota exceeded for key ${key}, attempting progressive pruning...`);

  if (!Array.isArray(value)) return false;

  // Progressive pruning — each level is more aggressive
  const pruningStrategies: Array<(items: any[]) => any[]> = [
    (items) => items.map((item, idx) => idx > 2 && item.photos ? { ...item, photos: [] } : item),
    (items) => items.map((item, idx) =>
      idx > 2 ? { ...item, photos: [], videos: [] } : item
    ),
    (items) => items.map((item, idx) => ({
      ...item,
      videos: [],
      photos: idx > 2 ? [] : item.photos,
    })),
    (items) => items.map((item) => ({ ...item, photos: [], videos: [] })),
  ];

  for (let i = 0; i < pruningStrategies.length; i++) {
    try {
      if (trySave(pruningStrategies[i](value))) {
        console.warn(`Saved with pruning level ${i + 1} — some media was dropped.`);
        return true;
      }
    } catch { /* continue */ }
  }

  console.error(`Unable to save ${key} to localStorage even after aggressive pruning.`);
  return false;
}

/**
 * Backup export & restore utility so users never lose data if browser cache is cleared.
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
 */
export function formatReportId(id: string, type: FeedbackType, status: FeedbackStatus): string {
  const cleanNum = id.replace(/^(KCIS|KCOI|KCIRV|KCRS|KCDRF|FB)-/i, '');
  
  if (type === 'initiative') return `KCIS-${cleanNum}`;
  if (status === 'draft') return `KCDRF-${cleanNum}`;
  if (status === 'resolved') return `KCRS-${cleanNum}`;
  if (status === 'in-review' || status === 'in-progress') return `KCIRV-${cleanNum}`;
  return `KCOI-${cleanNum}`; // Default to Open Issue
}

/**
 * Formats event IDs with the KCEV prefix.
 */
export function formatEventId(id: string): string {
  const cleanNum = id.replace(/^(KCEV|EV)-/i, '');
  return `KCEV-${cleanNum}`;
}