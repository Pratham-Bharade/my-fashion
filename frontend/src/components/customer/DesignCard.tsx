import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Design } from '../../types';
import { Sparkles, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../common/Button';
import { getDesignVideo } from '../../config/designVideos';

interface DesignCardProps {
  design: Design;
  onOpenModal?: (design: Design) => void;
}

export const DesignCard: React.FC<DesignCardProps> = ({ design, onOpenModal }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [hasVideoError, setHasVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const videoUrl = design.image.endsWith('.mp4') || design.image.includes('/videos/')
    ? design.image
    : getDesignVideo(design.category);

  // Guarantee auto-play on mount
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.defaultMuted = true;
      video.muted = isAudioMuted;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    }
  }, [videoUrl, isAudioMuted]);

  // Toggle play/pause on tap/click
  const handleMediaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  const toggleAudio = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!videoRef.current) return;
    const nextMuted = !isAudioMuted;
    videoRef.current.muted = nextMuted;
    setIsAudioMuted(nextMuted);
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 hover:border-black dark:hover:border-white shadow-2xs hover:shadow-sm transition-all group flex flex-col h-full">
      
      {/* Video / Image Media Container */}
      <div
        onClick={handleMediaClick}
        className="relative w-full aspect-[3/4] min-h-[190px] overflow-hidden bg-stone-950 cursor-pointer select-none"
        title={isPlaying ? 'Tap to pause video' : 'Tap to play video'}
      >
        {/* Background Looping Video Element */}
        {!hasVideoError && (
          <video
            ref={(el) => {
              videoRef.current = el;
              if (el) {
                el.defaultMuted = true;
                el.muted = isAudioMuted;
              }
            }}
            src={videoUrl}
            autoPlay
            loop
            muted={isAudioMuted}
            playsInline
            preload="auto"
            className="w-full h-full object-cover absolute inset-0 z-10"
            onCanPlay={(e) => {
              e.currentTarget.muted = isAudioMuted;
              e.currentTarget.play().catch(() => {});
            }}
            onError={() => setHasVideoError(true)}
            onEnded={() => {
              if (videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play().catch(() => {});
              }
            }}
          />
        )}

        {/* Fallback Poster Image */}
        <img
          src={design.image}
          alt={design.title}
          className={`w-full h-full object-cover object-top absolute inset-0 z-0 ${hasVideoError ? 'opacity-100' : 'opacity-40'}`}
          loading="lazy"
        />

        {/* Top Category Badge */}
        <div className="absolute top-2.5 left-2.5 z-20">
          <span className="bg-black/85 text-white px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider backdrop-blur-xs">
            {design.category}
          </span>
        </div>

        {/* Sound / Audio Toggle Button */}
        {!hasVideoError && design.allow_audio !== false && (
          <button
            type="button"
            onClick={toggleAudio}
            className={`absolute bottom-2.5 right-2.5 z-20 p-1.5 rounded-full shadow-sm backdrop-blur-xs transition-transform active:scale-90 cursor-pointer ${
              isAudioMuted
                ? 'bg-black/75 text-stone-300 hover:text-white hover:bg-black'
                : 'bg-emerald-600 text-white animate-pulse'
            }`}
            title={isAudioMuted ? 'Sound is OFF (Click to Unmute)' : 'Sound is ON (Click to Mute)'}
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1">
          <h3
            onClick={() => onOpenModal?.(design)}
            className="font-serif font-bold text-sm text-black dark:text-white line-clamp-1 hover:text-stone-700 dark:group-hover:text-stone-300 cursor-pointer transition-colors"
          >
            {design.title}
          </h3>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">
            {design.description || 'Exclusive handcrafted bespoke design from Vandana Creations.'}
          </p>

          {/* Tags */}
          {design.tags && design.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {design.tags.slice(0, 2).map((t, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[9px] font-medium text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Action */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-1.5">
          {design.price ? (
            <div>
              <span className="text-[9px] uppercase font-semibold text-stone-400 dark:text-stone-500 block leading-none">Est.</span>
              <span className="text-sm font-serif font-bold text-black dark:text-white">
                ₹{design.price.toLocaleString('en-IN')}
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500">Custom Quote</span>
          )}

          <Link to={`/custom-requests/create?design_id=${design.id}`}>
            <Button variant="primary" size="sm" className="text-xs h-8 px-2.5" leftIcon={<Sparkles className="w-3 h-3" />}>
              Request
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
