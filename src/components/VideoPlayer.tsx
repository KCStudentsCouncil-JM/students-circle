import React, { useEffect, useState } from 'react';
import { AlertTriangle, Play } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  className?: string;
  thumbnail?: boolean;
  title?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  className = '',
  thumbnail = false,
  title,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);

    if (!src) {
      setBlobUrl(null);
      setIsLoading(false);
      return;
    }

    // Regular URLs (http, blob, youtube, etc.) can be used directly
    if (!src.startsWith('data:')) {
      setBlobUrl(src);
      setIsLoading(false);
      return;
    }

    // Convert base64 data URL → Blob URL for reliable playback
    let url: string | null = null;
    try {
      const commaIdx = src.indexOf(',');
      const header = src.slice(0, commaIdx);
      const base64Data = src.slice(commaIdx + 1);
      const mimeMatch = header.match(/data:([^;]+)/);
      const mime = mimeMatch ? mimeMatch[1] : 'video/mp4';

      const binary = atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: mime });
      url = URL.createObjectURL(blob);
      setBlobUrl(url);
    } catch (e) {
      console.error('Failed to convert video data URL to blob URL:', e);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [src]);

  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-4 border border-rose-500/30 rounded-xl ${className}`}>
        <AlertTriangle className="w-6 h-6 mb-1 text-rose-500" />
        <span className="text-xs text-center font-semibold text-rose-400">Video Format Unsupported</span>
        <span className="text-[10px] text-center mt-1">Please upload an MP4 or WebM file.</span>
      </div>
    );
  }

  if (isLoading || !blobUrl) {
    return (
      <div className={`flex items-center justify-center bg-slate-900 text-slate-400 ${className}`}>
        <Play className="w-6 h-6 opacity-50 animate-pulse" />
      </div>
    );
  }

  if (thumbnail) {
    return (
      <video
        key={blobUrl}
        src={blobUrl}
        preload="metadata"
        muted
        playsInline
        title={title}
        className={className}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <video
      key={blobUrl}
      src={blobUrl}
      controls
      preload="metadata"
      playsInline
      title={title}
      className={className}
      onError={() => setHasError(true)}
    />
  );
};