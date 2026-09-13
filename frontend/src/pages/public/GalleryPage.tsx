import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { designsApi } from '../../api/designs';
import { Design } from '../../types';
import { DesignCard } from '../../components/customer/DesignCard';
import { CardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Sparkles, Search, Volume2, VolumeX } from 'lucide-react';
import { getDesignVideo } from '../../config/designVideos';

const PRESET_DESIGN_LABELS: Record<string, string> = {
  ALL: 'All Designs',
  BRIDAL: 'Bridal Couture',
  BLOUSE: 'Designer Blouse',
  LEHENGA: 'Lehenga Choli',
  KURTI: 'Kurtis',
  GOWN: 'Gowns',
  EMBROIDERY: 'Embroidery Work',
  DESIGNER: 'Designer Wear',
  SUITS: 'Salwar Suits',
  ANARKALI: 'Anarkali Sets',
  WESTERN: 'Western Wear',
};

export const GalleryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = (searchParams.get('category') || 'ALL').toUpperCase();

  const [allDesigns, setAllDesigns] = useState<Design[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalPlaying, setModalPlaying] = useState(true);
  const [modalAudioMuted, setModalAudioMuted] = useState(true);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);

  // Fetch all active designs once
  const fetchAllDesigns = async () => {
    setIsLoading(true);
    try {
      const res = await designsApi.list({ limit: 100 });
      setAllDesigns(res?.items || []);
    } catch (err) {
      console.error('Failed to load all designs:', err);
      setAllDesigns([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDesigns();
  }, []);

  // Compute dynamic category tabs from database designs
  const categories = useMemo(() => {
    const dbCats = (allDesigns || [])
      .map((d) => (d?.category ? d.category.toUpperCase().trim() : ''))
      .filter(Boolean);
    const unique = Array.from(new Set(['ALL', ...dbCats]));

    return unique.map((key) => ({
      key,
      label: PRESET_DESIGN_LABELS[key] || (key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, ' ')),
    }));
  }, [allDesigns]);

  // Instant filtering on allDesigns by category and search query
  const displayedDesigns = useMemo(() => {
    let list = allDesigns || [];
    if (activeCategory !== 'ALL') {
      list = list.filter((d) => d?.category && d.category.toUpperCase().trim() === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (d) =>
          d?.title?.toLowerCase().includes(q) ||
          (d?.description && d.description.toLowerCase().includes(q)) ||
          (d?.tags && Array.isArray(d.tags) && d.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [allDesigns, activeCategory, searchQuery]);

  const handleCategorySelect = (catKey: string) => {
    if (catKey === 'ALL') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catKey });
    }
  };

  const toggleModalVideo = () => {
    if (!modalVideoRef.current) return;
    if (modalPlaying) {
      modalVideoRef.current.pause();
      setModalPlaying(false);
    } else {
      modalVideoRef.current.play().then(() => {
        setModalPlaying(true);
      }).catch(() => {});
    }
  };

  return (
    <div className="space-y-6 pb-12 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Header */}
      <section className="pt-8 pb-2 text-center max-w-xl mx-auto px-4 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
          Portfolio
        </span>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white">
          Design Gallery
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Handcrafted patterns, boutique embroidery, and custom stitching inspiration.
        </p>
      </section>

      {/* Category Pills & Search */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
        {/* Category Pills - Automatically Shows Any New Category */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
          {(categories || []).map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => handleCategorySelect(cat.key)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-black dark:hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto relative">
          <Input
            placeholder="Search designs by title or embroidery tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-stone-400" />}
            className="w-full"
          />
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (displayedDesigns || []).length === 0 ? (
          <EmptyState
            icon={<Sparkles className="w-6 h-6 text-black dark:text-white" />}
            title="No Designs Found"
            description="Try changing the category or search keywords."
            actionLabel="All Designs"
            onAction={() => {
              setSearchQuery('');
              handleCategorySelect('ALL');
            }}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {(displayedDesigns || []).map((design) => (
              <DesignCard
                key={design.id}
                design={design}
                onOpenModal={() => setSelectedDesign(design)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {selectedDesign && (
        <Modal
          isOpen={!!selectedDesign}
          onClose={() => setSelectedDesign(null)}
          title={selectedDesign.title}
          subtitle={`Category: ${selectedDesign.category}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            {/* Modal Video Player with tap to pause */}
            <div
              onClick={toggleModalVideo}
              className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-stone-950 shadow-inner relative cursor-pointer group select-none"
              title={modalPlaying ? 'Tap to pause' : 'Tap to play'}
            >
              <video
                ref={(el) => {
                  modalVideoRef.current = el;
                  if (el) {
                    el.defaultMuted = true;
                    el.muted = modalAudioMuted;
                    el.play().catch(() => {});
                  }
                }}
                src={selectedDesign.image && (selectedDesign.image.endsWith('.mp4') || selectedDesign.image.includes('/videos/')) ? selectedDesign.image : getDesignVideo(selectedDesign.category)}
                autoPlay
                loop
                muted={modalAudioMuted}
                playsInline
                className="w-full h-full object-cover"
                onCanPlay={(e) => {
                  e.currentTarget.muted = modalAudioMuted;
                  e.currentTarget.play().catch(() => {});
                }}
                onEnded={() => {
                  if (modalVideoRef.current) {
                    modalVideoRef.current.currentTime = 0;
                    modalVideoRef.current.play().catch(() => {});
                  }
                }}
              />

              {/* Sound / Audio Toggle Button */}
              {selectedDesign.allow_audio !== false && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (modalVideoRef.current) {
                      const nextMuted = !modalAudioMuted;
                      modalVideoRef.current.muted = nextMuted;
                      setModalAudioMuted(nextMuted);
                    }
                  }}
                  className={`absolute bottom-3 right-3 z-20 px-2.5 py-1.5 rounded-xl shadow-md backdrop-blur-xs flex items-center gap-1.5 text-xs font-semibold transition-transform active:scale-95 cursor-pointer ${
                    modalAudioMuted
                      ? 'bg-black/75 text-white hover:bg-black'
                      : 'bg-emerald-600 text-white animate-pulse'
                  }`}
                  title={modalAudioMuted ? 'Sound is OFF (Click to Unmute)' : 'Sound is ON (Click to Mute)'}
                >
                  {modalAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{modalAudioMuted ? 'Turn Sound ON' : 'Turn Sound OFF'}</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                {selectedDesign.description || 'Custom tailored with delicate handcrafting and precision fit.'}
              </p>

              {selectedDesign.price && (
                <div className="text-xs text-stone-500 dark:text-stone-400">
                  Estimated base price: <strong className="text-black dark:text-white font-serif text-base">₹{selectedDesign.price.toLocaleString('en-IN')}</strong>
                </div>
              )}

              {selectedDesign.tags && Array.isArray(selectedDesign.tags) && selectedDesign.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {selectedDesign.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[10px] font-semibold text-stone-700 dark:text-stone-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedDesign(null)}>
                Close
              </Button>
              <a href={`/custom-requests/create?design_id=${selectedDesign.id}`}>
                <Button variant="primary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                  Request Custom Stitching
                </Button>
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
