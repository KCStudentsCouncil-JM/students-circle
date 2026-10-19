import React, { useState, useMemo } from 'react';
import { CampusEvent, EventCategory, RoleMode } from '../types';
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
  PlayCircle
} from 'lucide-react';

interface EventsSectionProps {
  events: CampusEvent[];
  role: RoleMode;
  onToggleRsvp: (id: string) => void;
  onAddEvent: (newEvent: Omit<CampusEvent, 'id' | 'rsvps' | 'hasRsvpd'>) => void;
  onDeleteEvent?: (id: string) => void; // NEW: Passed from App.tsx
  onSelectFeedbackReport?: (feedbackId: string) => void;
  onBackToReports: () => void;
}

export const EventsSection: React.FC<EventsSectionProps> = ({
  events,
  role,
  onToggleRsvp,
  onAddEvent,
  onDeleteEvent,
  onSelectFeedbackReport,
  onBackToReports,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | EventCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Event Form state (Admin)
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('2026-10-31');
  const [newTime, setNewTime] = useState('2:00 PM - 5:00 PM');
  const [newLocation, setNewLocation] = useState('');
  const [newOrganizer, setNewOrganizer] = useState('Campus Student Activities Board');
  const [newCategory, setNewCategory] = useState<EventCategory>('student-life');
  const [newTags, setNewTags] = useState('Campus, Student Life');
  const [newCapacity, setNewCapacity] = useState('250');
  const [newVideoUrl, setNewVideoUrl] = useState(''); // NEW: Video URL state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  // Featured event
  const featuredEvent = useMemo(() => {
    return events.find((e) => e.featured) || events[0] || null;
  }, [events]);

  const handleDownloadIcs = (event: CampusEvent) => {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//University Campus Assistant//Events//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${event.location}`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.id}_${event.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!newTitle.trim()) errors.title = 'Title is required';
    if (!newLocation.trim()) errors.location = 'Location is required';
    if (!newDesc.trim()) errors.description = 'Description is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onAddEvent({
      title: newTitle.trim(),
      description: newDesc.trim(),
      date: newDate,
      time: newTime.trim(),
      location: newLocation.trim(),
      organizer: newOrganizer.trim(),
      category: newCategory,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      capacity: parseInt(newCapacity, 10) || 200,
      isOfficialUniversityEvent: true,
      featured: false,
      videoUrl: newVideoUrl.trim() || undefined, // Add video URL
    });

    setIsAddModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewLocation('');
    setNewVideoUrl('');
    setFormErrors({});
  };

  const getCategoryBadge = (cat: EventCategory) => {
    switch (cat) {
      case 'bca-awareness':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-700 bg-pink-50 border border-pink-200 px-2.5 py-0.5 rounded-md">
            <Ribbon className="w-3.5 h-3.5 text-pink-600" />
            <span>BCA Month</span>
          </span>
        );
      case 'academic':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-md">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Academic & Tech</span>
          </span>
        );
      case 'student-life':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Student Life</span>
          </span>
        );
      case 'career':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-md">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Career & Jobs</span>
          </span>
        );
      case 'athletics':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
            <span>⚽ Athletics</span>
          </span>
        );
      case 'arts':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200 px-2.5 py-0.5 rounded-md">
            <span>🎨 Arts & Music</span>
          </span>
        );
    }
  };

  const formatCalendarSquare = (dateStr: string) => {
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, monthIdx, day);
    return {
      month: dateObj.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
      day,
      weekday: dateObj.toLocaleDateString(undefined, { weekday: 'short' }),
    };
  };

  // Helper to render YouTube or MP4 videos
  const renderVideo = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('youtu.be/')[1];
      return (
        <div className="w-full aspect-video rounded-lg overflow-hidden border border-purple-100 shadow-2xs mt-2 mb-3">
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
      <div className="w-full aspect-video rounded-lg overflow-hidden border border-purple-100 shadow-2xs mt-2 mb-3">
        <video src={url} controls className="w-full h-full object-cover" />
      </div>
    );
  };

  return (
    <div className="flex-1 w-full bg-[#faf8fc] flex flex-col h-full select-none overflow-hidden">
      {/* Top Header / Action Strip */}
      <div className="p-3 sm:p-5 md:px-6 border-b border-purple-100 bg-white/95 backdrop-blur-xs shrink-0 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onBackToReports}
              className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg bg-white hover:bg-purple-50 text-purple-950 font-semibold text-xs border border-purple-200 shadow-2xs transition-all cursor-pointer touch-manipulation active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-purple-700" />
              <span>Back to Reports</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg text-purple-950 tracking-tight flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-700" />
                  <span>Upcoming Campus Events</span>
                </h1>
                <span className="text-xs font-mono tabular-nums text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-semibold">
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
                className="w-full text-xs pl-8 pr-7 py-1.5 rounded-lg border border-purple-200 bg-purple-50/60 focus:bg-white text-purple-950 focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
            </div>

            {/* STRICTLY ADMINS CAN SEE THIS BUTTON */}
            {role === 'admin' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-purple-800 to-slate-900 hover:from-purple-900 hover:to-black text-white px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer touch-manipulation active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-pink-400" />
                <span>Publish Event</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-purple-50 overflow-x-auto no-scrollbar">
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
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 touch-manipulation ${
                  isSelected
                    ? cat.accent
                      ? 'bg-pink-600 text-white shadow-2xs'
                      : 'bg-purple-900 text-white shadow-2xs'
                    : 'bg-purple-100/60 text-purple-800 hover:bg-purple-200/70 hover:text-purple-950'
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
          <div className="p-12 text-center text-purple-950/60 flex flex-col items-center justify-center min-h-[260px] bg-white rounded-2xl border border-purple-100">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-500 mb-3">
              <Calendar className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-bold text-purple-950">No events found</h3>
            <p className="text-xs text-purple-700/70 mt-1 max-w-sm">
              No campus events match your selected category or search filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredEvents.map((evt) => {
              const cal = formatCalendarSquare(evt.date);
              return (
                <div
                  key={evt.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-purple-100 hover:border-purple-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group touch-manipulation relative"
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-12 rounded-xl bg-purple-50 border border-purple-200/90 flex flex-col items-center justify-center shadow-2xs shrink-0 overflow-hidden text-center">
                          <div className="bg-purple-800 w-full text-[9px] font-bold text-white py-0.5 tracking-wider">
                            {cal.month}
                          </div>
                          <div className="text-sm font-extrabold text-purple-950 tabular-nums leading-none pt-1">
                            {cal.day}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {getCategoryBadge(evt.category)}
                          </div>
                          <span className="text-[10px] text-purple-400 font-mono block mt-0.5">
                            {cal.weekday} · {evt.time}
                          </span>
                        </div>
                      </div>

                      {/* ADMIN DELETE BUTTON */}
                      {role === 'admin' && onDeleteEvent && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteEvent(evt.id); }}
                          className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-md transition-colors"
                          title="Delete Event permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-[15px] font-bold text-purple-950 group-hover:text-purple-700 transition-colors leading-snug line-clamp-2 mb-2">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
                      {evt.description}
                    </p>

                    {/* RENDER VIDEO IF IT EXISTS */}
                    {evt.videoUrl && renderVideo(evt.videoUrl)}

                    <div className="space-y-1.5 mb-3 bg-purple-50/50 p-2.5 rounded-xl border border-purple-100/70 text-xs">
                      <div className="flex items-center gap-1.5 text-purple-900/90 truncate">
                        <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span className="truncate font-medium">{evt.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-purple-700/80 text-[11px] truncate">
                        <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="truncate">Host: {evt.organizer}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-purple-50 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-purple-800">
                      <span className="font-semibold tabular-nums text-purple-950">
                        {evt.rsvps}
                      </span>
                      <span className="text-purple-600 text-[11px]">Attending</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadIcs(evt)}
                        title="Download .ics calendar invite"
                        className="p-1.5 rounded-lg text-purple-600 hover:text-purple-950 hover:bg-purple-100 transition-colors cursor-pointer touch-manipulation"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onToggleRsvp(evt.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer touch-manipulation flex items-center gap-1 ${
                          evt.hasRsvpd
                            ? 'bg-pink-50 text-pink-700 border border-pink-300 font-bold shadow-2xs'
                            : 'bg-purple-800 hover:bg-purple-900 text-white shadow-2xs'
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${evt.hasRsvpd ? 'text-pink-600' : 'text-purple-200'}`} />
                        <span>{evt.hasRsvpd ? 'Going' : 'RSVP'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin New Event Modal (Only Renders if Admin) */}
      {isAddModalOpen && role === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/40 backdrop-blur-xs select-none">
          <div className="bg-white rounded-2xl shadow-2xl border border-purple-200 w-full max-w-lg max-h-[94dvh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50/80 to-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-800 text-white flex items-center justify-center shadow-xs">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-purple-950">Publish Campus Event</h2>
                  <p className="text-[11px] text-purple-700/80">Add to the official campus activity roster</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-purple-400 hover:text-purple-900 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs select-text">
              <div className="space-y-1">
                <label className="font-semibold text-purple-950 block">Event Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Campus Coding Marathon"
                  className="w-full p-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
                {formErrors.title && <p className="text-rose-600 text-[10px]">{formErrors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-purple-950 block">Date *</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-purple-200 text-purple-950 focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-purple-950 block">Time *</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-2 rounded-lg border border-purple-200 text-purple-950 focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-purple-950 block">Category *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as EventCategory)}
                  className="w-full p-2 rounded-lg border border-purple-200 bg-white text-purple-950 focus:outline-none focus:ring-1 focus:ring-purple-400"
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
                <label className="font-semibold text-purple-950 block">Location / Venue *</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g., Student Union Lawn"
                  className="w-full p-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
                {formErrors.location && <p className="text-rose-600 text-[10px]">{formErrors.location}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-purple-950 block">Description *</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Details, student registration guidelines..."
                  className="w-full p-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
                {formErrors.description && <p className="text-rose-600 text-[10px]">{formErrors.description}</p>}
              </div>

              {/* NEW: VIDEO INPUT */}
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-1">
                <label className="font-bold text-purple-950 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-pink-600" /> 
                  <span>Attach Promo Video (Optional)</span>
                </label>
                <input 
                  type="url" 
                  value={newVideoUrl} 
                  onChange={(e) => setNewVideoUrl(e.target.value)} 
                  className="w-full p-2 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-1 focus:ring-purple-400" 
                  placeholder="Paste YouTube link or direct .mp4 URL" 
                />
                <p className="text-[10px] text-purple-700/80 pt-0.5">
                  Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-purple-800 hover:bg-purple-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-900 text-white font-semibold shadow-xs hover:bg-purple-950"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};