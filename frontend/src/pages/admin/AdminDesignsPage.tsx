import React, { useState, useEffect, useMemo } from 'react';
import { designsApi } from '../../api/designs';
import { servicesApi } from '../../api/services';
import { Design } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ImageUpload, isVideoMedia } from '../../components/common/ImageUpload';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import { Sparkles, Plus, Edit2, Trash2, Tag, Video as VideoIcon, Volume2, VolumeX } from 'lucide-react';

const DEFAULT_PRESET_CATEGORIES = [
  'BLOUSE',
  'BRIDAL',
  'KURTI',
  'LEHENGA',
  'GOWN',
  'EMBROIDERY',
  'DESIGNER',
  'SUITS',
  'ANARKALI',
  'WESTERN',
];

export const AdminDesignsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('ALL');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState<Design | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('BLOUSE');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [allowAudio, setAllowAudio] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDesigns = async () => {
    setIsLoading(true);
    try {
      const [desRes, srvRes] = await Promise.all([
        designsApi.list({ include_inactive: true, limit: 100 }),
        servicesApi.list(undefined, true),
      ]);
      setDesigns(desRes?.items || []);
      const sCats = (srvRes?.data || []).map((s) => (s?.category ? s.category.toUpperCase().trim() : '')).filter(Boolean);
      setServiceCategories(Array.from(new Set(sCats)));
    } catch (err) {
      console.error('Failed to load designs:', err);
      setDesigns([]);
      setServiceCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  // Compute all available categories across both designs and services
  const allCategories = useMemo(() => {
    const dCats = (designs || []).map((d) => (d?.category ? d.category.toUpperCase().trim() : '')).filter(Boolean);
    const combined = Array.from(new Set([...DEFAULT_PRESET_CATEGORIES, ...dCats, ...(serviceCategories || [])]));
    return combined;
  }, [designs, serviceCategories]);

  const filteredDesigns = useMemo(() => {
    const list = designs || [];
    if (selectedFilterCategory === 'ALL') return list;
    return list.filter((d) => d?.category && d.category.toUpperCase().trim() === selectedFilterCategory);
  }, [designs, selectedFilterCategory]);

  const openCreateModal = () => {
    setEditingDesign(null);
    setTitle('');
    setCategory('BLOUSE');
    setCustomCategoryInput('');
    setIsCustomCategory(false);
    setDescription('');
    setPrice('');
    setImage('');
    setTagsStr('');
    setAllowAudio(true);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (design: Design) => {
    setEditingDesign(design);
    setTitle(design.title);
    const cat = design.category.toUpperCase().trim();
    if (DEFAULT_PRESET_CATEGORIES.includes(cat)) {
      setCategory(cat);
      setIsCustomCategory(false);
      setCustomCategoryInput('');
    } else {
      setCategory('CUSTOM');
      setIsCustomCategory(true);
      setCustomCategoryInput(design.category);
    }
    setDescription(design.description || '');
    setPrice(design.price ? String(design.price) : '');
    setImage(design.image);
    setTagsStr(design.tags ? design.tags.join(', ') : '');
    setAllowAudio(design.allow_audio !== false);
    setIsActive(design.is_active);
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
    if (!image) {
      toastError('Please upload a design photo or video.');
      return;
    }

    const finalCategory = (isCustomCategory ? customCategoryInput.trim() : category.trim()).toUpperCase();
    if (!finalCategory) {
      toastError('Please specify a category for this design.');
      return;
    }

    setIsSubmitting(true);
    const tags = tagsStr.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);

    const payload = {
      title: title.trim(),
      category: finalCategory,
      description: description.trim() || undefined,
      image,
      price: price ? parseFloat(price) : undefined,
      tags,
      allow_audio: allowAudio,
      is_active: isActive,
    };

    try {
      if (editingDesign) {
        await designsApi.update(editingDesign.id, payload);
        success('Design updated.');
      } else {
        await designsApi.create(payload);
        success(`Design published under "${finalCategory}" gallery.`);
      }
      setIsModalOpen(false);
      fetchDesigns();
    } catch (err: any) {
      toastError(err.message || 'Failed to save design.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Remove "${name}" from the active gallery?`)) return;
    try {
      await designsApi.delete(id);
      success('Design removed.');
      fetchDesigns();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete design.');
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white">
            Design Gallery & Atelier Portfolio
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            Create custom categories, manage bespoke design inspirations, tags, showcase photos, and estimated prices.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Upload New Design
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
          All ({designs.length})
        </button>
        {allCategories.map((cat) => {
          const count = designs.filter((d) => d.category.toUpperCase().trim() === cat).length;
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredDesigns.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-8 h-8" />}
          title="No Designs in this Category"
          description="Upload a design in this category or view all designs."
          actionLabel="Upload Design"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDesigns.map((d) => {
            const isVideo = isVideoMedia(d.image);

            return (
              <div
                key={d.id}
                className={`bg-white dark:bg-stone-900 rounded-3xl overflow-hidden border transition-all space-y-3 flex flex-col justify-between shadow-2xs ${
                  d.is_active
                    ? 'border-stone-200 dark:border-stone-800'
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 opacity-60'
                }`}
              >
                <div className="space-y-2">
                  <div className="aspect-4/3 overflow-hidden bg-stone-950 relative group">
                    {isVideo ? (
                      <video
                        src={d.image}
                        autoPlay
                        loop
                        muted={playingAudioId !== d.id}
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img src={d.image} alt={d.title} className="w-full h-full object-cover" />
                    )}
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/80 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                      {d.category}
                    </span>

                    {isVideo && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPlayingAudioId(playingAudioId === d.id ? null : d.id);
                        }}
                        className={`absolute bottom-2 right-2 p-1.5 rounded-full text-white text-[10px] shadow-sm backdrop-blur-xs transition-transform active:scale-90 cursor-pointer ${
                          playingAudioId === d.id
                            ? 'bg-emerald-600 animate-pulse ring-1 ring-white'
                            : 'bg-black/80 hover:bg-black'
                        }`}
                        title={playingAudioId === d.id ? 'Mute audio' : 'Unmute video audio'}
                      >
                        {playingAudioId === d.id ? <Volume2 className="w-3.5 h-3.5 text-white" /> : <VolumeX className="w-3.5 h-3.5 text-stone-300" />}
                      </button>
                    )}
                  </div>

                  <div className="p-4 space-y-1">
                    <h3 className="font-serif font-bold text-base text-black dark:text-white line-clamp-1">{d.title}</h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">{d.description}</p>
                    {d.tags && d.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {d.tags.slice(0, 3).map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] text-stone-600 dark:text-stone-300">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 pt-0 flex gap-2">
                  <Button variant="outline" size="sm" fullWidth onClick={() => openEditModal(d)} leftIcon={<Edit2 className="w-3.5 h-3.5" />}>
                    Edit
                  </Button>
                  {d.is_active && (
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(d.id, d.title)} className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50">
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
          title={editingDesign ? 'Edit Gallery Design' : 'Upload Design to Gallery'}
          subtitle="Add photos, video, custom category, tags, and pricing"
          maxWidth="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Design Title"
              placeholder="e.g. Royal Emerald Sabyasachi Style Blouse"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Custom Category Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
                Design Category
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
                    placeholder="Enter custom category (e.g. DUPATTA)..."
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
                label="Estimated Price (₹) (Optional)"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 2500"
              />
              <Input
                label="Search Tags (comma separated)"
                placeholder="bridal, zari, silk, latkan"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
                Design Description & Work Inclusions
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Intricate hand zardozi work with sweetheart neckline..."
                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 p-3 text-sm focus:outline-none"
              />
            </div>

            <ImageUpload
              label="Design Photo or Showcase Video"
              value={image}
              onChange={setImage}
              folder="designs"
              allowVideo={true}
              helperText="Upload Video (MP4/WebM) or Image (JPG/PNG/WEBP) up to 100MB"
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
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">Active in public gallery</span>
              </label>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Save Design
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
