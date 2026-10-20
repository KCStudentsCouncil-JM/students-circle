import React, { useState, useMemo } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { CampusEvent, EventCategory, EventType, RoleMode, UserProfile } from '../types';
import { formatEventId, isValidMediaFile, compressImage } from '../utils';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Sparkles, 
  Ribbon, 
  Plus, 
  Search, 
  CheckCircle2, 
  Download, 
  ArrowLeft, 
  X, 
  Building2,
  Video,
  Trash2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Layers,
  UploadCloud,
  Play,
  Film
} from 'lucide-react';

interface EventsSectionProps {
  events: CampusEvent[];
  role: RoleMode;
  currentUser?: UserProfile | null;
  onToggleRsvp: (id: string) => void;
  onAddEvent: (newEvent: Omit<CampusEvent, 'id' | 'rsvps' | 'hasRsvpd'>) => void;
  onDeleteEvent?: (id: string) => void;
  onSelectFeedbackReport?: (feedbackId: string) => void;
  onBackToReports: () => void;
}

export const EventsSection: React.FC<EventsSectionProps> = ({
  events,
  role,
  currentUser,
  onToggleRsvp,
  onAddEvent,
  onDeleteEvent,
  onBackToReports,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | EventCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Event Form state (supports single-day or multi-day range from X to Y time)
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEventType, setNewEventType] = useState<EventType>('single-day');
  const [newDate, setNewDate] = useState('2026-10-24');
  const [newEndDate, setNewEndDate] = useState('2026-10-27');
  
  // Specific Start Time (X) and End Time (Y)
  const [newStartTime, setNewStartTime] = useState('10:00 AM');
  const [newEndTime, setNewEndTime] = useState('1:00 PM');
  const [newTimeCustom, setNewTimeCustom] = useState('');
  const [isCustomTime, setIsCustomTime] = useState(false);

  const [newLocation, setNewLocation] = useState('');
  const [newOrganizer, setNewOrganizer] = useState('Campus Student Activities Board');
  const [newCategory, setNewCategory] = useState<EventCategory>('student-life');
  const [newTags, setNewTags] = useState('Campus, Student Life');
  const [newCapacity, setNewCapacity] = useState('250');

  // Gallery & Link Media (Photos and Videos up to 20MB)
  const [newVideoUrl, setNewVideoUrl] = useState(''); 
  const [galleryVideoFileName, setGalleryVideoFileName] = useState<string | null>(null);
  const [newGalleryPhotoUrl, setNewGalleryPhotoUrl] = useState('');
  const [galleryPhotosList, setGalleryPhotosList] = useState<string[]>([]);
  const [mediaUploadError, setMediaUploadError] = useState<string | null>(null);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // State for delete confirmation & photo gallery lightbox
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [activeGalleryEvent, setActiveGalleryEvent] = useState<CampusEvent | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      if (selectedCategory !== 'all' && evt.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = evt.title.toLowerCase().includes(q);
        const matchesDesc = evt.description.toLowerCase().includes(q);
        const matchesLoc = evt.location.toLowerCase().includes(q);
        const matchesOrg = evt.organizer.toLowerCase().includes(q);
        const matchesTag = evt.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesOrg && !matchesTag) {
          return false;
        }
      }
      return true;
    });
  }, [events, selectedCategory, searchQuery]);

  const handleDownloadIcs = (event: CampusEvent) => {
    const isMulti = event.eventType === 'multi-day' && event.endDate;
    const dateFormatted = event.date.replace(/-/g, '');
    
    // In RFC 5545, DTEND;VALUE=DATE is non-inclusive, so add 1 day to the end date
    const getNextDayFormatted = (isoDate: string) => {
      try {
        const parts = isoDate.split('-');
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          d.setDate(d.getDate() + 1);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}${m}${day}`;
        }
      } catch (e) {
        // fallback
      }
      return dateFormatted;
    };

    const endDateFormatted = isMulti ? getNextDayFormatted(event.endDate!) : getNextDayFormatted(event.date);

    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//KC Students Circle//Campus Events//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${event.location}`,
      `DTSTART;VALUE=DATE:${dateFormatted}`,
      `DTEND;VALUE=DATE:${endDateFormatted}`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${formatEventId(event.id)}_${event.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddGalleryPhotoUrl = () => {
    if (newGalleryPhotoUrl.trim()) {
      setGalleryPhotosList(prev => [...prev, newGalleryPhotoUrl.trim()]);
      setNewGalleryPhotoUrl('');
    }
  };

  // Gallery Photos File Upload (Max 20MB)
  const handleGalleryPhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setMediaUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingMedia(true);
    try {
      const added: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const validation = isValidMediaFile(file);
        if (!validation.valid) {
          setMediaUploadError(validation.error || 'Invalid file.');
          setIsProcessingMedia(false);
          return;
        }

        if (validation.mediaType === 'video') {
          setMediaUploadError('Please use the video section to upload videos. Photo gallery accepts images.');
          setIsProcessingMedia(false);
          return;
        }

        const compressed = await compressImage(file, 1000, 0.78);
        added.push(compressed);
      }
      setGalleryPhotosList(prev => [...prev, ...added]);
    } catch (err: any) {
      setMediaUploadError(err.message || 'Failed to process photos from device gallery.');
    } finally {
      setIsProcessingMedia(false);
      e.target.value = '';
    }
  };

  // Gallery Video File Upload (Max 20MB)
  const handleGalleryVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setMediaUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = isValidMediaFile(file);
    if (!validation.valid) {
      setMediaUploadError(validation.error || 'Invalid video file.');
      return;
    }
    if (validation.mediaType !== 'video') {
      setMediaUploadError('Please select a valid video file (.mp4, .webm, .mov) up to 20MB.');
      return;
    }

    setIsProcessingMedia(true);
    try {
      const videoData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read video from gallery.'));
        reader.readAsDataURL(file);
      });
      setNewVideoUrl(videoData);
      setGalleryVideoFileName(file.name);
    } catch (err: any) {
      setMediaUploadError(err.message || 'Failed to upload video from device gallery.');
    } finally {
      setIsProcessingMedia(false);
      e.target.value = '';
    }
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!newTitle.trim()) errors.title = 'Title is required';
    if (!newLocation.trim()) errors.location = 'Location is required';
    if (!newDesc.trim()) errors.description = 'Description is required';
    if (newEventType === 'multi-day' && !newEndDate) errors.endDate = 'End date is required for multi-day events';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Calculate duration in days if multi-day
    let durationDays = 1;
    if (newEventType === 'multi-day' && newEndDate) {
      const startMs = new Date(newDate).getTime();
      const endMs = new Date(newEndDate).getTime();
      durationDays = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1);
    }

    // Construct final time from X to Y
    let computedTime = '';
    if (isCustomTime && newTimeCustom.trim()) {
      computedTime = newTimeCustom.trim();
    } else {
      const timeSpan = `${newStartTime} - ${newEndTime}`;
      computedTime = newEventType === 'multi-day' ? `${timeSpan} Daily` : timeSpan;
    }

    onAddEvent({
      title: newTitle.trim(),
      description: newDesc.trim(),
      eventType: newEventType,
      date: newDate,
      endDate: newEventType === 'multi-day' ? newEndDate : undefined,
      durationDays: newEventType === 'multi-day' ? durationDays : 1,
      time: computedTime,
      location: newLocation.trim(),
      organizer: newOrganizer.trim(),
      category: newCategory,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      capacity: parseInt(newCapacity, 10) || 250,
      isOfficialUniversityEvent: true,
      featured: false,
      videoUrl: newVideoUrl.trim() || undefined,
      galleryPhotos: galleryPhotosList.length > 0 ? galleryPhotosList : undefined,
    });

    setIsAddModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewLocation('');
    setNewVideoUrl('');
    setGalleryVideoFileName(null);
    setGalleryPhotosList([]);
    setMediaUploadError(null);
    setFormErrors({});
  };

  const getCategoryBadge = (cat: EventCategory) => {
    switch (cat) {
      case 'bca-awareness':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800 px-2.5 py-0.5 rounded-md">
            <Ribbon className="w-3.5 h-3.5 text-pink-600" />
            <span>BCA Month</span>
          </span>
        );
      case 'academic':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 rounded-md">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Academic & Tech</span>
          </span>
        );
      case 'student-life':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-md">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Student Life</span>
          </span>
        );
      case 'career':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2.5 py-0.5 rounded-md">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Career & Jobs</span>
          </span>
        );
      case 'athletics':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-md">
            <span>⚽ Athletics</span>
          </span>
        );
      case 'arts':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-fuchsia-700 dark:text-fuchsia-300 bg-fuchsia-50 dark:bg-fuchsia-950/60 border border-fuchsia-200 dark:border-fuchsia-800 px-2.5 py-0.5 rounded-md">
            <span>🎨 Arts & Music</span>
          </span>
        );
    }
  };

  const formatCalendarSquare = (dateStr: string) => {
    try {
      const parts = (dateStr || '').split('-');
      if (parts.length >= 3) {
        const year = parseInt(parts[0], 10);
        const monthIdx = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (!isNaN(year) && !isNaN(monthIdx) && !isNaN(day)) {
          const dateObj = new Date(year, monthIdx, day);
          return {
            month: dateObj.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
            day,
            weekday: dateObj.toLocaleDateString(undefined, { weekday: 'short' }),
          };
        }
      }
      const fallback = new Date(dateStr);
      if (!isNaN(fallback.getTime())) {
        return {
          month: fallback.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
          day: fallback.getDate(),
          weekday: fallback.toLocaleDateString(undefined, { weekday: 'short' }),
        };
      }
    } catch (e) {
      // ignore
    }
    return { month: 'OCT', day: 24, weekday: 'Sat' };
  };

  const formatDateRange = (start: string, end?: string) => {
    if (!end || start === end) {
      const cal = formatCalendarSquare(start);
      return `${cal.weekday}, ${cal.month} ${cal.day}`;
    }
    const calStart = formatCalendarSquare(start);
    const calEnd = formatCalendarSquare(end);
    return `${calStart.month} ${calStart.day} – ${calEnd.month} ${calEnd.day}`;
  };

  const renderVideo = (url: string) => {
    if (!url || !url.trim()) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let rawId = '';
      if (url.includes('v=')) {
        rawId = url.split('v=')[1]?.split('&')[0] || '';
      } else if (url.includes('youtu.be/')) {
        rawId = url.split('youtu.be/')[1]?.split(/[?&#]/)[0] || '';
      }
      const videoId = rawId.trim();
      if (!videoId) return null;

      return (
        <div className="w-full aspect-video rounded-xl overflow-hidden border border-purple-100 dark:border-slate-800 shadow-2xs mt-2 mb-3 bg-black">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Event Video"
            allowFullScreen
          />
        </div>
      );
    }
    return (
      <div className="w-full aspect-video rounded-xl overflow-hidden border border-purple-100 dark:border-slate-800 shadow-2xs mt-2 mb-3 bg-black">
        <VideoPlayer src={url} className="w-full h-full object-cover" />
      </div>
    );
  };

  return (
    <div className="flex-1 w-full bg-[#faf8fc] dark:bg-slate-950 flex flex-col h-full select-none overflow-hidden text-slate-800 dark:text-slate-200">
      {/* Top Header / Action Strip */}
      <div className="p-3 sm:p-5 md:px-6 border-b border-purple-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs shrink-0 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onBackToReports}
              className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-purple-950 dark:text-purple-200 font-semibold text-xs border border-purple-200 dark:border-slate-700 shadow-2xs transition-all cursor-pointer touch-manipulation active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
              <span>Back to Reports</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg text-purple-950 dark:text-purple-100 tracking-tight flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                  <span>Upcoming Campus Events</span>
                </h1>
                <span className="text-xs font-mono tabular-nums text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded-full font-semibold">
                  {events.length} Scheduled
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <div className="relative min-w-[140px] sm:min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="w-full text-xs pl-8 pr-7 py-1.5 rounded-xl border border-purple-200 dark:border-slate-700 bg-purple-50/60 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-850 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
            </div>

            {/* STRICTLY ADMINS CAN SEE THIS BUTTON */}
            {role === 'admin' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-purple-800 to-slate-900 hover:from-purple-900 hover:to-black text-white px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer touch-manipulation active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-pink-400" />
                <span>Publish Event</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-purple-50 dark:border-slate-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Upcoming' },
            { id: 'bca-awareness', label: '🎗️ BCA Month', accent: true },
            { id: 'academic', label: 'Tech & Academic' },
            { id: 'student-life', label: 'Student Life' },
            { id: 'career', label: 'Career & Jobs' },
            { id: 'athletics', label: 'Athletics' },
            { id: 'arts', label: 'Arts & Music' },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 touch-manipulation ${
                  isSelected
                    ? cat.accent
                      ? 'bg-pink-600 text-white shadow-2xs'
                      : 'bg-purple-900 dark:bg-purple-700 text-white shadow-2xs'
                    : 'bg-purple-100/60 dark:bg-slate-800 text-purple-800 dark:text-purple-300 hover:bg-purple-200/70 hover:text-purple-950'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content: Scrollable Grid */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 space-y-5">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-purple-950/60 dark:text-purple-400 flex flex-col items-center justify-center min-h-[260px] bg-white dark:bg-slate-900 rounded-3xl border border-purple-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-slate-800 flex items-center justify-center text-purple-500 mb-3">
              <Calendar className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-bold text-purple-950 dark:text-purple-200">No events found</h3>
            <p className="text-xs text-purple-700/70 dark:text-purple-400 mt-1 max-w-sm">
              No campus events match your selected category or search filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredEvents.map((evt) => {
              const cal = formatCalendarSquare(evt.date);
              const isMultiDay = evt.eventType === 'multi-day' && evt.endDate;
              const hasUserRsvpd = currentUser?.email ? evt.attendees?.includes(currentUser.email) : false;
              
              return (
                <div
                  key={evt.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-purple-100 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group touch-manipulation relative"
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-12 rounded-2xl bg-purple-50 dark:bg-slate-800 border border-purple-200/90 dark:border-slate-700 flex flex-col items-center justify-center shadow-2xs shrink-0 overflow-hidden text-center">
                          <div className="bg-purple-800 dark:bg-purple-700 w-full text-[9px] font-bold text-white py-0.5 tracking-wider">
                            {cal.month}
                          </div>
                          <div className="text-sm font-extrabold text-purple-950 dark:text-purple-100 tabular-nums leading-none pt-1">
                            {cal.day}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono text-purple-500 font-bold bg-purple-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-purple-100 dark:border-slate-700">
                              {formatEventId(evt.id)}
                            </span>
                            {getCategoryBadge(evt.category)}
                            {isMultiDay && (
                              <span className="text-[9px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 px-1.5 py-0.2 rounded border border-purple-200 dark:border-purple-800 flex items-center gap-0.5">
                                <Layers className="w-2.5 h-2.5" /> {evt.durationDays ? `${evt.durationDays} Days` : 'Multi-day'}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-purple-400 font-mono block mt-0.5">
                            {formatDateRange(evt.date, evt.endDate)} · {evt.time}
                          </span>
                        </div>
                      </div>

                      {/* ADMIN DELETE BUTTON */}
                      {role === 'admin' && onDeleteEvent && (
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setEventToDelete(evt.id); 
                          }}
                          className="text-rose-500 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Delete Event permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-[15px] font-bold text-purple-950 dark:text-purple-100 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors leading-snug line-clamp-2 mb-2">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-3">
                      {evt.description}
                    </p>

                    {/* RENDER VIDEO IF IT EXISTS */}
                    {evt.videoUrl && renderVideo(evt.videoUrl)}

                    {/* PHOTO GALLERY THUMBNAIL IF PRESENT */}
                    {evt.galleryPhotos && evt.galleryPhotos.length > 0 && (
                      <div className="mb-3">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveGalleryEvent(evt);
                            setGalleryIndex(0);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl bg-purple-50/70 dark:bg-slate-800 border border-purple-200/80 dark:border-slate-700 text-xs font-semibold text-purple-950 dark:text-purple-200 hover:bg-purple-100 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-pink-600" />
                            <span>View Event Photo Gallery ({evt.galleryPhotos.length})</span>
                          </span>
                          <span className="text-[10px] text-pink-600 dark:text-pink-400">Expand →</span>
                        </button>
                      </div>
                    )}

                    <div className="space-y-1.5 mb-3 bg-purple-50/50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-purple-100/70 dark:border-slate-700 text-xs">
                      <div className="flex items-center gap-1.5 text-purple-900/90 dark:text-purple-200 truncate">
                        <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span className="truncate font-medium">{evt.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-purple-700/80 dark:text-purple-400 text-[11px] truncate">
                        <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="truncate">Host: {evt.organizer}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-purple-50 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-purple-800 dark:text-purple-300">
                      <span className="font-semibold tabular-nums text-purple-950 dark:text-purple-100">
                        {evt.rsvps}
                      </span>
                      <span className="text-purple-600 dark:text-purple-400 text-[11px]">Attending</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadIcs(evt)}
                        title="Download .ics calendar invite"
                        className="p-1.5 rounded-xl text-purple-600 dark:text-purple-400 hover:text-purple-950 hover:bg-purple-100 dark:hover:bg-slate-800 transition-colors cursor-pointer touch-manipulation"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onToggleRsvp(evt.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer touch-manipulation flex items-center gap-1 ${
                          hasUserRsvpd
                            ? 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-300 dark:border-pink-800 font-bold shadow-2xs'
                            : 'bg-purple-800 dark:bg-purple-700 hover:bg-purple-900 text-white shadow-2xs'
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${hasUserRsvpd ? 'text-pink-600' : 'text-purple-200'}`} />
                        <span>{hasUserRsvpd ? 'Going' : 'RSVP'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin New Event Modal (Supports Single-Day or Multi-Day Date Ranges) */}
      {isAddModalOpen && role === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/50 backdrop-blur-xs select-none">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-purple-200 dark:border-slate-800 w-full max-w-lg max-h-[94dvh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-200">
            <div className="px-5 py-4 border-b border-purple-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-50/80 to-white dark:from-slate-900 dark:to-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-800 dark:bg-purple-700 text-white flex items-center justify-center shadow-xs">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-purple-950 dark:text-purple-100">Publish Campus Event</h2>
                  <p className="text-[11px] text-purple-700/80 dark:text-purple-400">Configure single-day or multi-day range</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-purple-400 hover:text-purple-900 dark:hover:text-purple-100 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs select-text">
              {/* Event Type: Single Day vs Multi-Day */}
              <div className="space-y-1">
                <label className="font-bold text-purple-950 dark:text-purple-200 block">Event Schedule Format *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewEventType('single-day')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      newEventType === 'single-day'
                        ? 'bg-purple-100 dark:bg-purple-950/60 border-purple-600 text-purple-950 dark:text-purple-200'
                        : 'bg-white dark:bg-slate-800 border-purple-200 dark:border-slate-700 text-purple-700 dark:text-purple-400'
                    }`}
                  >
                    Single-Day Event
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewEventType('multi-day')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      newEventType === 'multi-day'
                        ? 'bg-purple-100 dark:bg-purple-950/60 border-purple-600 text-purple-950 dark:text-purple-200'
                        : 'bg-white dark:bg-slate-800 border-purple-200 dark:border-slate-700 text-purple-700 dark:text-purple-400'
                    }`}
                  >
                    Multi-Day (Date Range)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-purple-950 dark:text-purple-200 block">Event Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Campus Innovation Sprint 2026"
                  className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
                {formErrors.title && <p className="text-rose-600 text-[10px]">{formErrors.title}</p>}
              </div>

              {/* Dates & Times: One-Day from X to Y OR Multi-Day from X to Y */}
              {newEventType === 'single-day' ? (
                <div className="p-3 bg-purple-50/70 dark:bg-slate-800/70 rounded-2xl border border-purple-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                      One-Day Schedule (From X to Y Time)
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCustomTime(v => !v)}
                      className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      {isCustomTime ? 'Use Standard X-to-Y Pickers' : 'Type Custom Time String'}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-purple-900 dark:text-purple-300 block">Event Date *</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-400 font-medium"
                    />
                  </div>

                  {!isCustomTime ? (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="font-semibold text-purple-900 dark:text-purple-300 block">Start Time (X) *</label>
                        <input
                          type="text"
                          value={newStartTime}
                          onChange={(e) => setNewStartTime(e.target.value)}
                          placeholder="e.g. 10:00 AM"
                          className="w-full p-2 rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-400 font-medium text-xs"
                        />
                        <div className="flex gap-1 flex-wrap pt-0.5">
                          {['9:00 AM', '10:00 AM', '1:00 PM', '2:00 PM', '6:00 PM'].map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setNewStartTime(preset)}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-slate-700 text-purple-900 dark:text-purple-200 hover:bg-purple-200 cursor-pointer"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-purple-900 dark:text-purple-300 block">End Time (Y) *</label>
                        <input
                          type="text"
                          value={newEndTime}
                          onChange={(e) => setNewEndTime(e.target.value)}
                          placeholder="e.g. 1:00 PM"
                          className="w-full p-2 rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-400 font-medium text-xs"
                        />
                        <div className="flex gap-1 flex-wrap pt-0.5">
                          {['12:00 PM', '1:00 PM', '3:00 PM', '5:00 PM', '8:00 PM'].map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setNewEndTime(preset)}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-slate-700 text-purple-900 dark:text-purple-200 hover:bg-purple-200 cursor-pointer"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 pt-1">
                      <label className="font-semibold text-purple-900 dark:text-purple-300 block">Custom Time Range *</label>
                      <input
                        type="text"
                        value={newTimeCustom}
                        onChange={(e) => setNewTimeCustom(e.target.value)}
                        placeholder="e.g. 10:00 AM - 1:00 PM EST"
                        className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-400"
                      />
                    </div>
                  )}

                  <div className="text-[11px] text-purple-700 dark:text-purple-300 font-mono bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-purple-100 dark:border-slate-800 flex items-center justify-between">
                    <span>Schedule Display:</span>
                    <strong className="text-purple-950 dark:text-purple-100">
                      {isCustomTime && newTimeCustom ? newTimeCustom : `${newStartTime} - ${newEndTime}`}
                    </strong>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-purple-50/70 dark:bg-slate-800/70 rounded-2xl border border-purple-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                      Multi-Day Event Range (Number of Days from X to Y Time)
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCustomTime(v => !v)}
                      className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      {isCustomTime ? 'Use Standard X-to-Y Pickers' : 'Type Custom Time String'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-purple-900 dark:text-purple-300 block">Start Date *</label>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-400 font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-purple-900 dark:text-purple-300 block">End Date *</label>
                      <input
                        type="date"
                        value={newEndDate}
                        onChange={(e) => setNewEndDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-400 font-medium"
                      />
                    </div>
                  </div>
                  {formErrors.endDate && <p className="text-rose-600 text-[10px]">{formErrors.endDate}</p>}

                  {/* Calculated Duration Days Preview */}
                  {newDate && newEndDate && (
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-purple-100/70 dark:bg-slate-900 border border-purple-200 dark:border-slate-700 text-[11px] text-purple-900 dark:text-purple-200 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-pink-400" />
                      <span>
                        Spans {Math.max(1, Math.round((new Date(newEndDate).getTime() - new Date(newDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)} Days ({newDate} to {newEndDate})
                      </span>
                    </div>
                  )}

                  {!isCustomTime ? (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="font-semibold text-purple-900 dark:text-purple-300 block">Daily Start Time (X) *</label>
                        <input
                          type="text"
                          value={newStartTime}
                          onChange={(e) => setNewStartTime(e.target.value)}
                          placeholder="e.g. 9:00 AM"
                          className="w-full p-2 rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-400 font-medium text-xs"
                        />
                        <div className="flex gap-1 flex-wrap pt-0.5">
                          {['8:30 AM', '9:00 AM', '10:00 AM', '1:00 PM'].map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setNewStartTime(preset)}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-slate-700 text-purple-900 dark:text-purple-200 hover:bg-purple-200 cursor-pointer"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-purple-900 dark:text-purple-300 block">Daily End Time (Y) *</label>
                        <input
                          type="text"
                          value={newEndTime}
                          onChange={(e) => setNewEndTime(e.target.value)}
                          placeholder="e.g. 5:00 PM"
                          className="w-full p-2 rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-400 font-medium text-xs"
                        />
                        <div className="flex gap-1 flex-wrap pt-0.5">
                          {['3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'].map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setNewEndTime(preset)}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-slate-700 text-purple-900 dark:text-purple-200 hover:bg-purple-200 cursor-pointer"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 pt-1">
                      <label className="font-semibold text-purple-900 dark:text-purple-300 block">Custom Daily Schedule *</label>
                      <input
                        type="text"
                        value={newTimeCustom}
                        onChange={(e) => setNewTimeCustom(e.target.value)}
                        placeholder="e.g. 9:00 AM - 5:00 PM Daily"
                        className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-400"
                      />
                    </div>
                  )}

                  <div className="text-[11px] text-purple-700 dark:text-purple-300 font-mono bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-purple-100 dark:border-slate-800 flex items-center justify-between">
                    <span>Daily Schedule Display:</span>
                    <strong className="text-purple-950 dark:text-purple-100">
                      {isCustomTime && newTimeCustom ? newTimeCustom : `${newStartTime} - ${newEndTime} Daily`}
                    </strong>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-purple-950 dark:text-purple-200 block">Category *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as EventCategory)}
                  className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-400"
                >
                  <option value="student-life">Student Life & Community</option>
                  <option value="bca-awareness">🎗️ Breast Cancer Awareness (BCA)</option>
                  <option value="academic">Academic, Tech & Research</option>
                  <option value="career">Career & Internship</option>
                  <option value="athletics">Athletics & Sports</option>
                  <option value="arts">Arts, Music & Culture</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-purple-950 dark:text-purple-200 block">Location / Venue *</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g., Student Union Lawn & Main Quad"
                  className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
                {formErrors.location && <p className="text-rose-600 text-[10px]">{formErrors.location}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-purple-950 dark:text-purple-200 block">Description *</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Event details, registration guidelines..."
                  className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
                {formErrors.description && <p className="text-rose-600 text-[10px]">{formErrors.description}</p>}
              </div>

              {mediaUploadError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-[11px] text-rose-800 dark:text-rose-300">
                  {mediaUploadError}
                </div>
              )}

              {/* 4. GALLERY VIDEOS (Max 20MB) & External Links */}
              <div className="p-3 bg-purple-50 dark:bg-slate-800 rounded-2xl border border-purple-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-pink-600" /> 
                    <span>Attach Video Promo / Trailer (Max 20MB)</span>
                  </label>
                  <span className="text-[10px] font-mono text-purple-500">Device Gallery or URL</span>
                </div>

                {/* Upload from Gallery Button */}
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-purple-300 dark:border-slate-600 hover:border-purple-500 bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-purple-950 dark:text-purple-200">
                  <UploadCloud className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-semibold">
                    {isProcessingMedia ? 'Processing Video...' : 'Upload Video from Gallery (Max 20MB)'}
                  </span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/mov"
                    onChange={handleGalleryVideoUpload}
                    disabled={isProcessingMedia}
                    className="hidden"
                  />
                </label>

                {/* Video Preview if Uploaded */}
                {newVideoUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-purple-300 dark:border-slate-600 bg-black aspect-video mt-2">
                    {newVideoUrl.startsWith('data:video') || newVideoUrl.endsWith('.mp4') || newVideoUrl.endsWith('.mov') || newVideoUrl.endsWith('.webm') ? (
                      <video src={newVideoUrl} controls className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xs p-2 text-center">
                        External video link attached: {newVideoUrl.slice(0, 40)}...
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setNewVideoUrl('');
                        setGalleryVideoFileName(null);
                      }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow cursor-pointer text-xs font-bold"
                      title="Remove attached video"
                    >
                      ×
                    </button>
                    {galleryVideoFileName && (
                      <div className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded font-mono truncate max-w-[80%]">
                        {galleryVideoFileName}
                      </div>
                    )}
                  </div>
                )}

                {/* Alternative URL input */}
                <div className="pt-1">
                  <input 
                    type="url" 
                    value={newVideoUrl.startsWith('data:') ? '' : newVideoUrl} 
                    onChange={(e) => {
                      setNewVideoUrl(e.target.value);
                      setGalleryVideoFileName(null);
                    }} 
                    className="w-full p-2 text-xs rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-400 placeholder:text-purple-400/80" 
                    placeholder="Or paste YouTube or direct video URL" 
                  />
                </div>
              </div>

              {/* 5. EVENT PHOTOS: Upload from Gallery (Max 20MB) & URLs */}
              <div className="p-3 bg-pink-50/50 dark:bg-slate-800 rounded-2xl border border-pink-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-pink-600" /> 
                    <span>Event Photo Gallery (Max 20MB per photo)</span>
                  </label>
                  <span className="text-[10px] font-mono text-pink-600 dark:text-pink-400">
                    {galleryPhotosList.length} Photos
                  </span>
                </div>

                {/* Upload Photos from Gallery Button */}
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-pink-300 dark:border-slate-600 hover:border-pink-500 bg-white dark:bg-slate-900 hover:bg-pink-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-purple-950 dark:text-purple-200">
                  <UploadCloud className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  <span className="text-xs font-semibold">
                    {isProcessingMedia ? 'Compressing & importing...' : 'Upload Photos from Gallery (Max 20MB)'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleGalleryPhotosUpload}
                    disabled={isProcessingMedia}
                    className="hidden"
                  />
                </label>

                {/* Add Photo by URL */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newGalleryPhotoUrl}
                    onChange={(e) => setNewGalleryPhotoUrl(e.target.value)}
                    placeholder="Or paste online photo URL..."
                    className="flex-1 p-2 rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-purple-950 dark:text-purple-100 text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryPhotoUrl}
                    className="px-3 py-1.5 bg-pink-600 text-white rounded-xl font-bold cursor-pointer hover:bg-pink-700 text-xs"
                  >
                    Add URL
                  </button>
                </div>

                {/* Gallery Photos Preview Grid */}
                {galleryPhotosList.length > 0 && (
                  <div className="flex gap-2 flex-wrap pt-1">
                    {galleryPhotosList.map((url, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-purple-200 dark:border-slate-700 shadow-2xs group">
                        <img src={url} alt={`Gallery item ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setGalleryPhotosList(p => p.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs cursor-pointer"
                          title="Remove photo"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-purple-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-purple-800 dark:text-purple-300 hover:bg-purple-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-900 text-white font-semibold shadow-xs hover:bg-purple-950 cursor-pointer"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/50 backdrop-blur-xs select-none">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full border border-rose-200 dark:border-rose-900 shadow-2xl space-y-4 animate-in zoom-in-95 text-slate-800 dark:text-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Delete Event?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This action is permanent and will remove this event from the campus calendar.
                </p>
              </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 font-medium">
              Are you sure you want to delete this event?
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteEvent && eventToDelete) {
                    onDeleteEvent(eventToDelete);
                  }
                  setEventToDelete(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Gallery Lightbox */}
      {activeGalleryEvent && activeGalleryEvent.galleryPhotos && (
        <div 
          onClick={() => setActiveGalleryEvent(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none"
        >
          <div 
            onClick={e => e.stopPropagation()} 
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
          >
            <button
              onClick={() => setActiveGalleryEvent(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-2 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-white text-center mb-3">
              <h3 className="font-bold text-base">{activeGalleryEvent.title}</h3>
              <p className="text-xs text-white/70">
                Photo {galleryIndex + 1} of {activeGalleryEvent.galleryPhotos.length}
              </p>
            </div>

            <div className="relative w-full aspect-video max-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black">
              <img 
                src={activeGalleryEvent.galleryPhotos[galleryIndex]} 
                alt="Event recap" 
                className="max-w-full max-h-full object-contain" 
              />

              {activeGalleryEvent.galleryPhotos.length > 1 && (
                <>
                  <button
                    onClick={() => setGalleryIndex(prev => (prev > 0 ? prev - 1 : activeGalleryEvent.galleryPhotos!.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setGalleryIndex(prev => (prev < activeGalleryEvent.galleryPhotos!.length - 1 ? prev + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};