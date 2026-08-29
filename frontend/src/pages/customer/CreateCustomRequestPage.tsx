import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { designsApi } from '../../api/designs';
import { measurementsApi } from '../../api/measurements';
import { customRequestsApi } from '../../api/customRequests';
import { Design, MeasurementProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { ImageUpload } from '../../components/common/ImageUpload';
import { Modal } from '../../components/common/Modal';
import { MeasurementForm } from '../../components/customer/MeasurementForm';
import { Sparkles, ArrowLeft, Plus, Ruler, CheckCircle2, X, Phone } from 'lucide-react';

export const CreateCustomRequestPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDesignId = searchParams.get('design_id');

  const [referencedDesign, setReferencedDesign] = useState<Design | null>(null);
  const [garmentType, setGarmentType] = useState('Blouse');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [fabric, setFabric] = useState('');
  const [preferredColor, setPreferredColor] = useState('');
  const [occasion, setOccasion] = useState('');
  const [requiredDate, setRequiredDate] = useState('');
  const [measurementProfiles, setMeasurementProfiles] = useState<MeasurementProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [currentUploadedUrl, setCurrentUploadedUrl] = useState('');

  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [isSavingMeasurement, setIsSavingMeasurement] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeasurements = async () => {
    if (!isAuthenticated) return;
    try {
      const meaRes = await measurementsApi.list();
      setMeasurementProfiles(meaRes.data);
      if (!selectedProfileId && meaRes.data.length > 0) {
        const defaultProf = meaRes.data.find((p) => p.is_default) || meaRes.data[0];
        setSelectedProfileId(defaultProf.id);
      }
    } catch (err) {
      console.error('Failed to load measurement profiles:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        if (preselectedDesignId) {
          const desRes = await designsApi.getById(preselectedDesignId);
          setReferencedDesign(desRes.data);
          setGarmentType(desRes.data.category);
          setDescription(`I would like custom stitching inspired by the design "${desRes.data.title}".`);
        }

        await fetchMeasurements();
      } catch (err) {
        console.error('Failed to load initial request parameters:', err);
      }
    };
    loadData();
  }, [preselectedDesignId, isAuthenticated]);

  const handleAddImage = (url: string) => {
    if (url && !imagePaths.includes(url)) {
      setImagePaths((prev) => [...prev, url]);
      setCurrentUploadedUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagePaths((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateMeasurementProfile = async (data: any) => {
    setIsSavingMeasurement(true);
    try {
      const res = await measurementsApi.create(data);
      success('Measurement profile created and selected!');
      setIsMeasurementModalOpen(false);
      await fetchMeasurements();
      if (res.data?.id) {
        setSelectedProfileId(res.data.id);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to save measurement profile.');
    } finally {
      setIsSavingMeasurement(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=/custom-requests/create');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setError('Mandatory: Please fill your 10-digit contact mobile number first.');
      return;
    }

    if (!description.trim() || description.length < 5) {
      setError('Please provide a descriptive explanation of what you would like stitched.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await customRequestsApi.create({
        design_id: referencedDesign?.id || undefined,
        garment_type: garmentType,
        description: description.trim(),
        phone: cleanPhone,
        fabric: fabric.trim() || undefined,
        preferred_color: preferredColor.trim() || undefined,
        occasion: occasion.trim() || undefined,
        required_date: requiredDate || undefined,
        measurement_profile_id: selectedProfileId || undefined,
        image_paths: imagePaths,
      });

      success('Custom stitching request submitted! Our tailor will review your details and send a quotation.');
      navigate('/custom-requests');
    } catch (err: any) {
      setError(err.message || 'Failed to submit custom request.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProfile = measurementProfiles.find((p) => p.id === selectedProfileId);

  const garmentOptions = [
    { value: 'Blouse', label: 'Designer / Bridal Blouse' },
    { value: 'Kurti', label: 'Kurti / Kurta' },
    { value: 'Salwar Suit', label: 'Salwar Suit / Anarkali / Punjabi' },
    { value: 'Lehenga', label: 'Custom Bridal Lehenga' },
    { value: 'Gown', label: 'Floor-Length Gown / Dress' },
    { value: 'Other', label: 'Other Custom Garment' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-6">
      <Link to="/custom-requests" className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-black dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Custom Requests
      </Link>

      {/* Header */}
      <div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white">
          Request Custom Stitching & Quotation
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Upload reference photos or designs and provide your contact details for pricing.
        </p>
      </div>

      {referencedDesign && (
        <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center gap-3">
          <img src={referencedDesign.image} alt={referencedDesign.title} className="w-14 h-14 rounded-xl object-cover" />
          <div className="text-xs">
            <span className="text-stone-500 dark:text-stone-400 font-bold uppercase text-[10px]">Attached Inspiration</span>
            <h4 className="font-serif font-bold text-sm text-black dark:text-white">{referencedDesign.title}</h4>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Main Request Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-stone-900 p-5 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
        {/* Mandatory Contact Mobile Number */}
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center justify-between">
            <span>Contact Mobile Number <span className="text-rose-600 font-bold">*</span></span>
            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">Mandatory: please fill your number first</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-stone-500 dark:text-stone-400 font-semibold text-sm flex items-center gap-1.5 pointer-events-none">
              <Phone className="w-4 h-4 text-stone-400" />
              <span>+91</span>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={14}
              required
              placeholder="Enter 10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full min-h-[46px] pl-16 pr-3.5 py-2 text-sm font-semibold rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:border-black dark:focus:border-white focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Please enter your 10-digit mobile number so we can reach you.
          </p>
        </div>

        {/* Garment Type & Occasion */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Garment Category"
            options={garmentOptions}
            value={garmentType}
            onChange={(e) => setGarmentType(e.target.value)}
            required
          />
          <Input
            label="Occasion / Event"
            placeholder="e.g. Wedding, Reception, Festival, Daily Wear"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
          />
        </div>

        {/* Fabric & Color */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Fabric Material"
            placeholder="e.g. Pure Raw Silk, Velvet, Georgette, Organza"
            value={fabric}
            onChange={(e) => setFabric(e.target.value)}
          />
          <Input
            label="Preferred Color / Combination"
            placeholder="e.g. Bottle Green & Antique Gold"
            value={preferredColor}
            onChange={(e) => setPreferredColor(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
            Describe Your Design & Cut <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide specific details such as neck depth, back design, sleeve style, lining, padding, borders, latkans, etc."
            required
            className="w-full rounded-xl border border-stone-300 dark:border-stone-700 p-3.5 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:border-black dark:focus:border-white focus:outline-none transition-all"
          />
        </div>

        {/* Target Delivery Date */}
        <Input
          label="Required Delivery Date"
          type="date"
          min={new Date().toISOString().split('T')[0]}
          value={requiredDate}
          onChange={(e) => setRequiredDate(e.target.value)}
        />

        {/* Measurement Profile */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
              Sizing & Measurements (Optional)
            </label>
            <button
              type="button"
              onClick={() => setIsMeasurementModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-black dark:text-white hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> + Enter New Measurements
            </button>
          </div>

          <Select
            options={[
              { value: '', label: '-- Send measurements later / Take in boutique --' },
              ...measurementProfiles.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.garment_type})${p.is_default ? ' ★' : ''}`,
              })),
            ]}
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
          />

          {selectedProfile && (
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
              <span className="text-[11px] font-bold uppercase text-stone-500 dark:text-stone-400 block">
                Attached Measurements: {selectedProfile.name}
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
                {Object.entries(selectedProfile.measurements || {}).map(([k, v]) => (
                  <div key={k} className="bg-white dark:bg-stone-900 p-2 rounded-lg border border-stone-200 dark:border-stone-800">
                    <span className="text-[10px] text-stone-400 block truncate">{k.replace(/_/g, ' ')}</span>
                    <span className="font-bold text-black dark:text-white">{v}&quot;</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Inspiration Photos Upload Matrix */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
            Reference Photos & Sketches
          </label>

          <ImageUpload
            label="Upload photo from Gallery / Pinterest"
            value={currentUploadedUrl}
            onChange={handleAddImage}
            folder="custom_requests"
          />

          {imagePaths.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
              {imagePaths.map((path, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-stone-200 dark:border-stone-700">
                  <img src={path} alt={`Inspiration ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/75 text-white hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Submit Custom Request for Quotation
          </Button>
        </div>
      </form>

      {/* Measurement Creation Modal */}
      <Modal
        isOpen={isMeasurementModalOpen}
        onClose={() => setIsMeasurementModalOpen(false)}
        title="Create Measurement Profile"
        maxWidth="lg"
      >
        <MeasurementForm
          onSubmit={handleCreateMeasurementProfile}
          isLoading={isSavingMeasurement}
        />
      </Modal>
    </div>
  );
};
