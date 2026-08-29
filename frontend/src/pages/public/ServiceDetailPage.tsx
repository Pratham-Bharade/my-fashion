import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { servicesApi } from '../../api/services';
import { Service } from '../../types';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { Clock, Calendar, ShieldCheck, Sparkles, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { getServiceVideo } from '../../config/serviceVideos';
import { isVideoMedia } from '../../components/common/ImageUpload';

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [hasVideoError, setHasVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await servicesApi.getById(id);
        setService(res.data);
      } catch (err) {
        console.error('Failed to load service detail:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const isCustomVideo = isVideoMedia(service?.image);
  const videoUrl = isCustomVideo && service?.image ? service.image : getServiceVideo(service?.category);

  // Guarantee auto-play infinite loop
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.defaultMuted = true;
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    }
  }, [service]);

  // Tap to pause/play directly without icons
  const togglePlay = () => {
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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-64 sm:h-80 w-full rounded-2xl" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 space-y-3">
        <h2 className="text-lg font-bold font-serif text-black dark:text-white">Service Not Found</h2>
        <p className="text-xs text-stone-500 dark:text-stone-400">The requested tailoring service is not available.</p>
        <Link to="/services">
          <Button variant="primary" size="sm">Return to Services</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Back button */}
      <Link to="/services" className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-black dark:hover:text-white transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Services
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Service Video Media Container - Tap to Stop/Play with No Overlay Icons */}
        <div className="md:col-span-5">
          <div
            onClick={togglePlay}
            className="aspect-[4/3] md:aspect-[4/5] min-h-[240px] rounded-2xl overflow-hidden shadow-2xs border border-stone-200 dark:border-stone-800 bg-stone-950 relative cursor-pointer group select-none"
            title={isPlaying ? 'Tap to pause video' : 'Tap to play video'}
          >
            {/* Background Looping Video */}
            {!hasVideoError && (
              <video
                ref={(el) => {
                  videoRef.current = el;
                  if (el) {
                    el.defaultMuted = true;
                    el.muted = true;
                  }
                }}
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-cover absolute inset-0 z-10"
                onCanPlay={(e) => {
                  e.currentTarget.muted = true;
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

            {/* Poster Fallback Image */}
            <img
              src={service.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80'}
              alt={service.name}
              className={`w-full h-full object-cover object-top absolute inset-0 z-0 ${hasVideoError ? 'opacity-100' : 'opacity-40'}`}
            />

            {/* Sound / Audio Toggle Button */}
            {!hasVideoError && service.allow_audio !== false && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (videoRef.current) {
                    const nextMuted = !isAudioMuted;
                    videoRef.current.muted = nextMuted;
                    setIsAudioMuted(nextMuted);
                  }
                }}
                className={`absolute bottom-3 right-3 z-20 px-2.5 py-1.5 rounded-xl shadow-md backdrop-blur-xs flex items-center gap-1.5 text-xs font-semibold transition-transform active:scale-95 cursor-pointer ${
                  isAudioMuted
                    ? 'bg-black/75 text-white hover:bg-black'
                    : 'bg-emerald-600 text-white animate-pulse'
                }`}
                title={isAudioMuted ? 'Sound is OFF (Click to Unmute)' : 'Sound is ON (Click to Mute)'}
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isAudioMuted ? 'Turn Sound ON' : 'Turn Sound OFF'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Info & Booking Card */}
        <div className="md:col-span-7 space-y-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-[10px] uppercase tracking-wider border border-stone-200 dark:border-stone-700">
              {service.category}
            </span>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-black dark:text-white">
              {service.name}
            </h1>
          </div>

          {/* Pricing & Duration Bar */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-400 dark:text-stone-500 block leading-none">Starting Rate</span>
              <span className="font-serif font-bold text-xl text-black dark:text-white">
                ₹{service.price.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700">
              <Clock className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              <span>~{service.estimated_days} Days Delivery</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-xs text-black dark:text-white uppercase tracking-wider">What's Included:</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              {service.description || 'Custom tailored with premium canvas lining, precision armhole and neck curves, 2-inch alteration margins, and fine thread overlock finishing.'}
            </p>
          </div>

          {/* Inclusions list */}
          <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300 pt-2 border-t border-stone-100 dark:border-stone-800">
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
              <span>Individual body pattern drafted by Master Tailor</span>
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
              <span>Pre-washed cotton canvas interlining included</span>
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
              <span>2-inch internal seam margin for future alterations</span>
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
              <span>Free adjustment fitting within 30 days</span>
            </li>
          </ul>

          {/* Booking CTAs */}
          <div className="space-y-2 pt-2">
            <Link to={`/appointments/book?service_id=${service.id}`} className="block">
              <Button variant="primary" size="md" fullWidth leftIcon={<Calendar className="w-4 h-4" />}>
                Book Consultation & Fitting Slot
              </Button>
            </Link>
            <Link to={`/custom-requests/create?service_id=${service.id}`} className="block">
              <Button variant="outline" size="sm" fullWidth leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                Request Custom Stitching Quote
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
