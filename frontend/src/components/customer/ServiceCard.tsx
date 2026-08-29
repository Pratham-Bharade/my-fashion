import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Service } from '../../types';
import { Clock, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../common/Button';
import { getServiceVideo } from '../../config/serviceVideos';
import { isVideoMedia } from '../common/ImageUpload';

export const ServiceCard: React.FC<{ service: Service }> = ({ service }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [hasVideoError, setHasVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isCustomVideo = isVideoMedia(service.image);
  const videoUrl = isCustomVideo && service.image ? service.image : getServiceVideo(service.category);

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

  // Toggle play/pause on tap / click
  const handleClick = (e: React.MouseEvent) => {
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
      
      {/* Video Media Container */}
      <div
        onClick={handleClick}
        className="relative w-full aspect-[3/4] min-h-[190px] overflow-hidden bg-stone-950 cursor-pointer select-none"
        title={isPlaying ? 'Tap to pause' : 'Tap to play'}
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

        {/* Fallback Image */}
        <img
          src={service.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80'}
          alt={service.name}
          className={`w-full h-full object-cover object-top absolute inset-0 z-0 ${hasVideoError ? 'opacity-100' : 'opacity-40'}`}
          loading="lazy"
        />

        {/* Top Category Badge */}
        <div className="absolute top-2.5 left-2.5 z-20">
          <span className="bg-black/85 text-white px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider backdrop-blur-xs">
            {service.category}
          </span>
        </div>

        {/* Sound / Audio Toggle Button */}
        {!hasVideoError && service.allow_audio !== false && (
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
          <h3 className="font-serif font-bold text-sm text-black dark:text-white line-clamp-1 group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors">
            {service.name}
          </h3>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">
            {service.description || 'Custom tailored with premium lining and comfort fit.'}
          </p>
        </div>

        {/* Pricing & Timing */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-semibold text-stone-400 dark:text-stone-500 block leading-none">
              From
            </span>
            <span className="text-sm font-serif font-bold text-black dark:text-white">
              ₹{service.price.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-700">
            <Clock className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
            <span>~{service.estimated_days}d</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <Link to={`/services/${service.id}`} className="w-full">
            <Button variant="outline" size="sm" fullWidth className="text-xs h-8 px-2">
              Details
            </Button>
          </Link>
          <Link to={`/appointments/book?service_id=${service.id}`} className="w-full">
            <Button variant="primary" size="sm" fullWidth className="text-xs h-8 px-2">
              Book
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
