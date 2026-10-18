import React, { useState, useMemo } from 'react';
import { 
  FeedbackType, 
  Category, 
  UrgencyLevel, 
  FeedbackReport 
} from '../types';
import { 
  isValidImageFile, 
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
  ExternalLink,
  ThumbsUp
} from 'lucide-react';

interface NewFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: Omit<FeedbackReport, 'id' | 'createdAt' | 'upvotes' | 'activities'>) => void;
  existingReports?: FeedbackReport[];
  onSelectExistingReport?: (id: string) => void;
}

export const NewFeedbackModal: React.FC<NewFeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingReports = [],
  onSelectExistingReport,
}) => {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('issue');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('facilities');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [authorName] = useState('Dylon Ocha');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Duplicate detection using stop-word filtering
  const potentialDuplicates = useMemo(() => {
    return findPotentialDuplicates(title, description, existingReports);
  }, [title, description, existingReports]);

  if (!isOpen) return null;

  // Fix #14: Strict validation preventing whitespace-only submissions
  const validate = () => {
    const newErrors: Record<string, string> = {};

    const cleanTitle = title.replace(/\s+/g, '');
    if (!cleanTitle) {
      newErrors.title = 'Title cannot be empty or contain only spaces.';
    } else if (cleanTitle.length < 4) {
      newErrors.title = 'Title must contain at least 4 letters/digits.';
    }

    const cleanLocation = location.replace(/\s+/g, '');
    if (!cleanLocation) {
      newErrors.location = 'Location cannot be empty or contain only spaces.';
    } else if (cleanLocation.length < 3) {
      newErrors.location = 'Please specify a valid building or room location.';
    }

    const cleanDesc = description.replace(/\s+/g, '');
    if (!cleanDesc) {
      newErrors.description = 'Description cannot be empty or contain only spaces.';
    } else if (cleanDesc.length < 10) {
      newErrors.description = 'Please provide more details (minimum 10 non-space characters).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fix #3 & #11: File type validation and canvas-based compression to prevent localStorage crashes
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > 3) {
      setUploadError('You can upload a maximum of 3 evidence photos per report.');
      return;
    }

    setIsCompressing(true);

    try {
      const compressedList: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate MIME type & extension
        const typeCheck = isValidImageFile(file);
        if (!typeCheck.valid) {
          setUploadError(typeCheck.error || 'Invalid file type. Only JPG, PNG, and WebP are allowed.');
          setIsCompressing(false);
          return;
        }

        // Downscale to max 800x800 and compress to ~35KB JPEG
        const compressedBase64 = await compressImage(file, 800, 0.7);
        compressedList.push(compressedBase64);
      }

      setPhotos((prev) => [...prev, ...compressedList].slice(0, 3));
    } catch (err: any) {
      setUploadError('Failed to process image. Please try another photo.');
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
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
      department: category === 'facilities' 
        ? 'Campus Facilities & Operations' 
        : category === 'technology' 
        ? 'Central Campus IT' 
        : category === 'safety' 
        ? 'Campus Safety & Police' 
        : category === 'academics' 
        ? 'Academic Affairs Office' 
        : 'Student Affairs & Leadership',
      isAnonymous,
      author: isAnonymous ? 'Anonymous Student' : authorName,
      authorRole: isAnonymous ? 'Enrolled Student' : 'Undergraduate Student',
    });

    onClose();
  };

  const handlePreFill = (type: 'broken-ac' | 'bca-drive' | 'wifi-issue') => {
    if (type === 'broken-ac') {
      setFeedbackType('issue');
      setTitle('Water leak and faulty thermostat in Science Block Room 204');
      setCategory('facilities');
      setUrgency('high');
      setLocation('Science Complex, Block C, Room 204');
      setDescription('Persistent water dripping from ceiling tile adjacent to the projector screen. Thermostat is stuck at 79°F despite setting dial to 68°F. Poses a slipping risk on vinyl flooring during lectures.');
      setIsAnonymous(false);
    } else if (type === 'bca-drive') {
      setFeedbackType('initiative');
      setTitle('Initiative: BCA Campus Wellness Day & Breast Cancer Awareness Forum');
      setCategory('student-life');
      setUrgency('medium');
      setLocation('Student Center Plaza & Auditorium');
      setDescription('Organizing a campus awareness panel with medical experts, survivor testimonials, and distributing pink ribbons and wellness kits to students. Seeking room booking authorization and student council banner approval.');
      setIsAnonymous(false);
    } else if (type === 'wifi-issue') {
      setFeedbackType('issue');
      setTitle('Frequent 5GHz Wi-Fi drops inside Graduate Research Commons');
      setCategory('technology');
      setUrgency('medium');
      setLocation('Graduate Library, 4th Floor North Wing');
      setDescription('Students experience sudden authentication drops every 30 minutes while using the university proxy. Traceroute shows high packet loss at gateway 10.14.0.1.');
      setIsAnonymous(true);
    }
    setErrors({});
    setUploadError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-purple-950/45 backdrop-blur-xs select-none">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-purple-200 w-full max-w-2xl max-h-[92dvh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Window Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50/80 via-white to-pink-50/40 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-700 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 text-pink-300" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-purple-950 tracking-tight">
                New Feedback Assistant Report
              </h2>
              <p className="text-[10px] sm:text-[11px] text-purple-700/80">
                Submit an infrastructure issue or pitch a new campus initiative
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-purple-400 hover:text-purple-900 hover:bg-purple-100/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Pre-fill Template Strip */}
        <div className="px-4 sm:px-6 py-2 bg-purple-50/50 border-b border-purple-100/80 flex items-center justify-between gap-2 text-xs overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-purple-900 flex items-center gap-1 shrink-0">
            <span>✨ Quick Templates:</span>
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handlePreFill('broken-ac')}
              className="text-[10px] px-2 py-1 rounded bg-white border border-purple-200 text-purple-800 hover:bg-purple-100/80 font-medium cursor-pointer touch-manipulation"
            >
              Water Leak Fix
            </button>
            <button
              type="button"
              onClick={() => handlePreFill('bca-drive')}
              className="text-[10px] px-2 py-1 rounded bg-pink-50 border border-pink-200 text-pink-700 hover:bg-pink-100 font-semibold cursor-pointer touch-manipulation"
            >
              🎗️ BCA Initiative
            </button>
            <button
              type="button"
              onClick={() => handlePreFill('wifi-issue')}
              className="text-[10px] px-2 py-1 rounded bg-white border border-purple-200 text-purple-800 hover:bg-purple-100/80 font-medium cursor-pointer touch-manipulation"
            >
              Wi-Fi Drop
            </button>
          </div>
        </div>

        {/* Form Body: Scrollable with safe bottom padding for mobile virtual keyboard */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3.5 sm:space-y-4 text-xs select-text pb-20 sm:pb-6 overscroll-contain">
          {/* Fix #9: Duplicate Warning Notification (only triggers on >= 2 distinct keywords, ignoring stop-words) */}
          {potentialDuplicates.length > 0 && (
            <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-xl space-y-2 animate-in slide-in-from-top-1">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Possible Duplicate Report Detected</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                A similar report is already active in the queue. You can endorse it instead of creating a duplicate ticket:
              </p>
              <div className="space-y-1.5 pt-1">
                {potentialDuplicates.slice(0, 2).map((dup) => (
                  <div key={dup.id} className="bg-white p-2 rounded-lg border border-amber-200 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-purple-950 truncate text-[11px]">
                        #{dup.id} · {dup.title}
                      </div>
                      <div className="text-[10px] text-purple-700/70 truncate">
                        Location: {dup.location} · {dup.upvotes} student endorsements
                      </div>
                    </div>
                    {onSelectExistingReport && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectExistingReport(dup.id);
                          onClose();
                        }}
                        className="text-[10px] font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 px-2.5 py-1 rounded-md border border-pink-200 shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <ThumbsUp className="w-3 h-3 text-pink-600" />
                        <span>View / Endorse</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 1. Feedback Type (Radio toggle) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-purple-950/70 block">
              1. Feedback Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <label className={`flex items-start gap-2.5 sm:gap-3 p-3 rounded-xl border cursor-pointer transition-all touch-manipulation ${
                feedbackType === 'issue'
                  ? 'border-purple-600 bg-purple-50/80 shadow-xs'
                  : 'border-purple-100 bg-white hover:bg-purple-50/30'
              }`}>
                <input
                  type="radio"
                  name="feedbackType"
                  value="issue"
                  checked={feedbackType === 'issue'}
                  onChange={() => setFeedbackType('issue')}
                  className="mt-0.5 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <div>
                  <div className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-purple-600" />
                    <span>Report an Issue / Fix</span>
                  </div>
                  <p className="text-[11px] text-purple-800/70 mt-0.5 leading-snug">
                    Broken facilities, Wi-Fi drops, safety hazards, equipment repairs.
                  </p>
                </div>
              </label>

              <label className={`flex items-start gap-2.5 sm:gap-3 p-3 rounded-xl border cursor-pointer transition-all touch-manipulation ${
                feedbackType === 'initiative'
                  ? 'border-purple-600 bg-purple-50/80 shadow-xs'
                  : 'border-purple-100 bg-white hover:bg-purple-50/30'
              }`}>
                <input
                  type="radio"
                  name="feedbackType"
                  value="initiative"
                  checked={feedbackType === 'initiative'}
                  onChange={() => setFeedbackType('initiative')}
                  className="mt-0.5 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <div>
                  <div className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                    <span>Suggest Event / Initiative</span>
                  </div>
                  <p className="text-[11px] text-purple-800/70 mt-0.5 leading-snug">
                    Propose campus clubs, charity walkathons, extended dining, student events.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 2. Title / Summary with space-only validation */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-purple-950/70 block">
                2. Title / Short Summary *
              </label>
              <span className="text-[10px] text-purple-400 font-mono">
                {title.length}/100
              </span>
            </div>
            <input
              type="text"
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                feedbackType === 'issue'
                  ? 'e.g., Broken AC in Lab 3, Flickering lights in Hall B'
                  : 'e.g., Request for Campus Car Show, Breast Cancer Awareness Walkathon'
              }
              className={`w-full text-xs p-2.5 rounded-lg border bg-white text-purple-950 focus:outline-none focus:ring-2 transition-all ${
                errors.title
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-purple-200 focus:border-purple-600 focus:ring-purple-200'
              }`}
            />
            {errors.title && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.title}</p>
            )}
          </div>

          {/* 3 & 4. Category & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-purple-950/70 block">
                3. Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full text-xs p-2.5 rounded-lg border border-purple-200 bg-white text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-600"
              >
                <option value="facilities">Facilities & Infrastructure</option>
                <option value="technology">Technology & IT</option>
                <option value="academics">Academics & Schedule</option>
                <option value="student-life">Student Life & Events</option>
                <option value="safety">Safety & Security</option>
              </select>
            </div>

            {/* Urgency Level */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-purple-950/70 block">
                4. Urgency Level *
              </label>
              <div className="flex items-center gap-1.5 pt-0.5">
                {(['low', 'medium', 'high'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setUrgency(lvl)}
                    className={`flex-1 py-2 px-2 text-xs rounded-lg font-semibold capitalize border transition-all ${
                      urgency === lvl
                        ? lvl === 'high'
                          ? 'bg-pink-50 border-pink-400 text-pink-700 shadow-xs'
                          : 'bg-purple-100/80 border-purple-400 text-purple-900 shadow-xs'
                        : 'bg-white border-purple-100 text-purple-700/80 hover:bg-purple-50'
                    }`}
                  >
                    {lvl === 'high' ? 'High / Urgent' : lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Target Location */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-purple-950/70 block">
              5. Target Location / Campus Department *
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Engineering Block B, Room 4, or Main Quad Walkway"
                className={`w-full text-xs pl-8 pr-3 py-2 rounded-lg border bg-white text-purple-950 focus:outline-none focus:ring-2 transition-all ${
                  errors.location
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-purple-200 focus:border-purple-600 focus:ring-purple-200'
                }`}
              />
            </div>
            {errors.location && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.location}</p>
            )}
          </div>

          {/* 6. Detailed Description */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-purple-950/70 block">
              6. Detailed Description *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                feedbackType === 'issue'
                  ? 'Describe what happened, exact steps to reproduce, device models affected, or safety concerns...'
                  : 'Describe your proposal in detail: purpose, expected student attendance, required campus resources, timeline...'
              }
              className={`w-full text-xs p-2.5 rounded-lg border bg-white text-purple-950 focus:outline-none focus:ring-2 transition-all ${
                errors.description
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-purple-200 focus:border-purple-600 focus:ring-purple-200'
              }`}
            />
            {errors.description && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.description}</p>
            )}
          </div>

          {/* Fix #3 & #11: Evidence Photo Uploads with validation and compression */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-purple-950/70 block">
                7. Photo Evidence / Attachments (Optional, max 3)
              </label>
              <span className="text-[10px] text-purple-500 font-mono">
                {photos.length}/3 photos
              </span>
            </div>

            {uploadError && (
              <p className="text-[11px] text-rose-600 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200">
                {uploadError}
              </p>
            )}

            {/* Photo Thumbnails */}
            {photos.length > 0 && (
              <div className="flex items-center gap-2.5 flex-wrap">
                {photos.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-purple-200 shadow-2xs group">
                    <img src={src} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                      title="Remove photo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photos.length < 3 && (
              <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50 transition-colors cursor-pointer text-purple-900">
                <UploadCloud className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold">
                  {isCompressing ? 'Compressing photo for storage...' : 'Upload Evidence Photo (JPG, PNG, WebP)'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handlePhotoUpload}
                  disabled={isCompressing}
                  className="hidden"
                />
              </label>
            )}
            <p className="text-[10px] text-purple-700/60">
              Photos are automatically optimized and downscaled to avoid browser storage limits.
            </p>
          </div>

          {/* 8. Anonymous Submission Toggle */}
          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200/80 flex items-start gap-3">
            <input
              type="checkbox"
              id="anon-toggle"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-purple-600 rounded border-purple-300 focus:ring-purple-500 cursor-pointer"
            />
            <div className="flex-1">
              <label htmlFor="anon-toggle" className="font-semibold text-xs text-purple-950 cursor-pointer flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-pink-600" />
                <span>Submit Anonymously</span>
              </label>
              <p className="text-[11px] text-purple-800/70 leading-snug mt-0.5">
                Your name, student ID, and email address will be completely hidden from public listings and other students. Administrators can still respond directly within this thread.
              </p>
            </div>
          </div>
        </form>

        {/* Modal Window Footer */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#faf8fc] border-t border-purple-100 flex items-center justify-between select-none shrink-0">
          <div className="text-[11px] text-purple-600 flex items-center gap-1.5">
            <Ribbon className="w-3.5 h-3.5 text-pink-500" />
            <span className="hidden xs:inline">Honoring BCA Month</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 sm:px-4 py-2 text-xs font-medium text-purple-800 hover:text-purple-950 hover:bg-purple-100/60 rounded-lg transition-colors cursor-pointer touch-manipulation min-h-[36px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 sm:px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 rounded-lg shadow-xs hover:shadow transition-all border border-purple-800 active:scale-[0.98] cursor-pointer touch-manipulation min-h-[36px]"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
