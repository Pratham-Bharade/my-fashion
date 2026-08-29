import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { servicesApi } from '../../api/services';
import { measurementsApi } from '../../api/measurements';
import { appointmentsApi } from '../../api/appointments';
import { Service, MeasurementProfile, AvailableSlot } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { ImageUpload, isVideoMedia } from '../../components/common/ImageUpload';
import { Modal } from '../../components/common/Modal';
import { MeasurementForm } from '../../components/customer/MeasurementForm';
import { getServiceVideo } from '../../config/serviceVideos';
import {
  Calendar as CalendarIcon,
  Clock,
  Ruler,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Scissors,
  Sparkles,
  Plus,
  Info,
  Phone
} from 'lucide-react';

const FALLBACK_SLOTS: AvailableSlot[] = [
  { date: new Date().toISOString().split('T')[0], start_time: '10:30 AM', end_time: '11:00 AM', is_available: true },
  { date: new Date().toISOString().split('T')[0], start_time: '11:30 AM', end_time: '12:00 PM', is_available: true },
  { date: new Date().toISOString().split('T')[0], start_time: '01:30 PM', end_time: '02:00 PM', is_available: true },
  { date: new Date().toISOString().split('T')[0], start_time: '03:00 PM', end_time: '03:30 PM', is_available: true },
  { date: new Date().toISOString().split('T')[0], start_time: '04:30 PM', end_time: '05:00 PM', is_available: true },
  { date: new Date().toISOString().split('T')[0], start_time: '06:00 PM', end_time: '06:30 PM', is_available: true },
];

export const BookAppointmentPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('service_id');

  // Multi-step state (1 to 5)
  const [step, setStep] = useState<number>(1);
  const [maxReachedStep, setMaxReachedStep] = useState<number>(1);

  // Form state
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Contact Phone Number (Mandatory - starts blank so user enters fresh)
  const [phone, setPhone] = useState<string>('');

  // Date selection (Next 14 days)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [isCheckingSlots, setIsCheckingSlots] = useState(false);

  // Measurement profile selection & Inline Creation
  const [measurementProfiles, setMeasurementProfiles] = useState<MeasurementProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [isSavingMeasurement, setIsSavingMeasurement] = useState(false);

  // Notes & Reference Image
  const [notes, setNotes] = useState('');
  const [referenceImage, setReferenceImage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goToStep = (nextStep: number) => {
    setStep(nextStep);
    setMaxReachedStep((prev) => Math.max(prev, nextStep));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch measurements helper
  const fetchMeasurements = async () => {
    if (!isAuthenticated) return;
    try {
      const mRes = await measurementsApi.list();
      setMeasurementProfiles(mRes.data);
      if (!selectedProfileId && mRes.data.length > 0) {
        const def = mRes.data.find((p: MeasurementProfile) => p.is_default) || mRes.data[0];
        setSelectedProfileId(def.id);
      }
    } catch (err) {
      console.error('Failed to load measurement profiles:', err);
    }
  };

  // 1. Fetch services & measurements
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const srvRes = await servicesApi.list();
        const activeServices = srvRes.data.filter((s: Service) => s.is_active);
        setServices(activeServices);

        if (preselectedServiceId) {
          const match = activeServices.find((s: Service) => s.id === preselectedServiceId);
          if (match) {
            setSelectedService(match);
            goToStep(2); // Auto-advance to date picker
          }
        }

        await fetchMeasurements();
      } catch (err) {
        console.error('Failed to load initial booking data:', err);
      }
    };
    loadInitialData();
  }, [preselectedServiceId, isAuthenticated]);

  // 2. Fetch available slots whenever target date changes
  useEffect(() => {
    if (!selectedDate) return;
    const loadSlots = async () => {
      setIsCheckingSlots(true);
      setSelectedSlot('');
      try {
        const res = await appointmentsApi.getAvailableSlots(selectedDate);
        if (res.data && res.data.length > 0) {
          setAvailableSlots(res.data);
        } else {
          setAvailableSlots(FALLBACK_SLOTS);
        }
      } catch (err) {
        console.error('Failed to load available slots, using default schedule:', err);
        setAvailableSlots(FALLBACK_SLOTS);
      } finally {
        setIsCheckingSlots(false);
      }
    };
    loadSlots();
  }, [selectedDate]);

  // Generate next 14 calendar dates for mobile date picker
  const dateOptions = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = d.getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    return { dateStr, dayName, dayNumber, monthName };
  });

  const handleCreateMeasurementProfile = async (data: any) => {
    setIsSavingMeasurement(true);
    try {
      const res = await measurementsApi.create(data);
      success('Measurement profile created and linked to your booking!');
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

  const handleBookingSubmit = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/appointments/book?service_id=${selectedService?.id}`);
      return;
    }

    if (!selectedService || !selectedDate || !selectedSlot) {
      setError('Please complete all booking steps (Select service, date, and slot).');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setError('Mandatory: Please fill your 10-digit contact mobile number first.');
      goToStep(4);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await appointmentsApi.book({
        service_id: selectedService.id,
        appointment_date: selectedDate,
        start_time: selectedSlot,
        phone: cleanPhone,
        measurement_profile_id: selectedProfileId || undefined,
        notes: notes.trim() || undefined,
        reference_image: referenceImage || undefined,
      });

      success('Appointment booked successfully! We look forward to seeing you.');
      navigate('/appointments');
    } catch (err: any) {
      setError(err.message || 'Failed to book slot. It may have just been booked by another user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProfile = measurementProfiles.find((p) => p.id === selectedProfileId);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-10 space-y-6 text-stone-900 dark:text-stone-100 transition-colors pb-24">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
          Studio Consultation & Fitting
        </span>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white">
          Book Tailoring Appointment
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
          Complete the 5 quick steps below to reserve your custom fitting session.
        </p>
      </div>

      {/* 5-Step Progress Interactive Indicator */}
      <div className="bg-white dark:bg-stone-900 p-2 sm:p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs flex items-center justify-between text-xs font-semibold overflow-x-auto scrollbar-none gap-1">
        {[
          { num: 1, label: 'Service' },
          { num: 2, label: 'Date' },
          { num: 3, label: 'Time Slot' },
          { num: 4, label: 'Sizes' },
          { num: 5, label: 'Confirm' },
        ].map((s) => {
          const isCurrent = step === s.num;
          const isPassed = step > s.num;
          const isAllowed = s.num <= maxReachedStep || (s.num === 2 && selectedService) || (s.num === 3 && selectedDate) || (s.num === 4 && selectedSlot) || (s.num === 5 && selectedSlot);

          return (
            <button
              key={s.num}
              type="button"
              onClick={() => isAllowed && goToStep(s.num)}
              disabled={!isAllowed}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
                isCurrent
                  ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs'
                  : isPassed
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100'
                  : isAllowed
                  ? 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  : 'text-stone-300 dark:text-stone-700 cursor-not-allowed opacity-60'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isCurrent ? 'bg-white text-black dark:bg-black dark:text-white' : 'bg-current/20 text-current'}`}>
                {s.num}
              </span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm font-medium">
          {error}
        </div>
      )}

      {/* STEP 1: CHOOSE SERVICE */}
      {step === 1 && (
        <div className="bg-white dark:bg-stone-900 p-5 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-black dark:text-white">
                Step 1: Select Tailoring Service
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">Choose the garment type you would like tailored.</p>
            </div>
            <span className="text-xs font-bold text-stone-400">1 of 5</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {services.map((s) => {
              const isSelected = selectedService?.id === s.id;
              const videoSrc = isVideoMedia(s.image) && s.image ? s.image : getServiceVideo(s.category);

              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedService(s)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? 'border-black dark:border-white bg-stone-100/80 dark:bg-stone-800 ring-2 ring-stone-900 dark:ring-stone-100 shadow-sm'
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 bg-stone-50/50 dark:bg-stone-900/50'
                  }`}
                >
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-stone-950 shrink-0 relative shadow-2xs border border-stone-200 dark:border-stone-800">
                    <video
                      src={videoSrc}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                      {s.category}
                    </span>
                    <h4 className="font-bold text-sm text-black dark:text-white truncate">{s.name}</h4>
                    <span className="font-serif font-bold text-black dark:text-white text-sm block mt-1">
                      From ₹{s.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-black dark:text-white shrink-0" />}
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              variant="primary"
              size="lg"
              disabled={!selectedService}
              onClick={() => goToStep(2)}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Continue to Select Date
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: CHOOSE DATE */}
      {step === 2 && (
        <div className="bg-white dark:bg-stone-900 p-5 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-black dark:text-white">
                Step 2: Choose Consultation Date
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">Pick any available date over the next 2 weeks.</p>
            </div>
            <span className="text-xs font-bold text-stone-400">2 of 5</span>
          </div>

          {/* Quick Date Slider */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-1">
            {dateOptions.map((opt) => {
              const isSelected = selectedDate === opt.dateStr;
              return (
                <button
                  key={opt.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(opt.dateStr)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold shadow-md scale-[1.02]'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 hover:border-stone-400'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold block opacity-80">{opt.dayName}</span>
                  <span className="font-serif font-bold text-lg sm:text-xl block my-0.5">{opt.dayNumber}</span>
                  <span className="text-[9px] block opacity-70">{opt.monthName}</span>
                </button>
              );
            })}
          </div>

          {/* Manual Date Input */}
          <div className="pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-1">
              Or pick specific calendar date:
            </label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-64 min-h-[44px] rounded-xl border border-stone-300 dark:border-stone-700 px-3.5 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="pt-4 flex justify-between">
            <Button variant="outline" size="md" onClick={() => goToStep(1)} leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button variant="primary" size="lg" onClick={() => goToStep(3)} rightIcon={<ChevronRight className="w-4 h-4" />}>
              Continue to Choose Slot
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: CHOOSE TIME SLOT */}
      {step === 3 && (
        <div className="bg-white dark:bg-stone-900 p-5 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-black dark:text-white">
                Step 3: Select Fitting Time Slot
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Available slots for {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
              </p>
            </div>
            <span className="text-xs font-bold text-stone-400">3 of 5</span>
          </div>

          {isCheckingSlots ? (
            <div className="py-8 text-center text-xs text-stone-500 dark:text-stone-400">
              Checking available master tailor consultation slots...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
              {availableSlots.map((slot) => {
                const isSelected = selectedSlot === slot.start_time;
                return (
                  <button
                    key={slot.start_time}
                    type="button"
                    disabled={!slot.is_available}
                    onClick={() => setSelectedSlot(slot.start_time)}
                    className={`py-3.5 px-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      !slot.is_available
                        ? 'opacity-40 border-dashed border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 cursor-not-allowed text-stone-400'
                        : isSelected
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold shadow-md scale-[1.02]'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 text-stone-800 dark:text-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 mx-auto mb-1 opacity-70" />
                    <span className="font-serif font-bold text-xs sm:text-sm block">{slot.start_time}</span>
                    <span className="text-[9px] uppercase font-bold block mt-0.5 opacity-80">
                      {slot.is_available ? 'Available' : 'Booked'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="pt-4 flex justify-between">
            <Button variant="outline" size="md" onClick={() => goToStep(2)} leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              disabled={!selectedSlot}
              onClick={() => goToStep(4)}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Continue to Measurements
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: ATTACH MEASUREMENTS & INSPIRATION */}
      {step === 4 && (
        <div className="bg-white dark:bg-stone-900 p-5 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-black dark:text-white">
                Step 4: Attach Measurements & Inspiration
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">Attach custom sizing profile or enter sizes now.</p>
            </div>
            <span className="text-xs font-bold text-stone-400">4 of 5</span>
          </div>

          {/* Sizing profile selector & Add Button */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
                Sizing & Measurement Profile
              </label>
              <button
                type="button"
                onClick={() => setIsMeasurementModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-stone-800 dark:hover:bg-stone-200 text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Enter Measurements</span>
              </button>
            </div>

            {measurementProfiles.length === 0 ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 mt-0.5">
                    <Ruler className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-black dark:text-white block">
                      Take Measurements in Studio (Default)
                    </span>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                      Our master tailor will measure you in person during your visit, or you can enter sizes right now.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsMeasurementModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-stone-800 dark:hover:bg-stone-200 text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Enter Sizing Now</span>
                  </button>
                  <span className="text-xs text-stone-400 font-medium">or measure during visit</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="w-full min-h-[46px] rounded-xl border border-stone-300 dark:border-stone-700 px-3.5 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                >
                  <option value="">-- Take measurements during visit in studio --</option>
                  {measurementProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.garment_type}) {p.is_default ? '★ Default' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Live Measurement Preview Grid */}
            {selectedProfile && (
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Linked Profile: <strong className="text-black dark:text-white">{selectedProfile.name}</strong> ({selectedProfile.garment_type})
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✓ Attached</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {Object.entries(selectedProfile.measurements || {}).map(([key, val]) => (
                    <div key={key} className="bg-white dark:bg-stone-900 p-2 rounded-xl border border-stone-200 dark:border-stone-800">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block truncate">{key.replace(/_/g, ' ')}</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">{val}&quot;</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mandatory Contact Mobile Number */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
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

          {/* Reference Image */}
          <ImageUpload
            label="Inspiration / Fabric Photo (Optional)"
            value={referenceImage}
            onChange={setReferenceImage}
            folder="custom_requests"
          />

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
              Special Notes / Requests (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Deep square back neck, heavy latkans, elbow-length sleeves..."
              className="w-full rounded-xl border border-stone-300 dark:border-stone-700 p-3.5 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:border-black dark:focus:border-white focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-between">
            <Button variant="outline" size="md" onClick={() => goToStep(3)} leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button variant="primary" size="lg" onClick={() => goToStep(5)} rightIcon={<ChevronRight className="w-4 h-4" />}>
              Review Booking
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: REVIEW & CONFIRM BOOKING */}
      {step === 5 && (
        <div className="bg-white dark:bg-stone-900 p-5 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-black dark:text-white">
                Step 5: Review & Confirm Slot
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">Please review your booking details before confirming.</p>
            </div>
            <span className="text-xs font-bold text-stone-400">5 of 5</span>
          </div>

          {/* Selected Service Card with Video Preview */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-950 shrink-0">
              <video
                src={isVideoMedia(selectedService?.image) && selectedService?.image ? selectedService.image : getServiceVideo(selectedService?.category)}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                {selectedService?.category}
              </span>
              <h3 className="font-serif font-bold text-base text-black dark:text-white">
                {selectedService?.name}
              </h3>
              <span className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                Starting from ₹{selectedService?.price.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Summary Details */}
          <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-5 border border-stone-200 dark:border-stone-700 space-y-3 text-sm">
            <div className="flex justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
              <span className="text-stone-500 dark:text-stone-400">Consultation Date:</span>
              <span className="font-semibold text-black dark:text-white">
                {new Date(selectedDate).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
              <span className="text-stone-500 dark:text-stone-400">Reserved Time Slot:</span>
              <span className="font-bold text-black dark:text-white">{selectedSlot}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
              <span className="text-stone-500 dark:text-stone-400">Contact Mobile:</span>
              <span className="font-bold text-black dark:text-white">+91 {phone}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
              <span className="text-stone-500 dark:text-stone-400">Base Price:</span>
              <span className="font-bold text-black dark:text-white">₹{selectedService?.price.toLocaleString('en-IN')}</span>
            </div>

            {/* Measurement Profile in Summary */}
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
              <span className="text-stone-500 dark:text-stone-400">Measurements:</span>
              {selectedProfile ? (
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {selectedProfile.name} ({selectedProfile.garment_type}) ✓
                </span>
              ) : (
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-stone-500">In-Studio Fitting Visit</span>
                  <button
                    type="button"
                    onClick={() => setIsMeasurementModalOpen(true)}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold shadow-2xs hover:bg-stone-800 dark:hover:bg-stone-200 transition-all cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Enter Now</span>
                  </button>
                </div>
              )}
            </div>

            {notes && (
              <div className="text-xs text-stone-600 dark:text-stone-300 pt-1">
                <span className="font-bold text-black dark:text-white">Notes:</span> {notes}
              </div>
            )}
          </div>

          {!isAuthenticated && (
            <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-200">
              <span className="font-bold">Authentication Required:</span> You will be asked to sign in or register to finalize your booking so you can track your appointment status.
            </div>
          )}

          <div className="pt-4 flex justify-between gap-3">
            <Button variant="outline" size="md" onClick={() => goToStep(4)} leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              onClick={handleBookingSubmit}
              rightIcon={<CheckCircle2 className="w-5 h-5" />}
            >
              Confirm Appointment Booking
            </Button>
          </div>
        </div>
      )}

      {/* INLINE MEASUREMENT CREATION MODAL */}
      <Modal
        isOpen={isMeasurementModalOpen}
        onClose={() => setIsMeasurementModalOpen(false)}
        title="Enter Your Sizing Measurements"
        maxWidth="lg"
      >
        <div className="space-y-3">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Enter your inches below. We will save this profile to your account and attach it directly to this tailoring appointment.
          </p>
          <MeasurementForm
            onSubmit={handleCreateMeasurementProfile}
            isLoading={isSavingMeasurement}
          />
        </div>
      </Modal>
    </div>
  );
};
