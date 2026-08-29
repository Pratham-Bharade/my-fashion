import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { businessSettingsApi } from '../../api/contact';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { Settings, Save, Store, Phone, Mail, MapPin, MessageCircle, Clock, Sparkles } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { settings, refreshSettings } = useSettings();
  const { success, error: toastError } = useToast();

  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [slotDuration, setSlotDuration] = useState('45');
  const [maxPerSlot, setMaxPerSlot] = useState('2');
  const [aboutText, setAboutText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (settings) {
      setBusinessName(settings.business_name || '');
      setPhone(settings.phone || '');
      setEmail(settings.email || '');
      setAddress(settings.address || '');
      setWhatsapp(settings.whatsapp || '');
      setSlotDuration(String(settings.slot_duration_minutes || 45));
      setMaxPerSlot(String(settings.max_appointments_per_slot || 2));
      setAboutText(settings.about_text || '');
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await businessSettingsApi.update({
        business_name: businessName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        whatsapp: whatsapp.trim(),
        slot_duration_minutes: parseInt(slotDuration, 10) || 45,
        max_appointments_per_slot: parseInt(maxPerSlot, 10) || 2,
        about_text: aboutText.trim(),
      });
      await refreshSettings();
      success('Boutique settings updated successfully!');
    } catch (err: any) {
      toastError(err.message || 'Failed to update settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-serif font-bold text-2xl text-stone-900">
          Boutique Settings & Configuration
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Update studio contact info, WhatsApp number, working hours, and slot scheduling logic.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
        <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
          <Store className="w-5 h-5 text-brand-600" />
          General Boutique Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Boutique / Brand Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
          <Input
            label="Phone Consultation Line"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Inquiries Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />
          <Input
            label="WhatsApp Number (with country code)"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            leftIcon={<MessageCircle className="w-4 h-4" />}
            helperText="e.g. +919876543210 (Used for 1-tap customer chat)"
            required
          />
        </div>

        <Input
          label="Physical Studio Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          leftIcon={<MapPin className="w-4 h-4" />}
          required
        />

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 block">
            About Atelier / Craftsmanship Story
          </label>
          <textarea
            rows={4}
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
            className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-brand-600 focus:outline-none"
          />
        </div>

        <div className="pt-4 border-t border-stone-100">
          <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-brand-600" />
            Appointment Engine Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Slot Duration (Minutes)"
              type="number"
              value={slotDuration}
              onChange={(e) => setSlotDuration(e.target.value)}
              helperText="Default: 45 minutes"
              required
            />
            <Input
              label="Max Appointments per Slot"
              type="number"
              value={maxPerSlot}
              onChange={(e) => setMaxPerSlot(e.target.value)}
              helperText="Capacity of trial fitting rooms"
              required
            />
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100 flex justify-end">
          <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} leftIcon={<Save className="w-4 h-4" />}>
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
