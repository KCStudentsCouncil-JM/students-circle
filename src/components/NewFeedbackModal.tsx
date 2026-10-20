import React, { useState, useMemo } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { 
  FeedbackType, 
  Category, 
  UrgencyLevel, 
  FeedbackReport,
  UserProfile
} from '../types';
import { 
  isValidMediaFile, 
  compressImage, 
  findPotentialDuplicates 
} from '../utils';
import { 
  X, 
  Sparkles, 
  Wrench, 
  Shield, 
  AlertCircle, 
  MapPin, 
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Ribbon,
  ThumbsUp,
  Video,
  Play,
  Bot
} from 'lucide-react';

interface NewFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: Omit<FeedbackReport, 'id' | 'createdAt' | 'upvotes' | 'activities'>) => void;
  existingReports?: FeedbackReport[];
  onSelectExistingReport?: (id: string) => void;
  currentUser: UserProfile | null;
}

export const NewFeedbackModal: React.FC<NewFeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingReports = [],
  onSelectExistingReport,
  currentUser,
}) => {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('issue');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('facilities');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const [aiTriageMessage, setAiTriageMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const potentialDuplicates = useMemo(() => {
    return findPotentialDuplicates(title, description, existingReports);
  }, [title, description, existingReports]);

  if (!isOpen) return null;

  // AI Auto-Triage heuristic function
  const handleAiAutoTriage = () => {
    const combined = `${title} ${description}`.toLowerCase();
    let suggestedCategory: Category = category;
    let suggestedUrgency: UrgencyLevel = urgency;
    let matchedReason = '';

    if (/wi-fi|wifi|internet|network|canvas|portal|login|computer|printer|server|software|password|screen|projector/.test(combined)) {
      suggestedCategory = 'technology';
      matchedReason = 'Detected IT & network keywords';
    } else if (/safety|police|theft|stairwell|dark|lighting|hazard|fire|smoke|lock|security|assault|emergency/.test(combined)) {
      suggestedCategory = 'safety';
      suggestedUrgency = 'high';
      matchedReason = 'Detected campus safety alert keywords';
    } else if (/leak|water|fountain|toilet|bathroom|restroom|ac|air condition|heating|hvac|elevator|door|window|roof|trash|desk|chair/.test(combined)) {
      suggestedCategory = 'facilities';
      matchedReason = 'Detected facility & infrastructure maintenance keywords';
    } else if (/prof|professor|grade|grading|exam|syllabus|course|credit|tutor|advising|lecture|lab session/.test(combined)) {
      suggestedCategory = 'academics';
      matchedReason = 'Detected academic & curriculum keywords';
    } else if (/event|fundraiser|bca|walk|club|social|housing|dorm|dining|food|recreation|gym/.test(combined)) {
      suggestedCategory = 'student-life';
      matchedReason = 'Detected student community & life keywords';
    }

    if (/urgent|broken down|overheating|flooded|sparks|immediate|alarm|freezing|danger|emergency|hazard/.test(combined)) {
      suggestedUrgency = 'high';
    } else if (/minor|suggestion|would like|consider|whenever|cosmetic/.test(combined)) {
      suggestedUrgency = 'low';
    }

    setCategory(suggestedCategory);
    setUrgency(suggestedUrgency);
    setAiTriageMessage(`AI Auto-Triage: Categorized as ${suggestedCategory.toUpperCase()} (${suggestedUrgency.toUpperCase()} priority). ${matchedReason}`);
    setTimeout(() => setAiTriageMessage(null), 6000);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const cleanTitle = title.replace(/\s+/g, '');
    if (!cleanTitle) newErrors.title = 'Title cannot be empty or contain only spaces.';
    else if (cleanTitle.length < 4) newErrors.title = 'Title must contain at least 4 letters/digits.';

    const cleanLocation = location.replace(/\s+/g, '');
    if (!cleanLocation) newErrors.location = 'Location cannot be empty or contain only spaces.';
    else if (cleanLocation.length < 3) newErrors.location = 'Please specify a valid building or room location.';

    const cleanDesc = description.replace(/\s+/g, '');
    if (!cleanDesc) newErrors.description = 'Description cannot be empty or contain only spaces.';
    else if (cleanDesc.length < 10) newErrors.description = 'Please provide more details (minimum 10 non-space characters).';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + videos.length + files.length > 5) {
      setUploadError('You can attach a maximum of 5 media items (photos or videos) per report.');
      return;
    }

    setIsProcessingMedia(true);
    try {
      const newPhotos: string[] = [];
      const newVideos: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const validation = isValidMediaFile(file);
        if (!validation.valid) {
          setUploadError(validation.error || 'Invalid file.');
          setIsProcessingMedia(false);
          return;
        }

        if (validation.mediaType === 'video') {
          const videoData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read video file.'));
            reader.readAsDataURL(file);
          });
          newVideos.push(videoData);
        } else {
          const compressed = await compressImage(file, 900, 0.75);
          newPhotos.push(compressed);
        }
      }

      setPhotos(prev => [...prev, ...newPhotos]);
      setVideos(prev => [...prev, ...newVideos]);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process media file. Please check file format and try again.');
    } finally {
      setIsProcessingMedia(false);
      e.target.value = '';
    }
  };

  const resetForm = () => {
    setTitle('');
    setLocation('');
    setDescription('');
    setPhotos([]);
    setVideos([]);
    setErrors({});
    setUploadError(null);
    setAiTriageMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      type: feedbackType,
      category,
      urgency,
      status: 'open',
      description: description.trim(),
      location: location.trim(),
      photos: photos.length > 0 ? photos : undefined,
      videos: videos.length > 0 ? videos : undefined,
      department: category === 'facilities' ? 'Campus Facilities & Operations' : category === 'technology' ? 'Central Campus IT' : category === 'safety' ? 'Campus Safety & Police' : category === 'academics' ? 'Academic Affairs Office' : 'Student Affairs & Leadership',
      isAnonymous,
      author: isAnonymous ? 'Anonymous Student' : (currentUser?.name || 'Student'),
      authorRole: isAnonymous ? 'Enrolled Student' : (currentUser?.title || 'Undergraduate Student'),
      authorRealName: currentUser?.name,
      authorEmail: currentUser?.email,
      authorStudentId: currentUser?.id,
    });
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-purple-950/60 backdrop-blur-sm select-none">
      <div 
        className="bg-white dark:bg-slate-900 sm:rounded-3xl rounded-t-3xl shadow-2xl border-t sm:border border-purple-200 dark:border-slate-800 w-full max-w-2xl max-h-[92dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 text-slate-800 dark:text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-purple-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-700 to-pink-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 text-pink-200" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-purple-950 dark:text-purple-100 tracking-tight">
                New Campus Report or Initiative
              </h2>
              <p className="text-[11px] text-purple-700/80 dark:text-purple-400">
                Submit an issue or propose a new student initiative
              </p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); onClose(); }}
            className="w-8 h-8 rounded-full bg-purple-50 dark:bg-slate-800 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 text-sm overscroll-contain select-text">
          
          {/* AI Auto-Triage Banner */}
          {aiTriageMessage && (
            <div className="p-3 bg-purple-100/90 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-700 rounded-2xl flex items-center gap-2.5 text-xs text-purple-950 dark:text-purple-200 animate-in fade-in slide-in-from-top-1">
              <Bot className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
              <span>{aiTriageMessage}</span>
            </div>
          )}

          {potentialDuplicates.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl space-y-2 animate-in slide-in-from-top-1">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Possible Duplicate Ticket Detected</span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-snug">
                A similar active report exists on campus. You can endorse it instead of filing a duplicate:
              </p>
              <div className="space-y-1.5 pt-1">
                {potentialDuplicates.slice(0, 2).map((dup) => (
                  <div key={dup.id} className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-amber-200 dark:border-slate-700 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-purple-950 dark:text-purple-100 truncate text-[11px]">
                        #{dup.id} · {dup.title}
                      </div>
                    </div>
                    {onSelectExistingReport && (
                      <button
                        type="button"
                        onClick={() => { onSelectExistingReport(dup.id); onClose(); }}
                        className="text-[10px] font-bold text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/50 hover:bg-pink-100 px-2.5 py-1 rounded-md border border-pink-200 dark:border-pink-800 shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <ThumbsUp className="w-3 h-3 text-pink-600" />
                        <span>Endorse Existing</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 1. Feedback Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-purple-950/70 dark:text-purple-300 block">1. Submission Category</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${feedbackType === 'issue' ? 'border-purple-600 bg-purple-50/80 dark:bg-purple-950/40 shadow-xs' : 'border-purple-100 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-purple-50/30'}`}>
                <input type="radio" name="feedbackType" value="issue" checked={feedbackType === 'issue'} onChange={() => setFeedbackType('issue')} className="mt-0.5 w-4 h-4 text-purple-600 focus:ring-purple-500 cursor-pointer" />
                <div>
                  <div className="font-bold text-sm text-purple-950 dark:text-purple-100 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Report Issue or Defect
                  </div>
                  <p className="text-xs text-purple-800/70 dark:text-purple-400 mt-0.5 leading-snug">Facilities malfunction, Wi-Fi outage, campus hazard.</p>
                </div>
              </label>
              <label className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${feedbackType === 'initiative' ? 'border-purple-600 bg-purple-50/80 dark:bg-purple-950/40 shadow-xs' : 'border-purple-100 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-purple-50/30'}`}>
                <input type="radio" name="feedbackType" value="initiative" checked={feedbackType === 'initiative'} onChange={() => setFeedbackType('initiative')} className="mt-0.5 w-4 h-4 text-purple-600 focus:ring-purple-500 cursor-pointer" />
                <div>
                  <div className="font-bold text-sm text-purple-950 dark:text-purple-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-pink-600 dark:text-pink-400" /> Propose Campus Initiative
                  </div>
                  <p className="text-xs text-purple-800/70 dark:text-purple-400 mt-0.5 leading-snug">Propose events, club fundraisers, or student amenities.</p>
                </div>
              </label>
            </div>
          </div>

          {/* 2. Title & AI Auto-Triage button */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-950/70 dark:text-purple-300 block">2. Title *</label>
              {(title.trim().length > 3 || description.trim().length > 5) && (
                <button
                  type="button"
                  onClick={handleAiAutoTriage}
                  className="flex items-center gap-1 text-[11px] font-bold text-pink-700 dark:text-pink-300 hover:text-pink-900 bg-pink-50 dark:bg-pink-950/60 px-2 py-0.5 rounded-lg border border-pink-200 dark:border-pink-800 cursor-pointer transition-colors"
                  title="Automatically categorize department and urgency using AI"
                >
                  <Bot className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                  <span>AI Auto-Triage</span>
                </button>
              )}
            </div>
            <input
              type="text"
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={feedbackType === 'issue' ? 'e.g., Broken AC in Lab 402' : 'e.g., Annual Pink Ribbon 5K Campus Walk'}
              className={`w-full text-base sm:text-sm p-3 rounded-xl border bg-white dark:bg-slate-800 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-2 transition-all ${errors.title ? 'border-rose-400 focus:ring-rose-200' : 'border-purple-200 dark:border-slate-700 focus:border-purple-600 focus:ring-purple-200'}`}
            />
            {errors.title && <p className="text-[11px] text-rose-600 font-medium">{errors.title}</p>}
          </div>

          {/* 3 & 4. Category & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-950/70 dark:text-purple-300 block">3. Department Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full text-base sm:text-sm p-3 rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                <option value="facilities">Facilities & Operations</option>
                <option value="technology">Central Campus IT & Tech</option>
                <option value="academics">Academic Affairs</option>
                <option value="student-life">Student Life & Community</option>
                <option value="safety">Campus Safety & Police</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-950/70 dark:text-purple-300 block">4. Urgency Level *</label>
              <div className="flex items-center gap-1.5 pt-0.5">
                {(['low', 'medium', 'high'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setUrgency(lvl)}
                    className={`flex-1 py-2.5 px-2 text-sm rounded-xl font-semibold capitalize border transition-all cursor-pointer ${
                      urgency === lvl 
                        ? lvl === 'high' 
                          ? 'bg-pink-50 dark:bg-pink-950/50 border-pink-400 text-pink-700 dark:text-pink-300 shadow-xs' 
                          : 'bg-purple-100/80 dark:bg-purple-950/60 border-purple-400 text-purple-900 dark:text-purple-200 shadow-xs' 
                        : 'bg-white dark:bg-slate-800 border-purple-100 dark:border-slate-700 text-purple-700/80 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {lvl === 'high' ? 'High' : lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Location */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-purple-950/70 dark:text-purple-300 block">5. Location & Room *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Engineering Block B, Room 402"
                className={`w-full text-base sm:text-sm pl-9 pr-3 py-3 rounded-xl border bg-white dark:bg-slate-800 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-2 transition-all ${errors.location ? 'border-rose-400 focus:ring-rose-200' : 'border-purple-200 dark:border-slate-700 focus:border-purple-600 focus:ring-purple-200'}`}
              />
            </div>
            {errors.location && <p className="text-[11px] text-rose-600 font-medium">{errors.location}</p>}
          </div>

          {/* 6. Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-purple-950/70 dark:text-purple-300 block">6. Description & Details *</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific details, room context, or proposed implementation..."
              className={`w-full text-base sm:text-sm p-3 rounded-xl border bg-white dark:bg-slate-800 text-purple-950 dark:text-purple-100 focus:outline-none focus:ring-2 transition-all ${errors.description ? 'border-rose-400 focus:ring-rose-200' : 'border-purple-200 dark:border-slate-700 focus:border-purple-600 focus:ring-purple-200'}`}
            />
            {errors.description && <p className="text-[11px] text-rose-600 font-medium">{errors.description}</p>}
          </div>

          {/* 7. Gallery Media Upload: Photos & Videos up to 20MB */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-950/70 dark:text-purple-300 flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Media Attachments (Photos & Videos up to 20MB)</span>
              </label>
              <span className="text-[10px] text-purple-500 font-mono">Max 20MB / file</span>
            </div>

            {uploadError && (
              <p className="text-[11px] text-rose-600 font-medium bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
                {uploadError}
              </p>
            )}

            {/* Media Previews */}
            {(photos.length > 0 || videos.length > 0) && (
              <div className="flex items-center gap-2.5 flex-wrap pt-1">
                {/* Photo Previews */}
                {photos.map((src, idx) => (
                  <div key={`photo-${idx}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-purple-200 dark:border-slate-700 shadow-2xs group">
                    <img src={src} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos(p => p.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                      title="Remove photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] font-bold px-1 rounded">Photo</span>
                  </div>
                ))}

                {/* Video Previews */}
                {videos.map((src, idx) => (
                  <div key={`video-${idx}`} className="relative w-24 h-20 rounded-xl overflow-hidden border border-purple-300 dark:border-purple-700 shadow-2xs group bg-black flex items-center justify-center">
                    <VideoPlayer src={src} thumbnail className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Play className="w-5 h-5 text-white fill-white/80" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setVideos((v) => v.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 cursor-pointer shadow-xs z-10"
                      title="Remove video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-purple-900/80 text-pink-200 text-[8px] font-bold px-1 rounded flex items-center gap-0.5">
                      <Video className="w-2.5 h-2.5" /> Video
                    </span>
                  </div>
                ))}
              </div>
            )}

            {photos.length + videos.length < 5 && (
              <label className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-purple-300 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400 bg-purple-50/40 dark:bg-slate-800/40 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-purple-900 dark:text-purple-300">
                <UploadCloud className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div className="text-left">
                  <span className="text-xs sm:text-sm font-bold block">
                    {isProcessingMedia ? 'Compressing and importing media...' : 'Upload Photos or Videos from Gallery'}
                  </span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 block">
                    Supports JPG, PNG, WebP, MP4, WebM (Max 20MB per file)
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                  multiple
                  onChange={handleMediaUpload}
                  disabled={isProcessingMedia}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* 8. Anonymous Toggle */}
          <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-slate-800/60 border border-purple-200/80 dark:border-slate-700 flex items-start gap-3">
            <input 
              type="checkbox" 
              id="anon-toggle" 
              checked={isAnonymous} 
              onChange={(e) => setIsAnonymous(e.target.checked)} 
              className="mt-1 w-5 h-5 text-purple-600 rounded border-purple-300 focus:ring-purple-500 cursor-pointer" 
            />
            <div className="flex-1">
              <label htmlFor="anon-toggle" className="font-bold text-sm text-purple-950 dark:text-purple-100 cursor-pointer flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-pink-600" /> Submit Anonymously to Peers
              </label>
              <p className="text-xs text-purple-800/70 dark:text-purple-400 leading-snug mt-0.5">
                Your public author identity will be masked as "Anonymous Student". Campus operations maintains confidential verification.
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 bg-white dark:bg-slate-900 border-t border-purple-100 dark:border-slate-800 flex items-center justify-between shrink-0 pb-safe">
          <div className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1.5 hidden sm:flex">
            <Ribbon className="w-4 h-4 text-pink-500" /> BCA Month Solidarity
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              type="button" 
              onClick={() => { resetForm(); onClose(); }} 
              className="flex-1 sm:flex-none px-4 py-3 text-sm font-semibold text-purple-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handleSubmit} 
              disabled={isProcessingMedia}
              className="flex-[2] sm:flex-none px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-purple-700 via-purple-800 to-pink-600 hover:from-purple-800 hover:to-pink-700 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isProcessingMedia ? 'Processing Media...' : 'Submit Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};