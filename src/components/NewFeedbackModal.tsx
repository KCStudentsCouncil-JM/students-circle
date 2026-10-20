import React, { useState, useMemo } from 'react';
import { 
  FeedbackType, 
  Category, 
  UrgencyLevel, 
  FeedbackReport,
  UserProfile
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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const potentialDuplicates = useMemo(() => {
    return findPotentialDuplicates(title, description, existingReports);
  }, [title, description, existingReports]);

  if (!isOpen) return null;

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
        const typeCheck = isValidImageFile(file);
        if (!typeCheck.valid) {
          setUploadError(typeCheck.error || 'Invalid file type.');
          setIsCompressing(false);
          return;
        }
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

  const resetForm = () => {
    setTitle('');
    setLocation('');
    setDescription('');
    setPhotos([]);
    setErrors({});
    setUploadError(null);
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
    // Changed items-center to items-end on mobile for a native bottom-sheet feel
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-purple-950/60 backdrop-blur-sm select-none">
      <div 
        className="bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl border-t sm:border border-purple-200 w-full max-w-2xl max-h-[92dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-purple-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-700 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 text-pink-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-purple-950 tracking-tight">
                New Feedback / Initiative
              </h2>
              <p className="text-[11px] text-purple-700/80">
                File a report or pitch a new idea
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 text-sm overscroll-contain">
          
          {potentialDuplicates.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-2 animate-in slide-in-from-top-1">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Possible Duplicate Report Detected</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                A similar report is already active. You can endorse it instead:
              </p>
              <div className="space-y-1.5 pt-1">
                {potentialDuplicates.slice(0, 2).map((dup) => (
                  <div key={dup.id} className="bg-white p-2 rounded-lg border border-amber-200 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-purple-950 truncate text-[11px]">
                        #{dup.id} · {dup.title}
                      </div>
                    </div>
                    {onSelectExistingReport && (
                      <button
                        type="button"
                        onClick={() => { onSelectExistingReport(dup.id); onClose(); }}
                        className="text-[10px] font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 px-2.5 py-1 rounded-md border border-pink-200 shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <ThumbsUp className="w-3 h-3 text-pink-600" />
                        <span>Endorse</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 1. Feedback Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-purple-950/70 block">1. Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${feedbackType === 'issue' ? 'border-purple-600 bg-purple-50/80 shadow-xs' : 'border-purple-100 bg-white hover:bg-purple-50/30'}`}>
                <input type="radio" name="feedbackType" value="issue" checked={feedbackType === 'issue'} onChange={() => setFeedbackType('issue')} className="mt-0.5 w-4 h-4 text-purple-600 focus:ring-purple-500 cursor-pointer" />
                <div>
                  <div className="font-bold text-sm text-purple-950 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-purple-600" /> Report Issue
                  </div>
                  <p className="text-xs text-purple-800/70 mt-0.5 leading-snug">Broken facilities, Wi-Fi drops, hazards.</p>
                </div>
              </label>
              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${feedbackType === 'initiative' ? 'border-purple-600 bg-purple-50/80 shadow-xs' : 'border-purple-100 bg-white hover:bg-purple-50/30'}`}>
                <input type="radio" name="feedbackType" value="initiative" checked={feedbackType === 'initiative'} onChange={() => setFeedbackType('initiative')} className="mt-0.5 w-4 h-4 text-purple-600 focus:ring-purple-500 cursor-pointer" />
                <div>
                  <div className="font-bold text-sm text-purple-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-pink-600" /> Suggest Initiative
                  </div>
                  <p className="text-xs text-purple-800/70 mt-0.5 leading-snug">Propose events, clubs, or improvements.</p>
                </div>
              </label>
            </div>
          </div>

          {/* 2. Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-purple-950/70 block">2. Title *</label>
            {/* Changed text-xs to text-base on mobile to prevent iOS zoom */}
            <input
              type="text"
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={feedbackType === 'issue' ? 'e.g., Broken AC in Lab 3' : 'e.g., Request for Campus Car Show'}
              className={`w-full text-base sm:text-sm p-3 rounded-xl border bg-white text-purple-950 focus:outline-none focus:ring-2 transition-all ${errors.title ? 'border-rose-400 focus:ring-rose-200' : 'border-purple-200 focus:border-purple-600 focus:ring-purple-200'}`}
            />
            {errors.title && <p className="text-[11px] text-rose-600 font-medium">{errors.title}</p>}
          </div>

          {/* 3 & 4. Category & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-950/70 block">3. Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full text-base sm:text-sm p-3 rounded-xl border border-purple-200 bg-white text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-600"
              >
                <option value="facilities">Facilities</option>
                <option value="technology">Technology</option>
                <option value="academics">Academics</option>
                <option value="student-life">Student Life</option>
                <option value="safety">Safety</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-950/70 block">4. Urgency *</label>
              <div className="flex items-center gap-1.5 pt-0.5">
                {(['low', 'medium', 'high'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setUrgency(lvl)}
                    className={`flex-1 py-2.5 px-2 text-sm rounded-xl font-semibold capitalize border transition-all ${urgency === lvl ? lvl === 'high' ? 'bg-pink-50 border-pink-400 text-pink-700 shadow-xs' : 'bg-purple-100/80 border-purple-400 text-purple-900 shadow-xs' : 'bg-white border-purple-100 text-purple-700/80 hover:bg-purple-50'}`}
                  >
                    {lvl === 'high' ? 'High' : lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Location */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-purple-950/70 block">5. Location *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Engineering Block B, Room 4"
                className={`w-full text-base sm:text-sm pl-9 pr-3 py-3 rounded-xl border bg-white text-purple-950 focus:outline-none focus:ring-2 transition-all ${errors.location ? 'border-rose-400 focus:ring-rose-200' : 'border-purple-200 focus:border-purple-600 focus:ring-purple-200'}`}
              />
            </div>
            {errors.location && <p className="text-[11px] text-rose-600 font-medium">{errors.location}</p>}
          </div>

          {/* 6. Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-purple-950/70 block">6. Description *</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, steps to reproduce, or your proposal..."
              className={`w-full text-base sm:text-sm p-3 rounded-xl border bg-white text-purple-950 focus:outline-none focus:ring-2 transition-all ${errors.description ? 'border-rose-400 focus:ring-rose-200' : 'border-purple-200 focus:border-purple-600 focus:ring-purple-200'}`}
            />
            {errors.description && <p className="text-[11px] text-rose-600 font-medium">{errors.description}</p>}
          </div>

          {/* 7. Photos */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-purple-950/70 block">7. Photos (Optional)</label>
            {uploadError && <p className="text-[11px] text-rose-600 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200">{uploadError}</p>}
            
            {photos.length > 0 && (
              <div className="flex items-center gap-2.5 flex-wrap">
                {photos.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-purple-200 shadow-2xs group">
                    <img src={src} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setPhotos(p => p.filter((_, i) => i !== idx))} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-xs">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photos.length < 3 && (
              <label className="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50 transition-colors cursor-pointer text-purple-900">
                <UploadCloud className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold">{isCompressing ? 'Compressing...' : 'Upload Photo'}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotoUpload} disabled={isCompressing} className="hidden" />
              </label>
            )}
          </div>

          {/* 8. Anonymous */}
          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200/80 flex items-start gap-3">
            <input type="checkbox" id="anon-toggle" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="mt-1 w-5 h-5 text-purple-600 rounded border-purple-300 focus:ring-purple-500 cursor-pointer" />
            <div className="flex-1">
              <label htmlFor="anon-toggle" className="font-bold text-sm text-purple-950 cursor-pointer flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-pink-600" /> Submit Anonymously
              </label>
              <p className="text-xs text-purple-800/70 leading-snug mt-0.5">Your name and email will be hidden from public listings.</p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 bg-white border-t border-purple-100 flex items-center justify-between shrink-0 pb-safe">
          <div className="text-xs text-purple-600 flex items-center gap-1.5 hidden sm:flex">
            <Ribbon className="w-4 h-4 text-pink-500" /> BCA Month
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button type="button" onClick={onClose} className="flex-1 sm:flex-none px-4 py-3 text-sm font-semibold text-purple-800 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} className="flex-[2] sm:flex-none px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer">
              Submit Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};