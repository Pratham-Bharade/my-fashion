import React, { useState } from 'react';
import { GarmentType, MeasurementProfile } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Ruler, Sparkles, Check, Save } from 'lucide-react';

interface MeasurementFormProps {
  initialData?: MeasurementProfile;
  onSubmit: (data: { name: string; garment_type: GarmentType; measurements: Record<string, number | string>; is_default: boolean }) => Promise<void>;
  isLoading?: boolean;
}

interface FieldDef {
  key: string;
  label: string;
  placeholder?: string;
  guide?: string;
}

const GARMENT_FIELDS: Record<GarmentType, FieldDef[]> = {
  BLOUSE: [
    { key: 'bust', label: 'Bust (Fullest point)', placeholder: '36', guide: 'Around fullest part of chest' },
    { key: 'under_bust', label: 'Under Bust', placeholder: '30', guide: 'Ribcage right under bust line' },
    { key: 'waist', label: 'Waist', placeholder: '32', guide: 'Where blouse band sits' },
    { key: 'shoulder', label: 'Shoulder Width', placeholder: '14.5', guide: 'Tip of left to tip of right shoulder' },
    { key: 'armhole', label: 'Armhole Round', placeholder: '16', guide: 'Circumference around shoulder joint' },
    { key: 'sleeve_length', label: 'Sleeve Length', placeholder: '10.5', guide: 'Cap sleeve, elbow or full sleeve' },
    { key: 'sleeve_round', label: 'Sleeve Hem Round', placeholder: '12', guide: 'Circumference at sleeve end' },
    { key: 'front_neck_depth', label: 'Front Neck Depth', placeholder: '7', guide: 'From shoulder bone diagonally' },
    { key: 'back_neck_depth', label: 'Back Neck Depth', placeholder: '8.5', guide: 'From shoulder bone down spine' },
    { key: 'blouse_length', label: 'Total Blouse Length', placeholder: '14.5', guide: 'Shoulder to bottom hem' },
  ],
  KURTI: [
    { key: 'bust', label: 'Bust', placeholder: '36' },
    { key: 'waist', label: 'Waist', placeholder: '32' },
    { key: 'hip', label: 'Hip', placeholder: '40' },
    { key: 'shoulder', label: 'Shoulder', placeholder: '14.5' },
    { key: 'armhole', label: 'Armhole', placeholder: '16.5' },
    { key: 'sleeve_length', label: 'Sleeve Length', placeholder: '16' },
    { key: 'kurti_length', label: 'Kurti Total Length', placeholder: '44' },
    { key: 'slit_height', label: 'Slit Start Height', placeholder: '21' },
  ],
  SALWAR_SUIT: [
    { key: 'bust', label: 'Top Bust', placeholder: '36' },
    { key: 'top_length', label: 'Top Kameez Length', placeholder: '40' },
    { key: 'bottom_waist', label: 'Bottom Waist', placeholder: '32' },
    { key: 'hip', label: 'Hip', placeholder: '40' },
    { key: 'pant_length', label: 'Salwar / Pant Length', placeholder: '38' },
    { key: 'ankle_round', label: 'Bottom Ankle Round', placeholder: '12' },
  ],
  LEHENGA: [
    { key: 'choli_bust', label: 'Choli Bust', placeholder: '36' },
    { key: 'choli_length', label: 'Choli Length', placeholder: '14' },
    { key: 'lehenga_waist', label: 'Lehenga Waist', placeholder: '32' },
    { key: 'lehenga_length', label: 'Lehenga Length (Waist to Floor)', placeholder: '42' },
    { key: 'hip', label: 'Hip', placeholder: '40' },
  ],
  GOWN: [
    { key: 'bust', label: 'Bust', placeholder: '36' },
    { key: 'under_bust', label: 'Under Bust', placeholder: '30' },
    { key: 'waist', label: 'Waist', placeholder: '32' },
    { key: 'hip', label: 'Hip', placeholder: '40' },
    { key: 'shoulder', label: 'Shoulder', placeholder: '15' },
    { key: 'gown_length', label: 'Gown Total Length', placeholder: '56' },
  ],
  CUSTOM: [
    { key: 'chest_bust', label: 'Bust / Chest', placeholder: '36' },
    { key: 'waist', label: 'Waist', placeholder: '32' },
    { key: 'hip', label: 'Hip', placeholder: '40' },
    { key: 'length', label: 'Total Length', placeholder: '40' },
    { key: 'special_notes', label: 'Custom Specification', placeholder: 'E.g. Extra 2 inches loose fit' },
  ]
};

export const MeasurementForm: React.FC<MeasurementFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const [profileName, setProfileName] = useState(initialData?.name || '');
  const [garmentType, setGarmentType] = useState<GarmentType>(initialData?.garment_type || 'BLOUSE');
  const [isDefault, setIsDefault] = useState(initialData?.is_default ?? true);
  const [measurements, setMeasurements] = useState<Record<string, string>>(() => {
    if (initialData?.measurements) {
      const converted: Record<string, string> = {};
      Object.entries(initialData.measurements).forEach(([k, v]) => {
        converted[k] = String(v);
      });
      return converted;
    }
    return {};
  });
  const [error, setError] = useState<string | null>(null);

  const fields = GARMENT_FIELDS[garmentType] || GARMENT_FIELDS.BLOUSE;

  const handleFieldChange = (key: string, val: string) => {
    setMeasurements((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nameToUse = profileName.trim() || `My ${garmentType.toLowerCase().replace('_', ' ')} fit`;

    // Convert values
    const numericMeasurements: Record<string, number | string> = {};
    for (const f of fields) {
      const raw = measurements[f.key];
      if (raw !== undefined && raw.trim() !== '') {
        const num = parseFloat(raw);
        numericMeasurements[f.key] = isNaN(num) ? raw : num;
      }
    }

    try {
      await onSubmit({
        name: nameToUse,
        garment_type: garmentType,
        measurements: numericMeasurements,
        is_default: isDefault,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save measurement profile.');
    }
  };

  const garmentOptions = [
    { value: 'BLOUSE', label: 'Blouse (Standard / Designer / Bridal)' },
    { value: 'KURTI', label: 'Kurti / Kurta' },
    { value: 'SALWAR_SUIT', label: 'Salwar Suit / Punjabi Dress' },
    { value: 'LEHENGA', label: 'Lehenga & Choli' },
    { value: 'GOWN', label: 'Floor-Length Gown' },
    { value: 'CUSTOM', label: 'Custom / Other Garment' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-6">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Profile Name & Garment Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label="Profile Nickname"
          placeholder='e.g. "My Designer Blouse Size"'
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
        />

        <Select
          label="Garment Category"
          options={garmentOptions}
          value={garmentType}
          onChange={(e) => setGarmentType(e.target.value as GarmentType)}
        />
      </div>

      {/* Interactive Measurement Input Matrix */}
      <div className="bg-stone-50 dark:bg-stone-800/60 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3.5">
        <div className="flex items-center justify-between">
          <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base flex items-center gap-2">
            <Ruler className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Measurements (Inches)
          </h4>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider font-bold">
            Unit: Inches (&quot;)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fields.map((f) => (
            <div key={f.key} className="bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs">
              <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block mb-1">
                {f.label}
              </label>
              {f.guide && <p className="text-[10px] text-stone-400 dark:text-stone-500 mb-1.5">{f.guide}</p>}
              <div className="relative flex items-center">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder={f.placeholder}
                  value={measurements[f.key] || ''}
                  onChange={(e) => handleFieldChange(f.key, e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 text-base font-bold text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-300 dark:border-stone-700 focus:bg-white dark:focus:bg-stone-900 focus:border-black dark:focus:border-white focus:outline-none transition-all"
                />
                <span className="absolute right-3.5 text-xs font-semibold text-stone-400 dark:text-stone-500 pointer-events-none">
                  inches
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Set Default Toggle */}
      <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="w-5 h-5 rounded text-black dark:text-white accent-black dark:accent-white"
        />
        <span className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200">
          Make this my default {garmentType.toLowerCase().replace('_', ' ')} measurement profile
        </span>
      </label>

      {/* Submit Action Button with high visibility and ample padding */}
      <div className="pt-2 sticky bottom-0 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md py-3 border-t border-stone-100 dark:border-stone-800 -mx-1 px-1 z-20">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          leftIcon={<Save className="w-4 h-4" />}
          className="h-12 text-sm font-bold shadow-md"
        >
          Save & Link Measurement Profile
        </Button>
      </div>
    </form>
  );
};
