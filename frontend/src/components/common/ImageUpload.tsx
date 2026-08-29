import React, { useState, useRef } from 'react';
import { Camera, UploadCloud, X, Loader2, Video as VideoIcon, Film, Link as LinkIcon, Check, Volume2, VolumeX } from 'lucide-react';
import { uploadApi } from '../../api/contact';

export const PRESET_STUDIO_VIDEOS = [
  { label: 'Designer Blouse Crafting', url: '/videos/services/blouse-stitching.mp4', category: 'BLOUSE' },
  { label: 'Saree & Lehenga Tailoring', url: '/videos/services/saree-lehenga.mp4', category: 'TRADITIONAL' },
  { label: 'Kurtis & Suits Stitching', url: '/videos/services/kurti-stitching.mp4', category: 'KURTIS' },
  { label: 'Custom Gown & Indo-Western', url: '/videos/services/gown-dress.mp4', category: 'DRESSES' },
  { label: 'Precision Alterations & Fitting', url: '/videos/services/alterations.mp4', category: 'ALTERATIONS' },
];

export const isVideoMedia = (url?: string | null): boolean => {
  if (!url) return false;
  const clean = url.toLowerCase();
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.ogg') ||
    clean.includes('/videos/') ||
    clean.includes('video')
  );
};

interface ImageUploadProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  helperText?: string;
  className?: string;
  allowVideo?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  value,
  onChange,
  folder = 'general',
  helperText = 'Upload Video (MP4/WebM) or Image (JPG/PNG/WEBP) up to 100MB',
  className = '',
  allowVideo = true,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  const isVideo = isVideoMedia(preview);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    // Local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      const res = await uploadApi.uploadImage(file, folder);
      onChange(res.data.url);
      setPreview(res.data.url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload media. Please try again.');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectPreset = (url: string) => {
    setPreview(url);
    onChange(url);
    setShowPresets(false);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    setPreview(customUrl.trim());
    onChange(customUrl.trim());
    setShowUrlInput(false);
    setCustomUrl('');
  };

  const toggleAudio = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoPreviewRef.current) {
      videoPreviewRef.current.muted = !isAudioMuted;
      setIsAudioMuted(!isAudioMuted);
    }
  };

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        {label && (
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
            {label}
          </span>
        )}
        {allowVideo && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setShowPresets(!showPresets); setShowUrlInput(false); }}
              className="text-[11px] font-bold text-black dark:text-white underline hover:opacity-80 flex items-center gap-1 cursor-pointer"
            >
              <Film className="w-3 h-3" />
              Preset Studio Videos
            </button>
            <button
              type="button"
              onClick={() => { setShowUrlInput(!showUrlInput); setShowPresets(false); }}
              className="text-[11px] font-semibold text-stone-500 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <LinkIcon className="w-3 h-3" />
              URL
            </button>
          </div>
        )}
      </div>

      {/* Preset Videos Selector Dropdown */}
      {showPresets && (
        <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-2xl border border-stone-300 dark:border-stone-700 space-y-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
            Choose Haute Couture Video Showcase:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {PRESET_STUDIO_VIDEOS.map((p) => {
              const isSelected = preview === p.url;
              return (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => handleSelectPreset(p.url)}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-between text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 hover:border-black dark:hover:border-white'
                  }`}
                >
                  <span className="truncate">{p.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Direct URL Input */}
      {showUrlInput && (
        <form onSubmit={handleApplyCustomUrl} className="flex gap-2 mb-1">
          <input
            type="text"
            placeholder="Paste video or image URL (e.g. /videos/services/blouse-stitching.mp4)..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs focus:outline-none text-stone-900 dark:text-stone-100"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold"
          >
            Apply
          </button>
        </form>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={allowVideo ? "image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,video/*" : "image/jpeg,image/png,image/webp"}
        className="hidden"
      />

      {preview ? (
        <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-950 group">
          {isVideo ? (
            <video
              ref={videoPreviewRef}
              src={preview}
              autoPlay
              loop
              muted={isAudioMuted}
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={preview}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
            />
          )}

          {/* Badge indicating media type & Audio Control */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs flex items-center gap-1">
              {isVideo ? <VideoIcon className="w-3 h-3 text-emerald-400" /> : <Camera className="w-3 h-3 text-blue-400" />}
              {isVideo ? 'Cover Video' : 'Cover Image'}
            </span>

            {isVideo && (
              <button
                type="button"
                onClick={toggleAudio}
                className={`p-1 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-sm backdrop-blur-xs transition-colors cursor-pointer ${
                  isAudioMuted
                    ? 'bg-black/80 text-stone-300 hover:text-white'
                    : 'bg-emerald-600 text-white animate-pulse'
                }`}
                title={isAudioMuted ? 'Unmute video audio' : 'Mute audio'}
              >
                {isAudioMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                <span>{isAudioMuted ? 'Muted' : 'Sound ON'}</span>
              </button>
            )}
          </div>

          {isUploading && (
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2 z-20">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
              <span className="text-xs font-medium">Uploading video/image media...</span>
            </div>
          )}

          {!isUploading && (
            <div className="absolute top-3 right-3 flex gap-2 z-10">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl bg-stone-900/80 text-white hover:bg-stone-900 transition-colors shadow-md backdrop-blur-xs cursor-pointer"
                title="Change Media"
              >
                <Camera className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 rounded-xl bg-rose-600/90 text-white hover:bg-rose-700 transition-colors shadow-md backdrop-blur-xs cursor-pointer"
                title="Remove Media"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`w-full h-40 sm:h-44 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer transition-all ${
            error
              ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20'
              : 'border-stone-300 dark:border-stone-700 hover:border-black dark:hover:border-white bg-stone-50/80 dark:bg-stone-900/40'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-stone-800 shadow-2xs flex items-center justify-center text-black dark:text-white mb-2.5">
            {allowVideo ? <Film className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
          </div>
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 text-center">
            {allowVideo ? 'Click to upload video (MP4/WebM) or cover image' : 'Tap to upload design photo'}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{helperText}</p>
        </div>
      )}

      {error && <span className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</span>}
    </div>
  );
};
