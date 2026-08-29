import React, { useState, useEffect, useMemo } from 'react';
import { servicesApi } from '../../api/services';
import { designsApi } from '../../api/designs';
import { Service } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ImageUpload, isVideoMedia } from '../../components/common/ImageUpload';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import { getServiceVideo } from '../../config/serviceVideos';
import { Scissors, Plus, Edit2, Trash2, Clock, Film, Video as VideoIcon, PlusCircle, Volume2, VolumeX } from 'lucide-react';

const DEFAULT_PRESET_CATEGORIES = [
  'BLOUSE',
  'TRADITIONAL',
  'KURTIS',
  'DRESSES',
  'ALTERATIONS',
  'BRIDAL',
  'LEHENGA',
  'SUITS',
];

export const AdminServicesPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [designCategories, setDesignCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('ALL');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('BLOUSE');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('850');
  const [estimatedDays, setEstimatedDays] = useState('4');
  const [image, setImage] = useState('');
  const [allowAudio, setAllowAudio] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const [srvRes, desRes] = await Promise.all([
        servicesApi.list(undefined, true),
        designsApi.list({ limit: 100 }),
      ]);
      setServices(srvRes.data);
      const dCats = desRes.items.map((d) => d.category.toUpperCase().trim()).filter(Boolean);
      setDesignCategories(Array.from(new Set(dCats)));
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Compute all available categories across both services and designs
  const allCategories = useMemo(() => {
    const sCats = services.map((s) => s.category.toUpperCase().trim()).filter(Boolean);
    const combined = Array.from(new Set([...DEFAULT_PRESET_CATEGORIES, ...sCats, ...designCategories]));
    return combined;
  }, [services, designCategories]);

  const filteredServices = useMemo(() => {
    if (selectedFilterCategory === 'ALL') return services;
    return services.filter((s) => s.category.toUpperCase().trim() === selectedFilterCategory);
  }, [services, selectedFilterCategory]);

  const openCreateModal = () => {
    setEditingService(null);
    setName('');
    setCategory('BLOUSE');
    setCustomCategoryInput('');
    setIsCustomCategory(false);
    setDescription('');
    setPrice('850');
    setEstimatedDays('4');
    setImage(getServiceVideo('BLOUSE'));
    setAllowAudio(true);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    const cat = service.category.toUpperCase().trim();
    if (DEFAULT_PRESET_CATEGORIES.includes(cat)) {
      setCategory(cat);
      setIsCustomCategory(false);
      setCustomCategoryInput('');
    } else {
      setCategory('CUSTOM');
      setIsCustomCategory(true);
      setCustomCategoryInput(service.category);
    }
    setDescription(service.description || '');
    setPrice(String(service.price));
    setEstimatedDays(String(service.estimated_days));
    setImage(service.image || getServiceVideo(service.category));
    setAllowAudio(service.allow_audio !== false);
    setIsActive(service.is_active);
    setIsModalOpen(true);
  };

  const handleCategorySelectChange = (val: string) => {
    if (val === 'CUSTOM') {
      setIsCustomCategory(true);
      setCategory('CUSTOM');
    } else {
      setIsCustomCategory(false);
      setCategory(val);
      setCustomCategoryInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalCategory = (isCustomCategory ? customCategoryInput.trim() : category.trim()).toUpperCase();
    if (!finalCategory) {
      toastError('Please specify a category for this service.');
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: name.trim(),
      category: finalCategory,
      description: description.trim() || undefined,
      price: parseFloat(price) || 0,
      estimated_days: parseInt(estimatedDays, 10) || 3,
      image: image || undefined,
      allow_audio: allowAudio,
      is_active: isActive,
    };

    try {
      if (editingService) {
        await servicesApi.update(editingService.id, payload);
        success('Service updated successfully with new category & media.');
      } else {
        await servicesApi.create(payload);
        success(`Service added under "${finalCategory}" catalog.`);
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (err: any) {
      toastError(err.message || 'Failed to save service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Deactivate "${name}" from the active catalog?`)) return;
    try {
      await servicesApi.delete(id);
      success('Service deactivated.');
      fetchServices();
    } catch (err: any) {
      toastError(err.message || 'Failed to deactivate service.');
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white">
            Tailoring Services Catalog
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            Create custom categories, manage base prices, turnaround durations, and cover video showcases.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add New Service
        </Button>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedFilterCategory('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
            selectedFilterCategory === 'ALL'
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          All ({services.length})
        </button>
        {allCategories.map((cat) => {
          const count = services.filter((s) => s.category.toUpperCase().trim() === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setSelectedFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                selectedFilterCategory === cat
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredServices.length === 0 ? (
        <EmptyState
          icon={<Scissors className="w-8 h-8" />}
          title="No Services in this Category"
          description="Create a service in this category or view all services."
          actionLabel="Add Service"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((s) => {
            const mediaUrl = s.image || getServiceVideo(s.category);
            const isVideo = isVideoMedia(mediaUrl);

            return (
              <div
                key={s.id}
                className={`bg-white dark:bg-stone-900 rounded-3xl p-5 border transition-all space-y-3 flex flex-col justify-between shadow-2xs ${
                  s.is_active
                    ? 'border-stone-200 dark:border-stone-800'
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 opacity-60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-black dark:text-white font-bold text-[10px] uppercase tracking-wider">
                      {s.category}
                    </span>
                    {!s.is_active && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-950 shrink-0 border border-stone-200 dark:border-stone-800 relative group">
                      {isVideo ? (
                        <video
                          src={mediaUrl}
                          autoPlay
                          loop
                          muted={playingAudioId !== s.id}
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={mediaUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&q=80'}
                          alt={s.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {isVideo && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPlayingAudioId(playingAudioId === s.id ? null : s.id);
                          }}
                          className={`absolute bottom-1 right-1 p-1 rounded-full text-white text-[9px] shadow-sm backdrop-blur-xs transition-transform active:scale-90 cursor-pointer ${
                            playingAudioId === s.id
                              ? 'bg-emerald-600 animate-pulse ring-1 ring-white'
                              : 'bg-black/80 hover:bg-black'
                          }`}
                          title={playingAudioId === s.id ? 'Mute audio' : 'Unmute video audio'}
                        >
                          {playingAudioId === s.id ? <Volume2 className="w-3 h-3 text-white" /> : <VolumeX className="w-3 h-3 text-stone-300" />}
                        </button>
                      )}
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-base text-black dark:text-white line-clamp-1">{s.name}</h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mt-0.5">{s.description || 'Custom tailored with fitting guarantee.'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100 dark:border-stone-800">
                    <span className="font-serif font-bold text-base text-black dark:text-white">
                      ₹{s.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-black dark:text-white" /> ~{s.estimated_days} days
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <Button variant="outline" size="sm" fullWidth onClick={() => openEditModal(s)} leftIcon={<Edit2 className="w-3.5 h-3.5" />}>
                    Edit Service
                  </Button>
                  {s.is_active && (
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id, s.name)} className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingService ? 'Edit Tailoring Service' : 'Add Tailoring Service'}
          subtitle="Add or update pricing, description, category, and cover video/image"
          maxWidth="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Service Title"
              placeholder="e.g. Royal Bridal Blouse with Zardozi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            {/* Custom Category Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
                Service Category
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={isCustomCategory ? 'CUSTOM' : category}
                  onChange={(e) => handleCategorySelectChange(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 p-2.5 text-xs sm:text-sm focus:outline-none"
                >
                  <optgroup label="Choose Existing or Preset:">
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </optgroup>
                  <option value="CUSTOM">+ Add New Custom Category...</option>
                </select>

                {isCustomCategory && (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom category name (e.g. ANARKALI)..."
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 p-2.5 text-xs sm:text-sm focus:outline-none uppercase"
                    autoFocus
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Base Price (₹)"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <Input
                label="Estimated Turnaround (Days)"
                type="number"
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
                Description / Inclusions
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details on lining, padding, zipper, neckline options..."
                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 p-3 text-sm focus:outline-none"
              />
            </div>

            <ImageUpload
              label="Cover Video / Showcase Media"
              value={image}
              onChange={setImage}
              folder="services"
              allowVideo={true}
              helperText="Upload Video (MP4/WebM) or Image (JPG/PNG/WEBP) up to 100MB, or select Preset Studio Video above"
            />

            <div className="space-y-2">
              <label className="flex items-start gap-2.5 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl cursor-pointer select-none border border-stone-200 dark:border-stone-700">
                <input
                  type="checkbox"
                  checked={allowAudio}
                  onChange={(e) => setAllowAudio(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-black dark:text-white rounded"
                />
                <div>
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                    Allow Visitors to Hear Video Audio (Speaker button)
                  </span>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    Videos always start automatically muted when users visit. When enabled, visitors see a speaker button to unmute sound whenever they want.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-2 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl cursor-pointer select-none border border-stone-200 dark:border-stone-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-black dark:text-white rounded"
                />
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">Active in public catalog</span>
              </label>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Save Service
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
