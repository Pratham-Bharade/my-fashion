import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/Badge';
import { Appointment, AppointmentStatus } from '../../types';
import {
  Calendar,
  Clock,
  User,
  Phone,
  MessageCircle,
  CheckCircle2,
  XCircle,
  UserCheck,
  Send,
  Sparkles
} from 'lucide-react';

interface AdminAppointmentActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onSuccess: () => void;
  onUpdateStatus: (id: string, status: AppointmentStatus, notes?: string) => Promise<void>;
}

export const AdminAppointmentActionModal: React.FC<AdminAppointmentActionModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onSuccess,
  onUpdateStatus,
}) => {
  if (!appointment) return null;

  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>(appointment.status);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (appointment) {
      setSelectedStatus(appointment.status);
      setMessage('');
    }
  }, [appointment]);

  const clientPhone = appointment.contact_phone || appointment.customer?.phone;
  const clientName = appointment.customer?.name || 'Customer';
  const serviceName = appointment.service?.name || 'Tailoring Fitting';
  const formattedDate = new Date(appointment.appointment_date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const quickTemplates: Array<{ label: string; text: string; status?: AppointmentStatus }> = [
    {
      label: 'Confirm Slot',
      text: `Your fitting slot for ${serviceName} is confirmed for ${formattedDate} at ${appointment.start_time}. We look forward to seeing you at Vandana Creations!`,
      status: 'CONFIRMED',
    },
    {
      label: 'Bring Fabric',
      text: `Your slot is confirmed. Please bring your reference garment and sample lining material for accurate sizing.`,
      status: 'CONFIRMED',
    },
    {
      label: 'Decline / Reschedule',
      text: `Our master tailor is unavailable at this specific slot. Please pick an alternate time or contact us on WhatsApp.`,
      status: 'CANCELLED',
    },
    {
      label: 'Completed',
      text: `Thank you for visiting Vandana Creations! Your measurements and fitting session have been successfully recorded.`,
      status: 'COMPLETED',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdateStatus(appointment.id, selectedStatus, message.trim() || undefined);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to update appointment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Appointment & Notify Customer"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-stone-900 dark:text-stone-100">
        
        {/* Client & Booking Summary Card */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 dark:border-stone-700/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm">
                {clientName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-sm text-black dark:text-white leading-tight">
                  {clientName}
                </h4>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {serviceName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={appointment.status} />
              {clientPhone && (
                <div className="flex items-center gap-1">
                  <a
                    href={`tel:${clientPhone}`}
                    className="p-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 transition-colors"
                    title="Call Customer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`https://wa.me/91${clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Hello ${clientName}, regarding your ${serviceName} appointment at Vandana Creations on ${formattedDate} at ${appointment.start_time}:`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 transition-colors"
                    title="WhatsApp Customer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Date & Time</span>
              <span className="font-semibold text-black dark:text-white">
                {formattedDate} at {appointment.start_time}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Phone</span>
              <span className="font-semibold text-black dark:text-white">
                {clientPhone || 'Not provided'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Measurements</span>
              <span className="font-semibold text-black dark:text-white truncate block">
                {appointment.measurement_profile?.name || 'In-Studio Sizing'}
              </span>
            </div>
          </div>

          {appointment.notes && (
            <div className="text-xs bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800">
              <span className="font-bold text-stone-800 dark:text-stone-200">Customer Note:</span> {appointment.notes}
            </div>
          )}
        </div>

        {/* Status Selection Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
            Update Appointment Status
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setSelectedStatus('CONFIRMED')}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                selectedStatus === 'CONFIRMED'
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 text-stone-600 dark:text-stone-400'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Confirm Slot</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus('CANCELLED')}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                selectedStatus === 'CANCELLED'
                  ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 text-stone-600 dark:text-stone-400'
              }`}
            >
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Cancel / Decline</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus('COMPLETED')}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                selectedStatus === 'COMPLETED'
                  ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black ring-2 ring-stone-400/20'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 text-stone-600 dark:text-stone-400'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Completed</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus('NO_SHOW')}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                selectedStatus === 'NO_SHOW'
                  ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 text-stone-600 dark:text-stone-400'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>No-Show</span>
            </button>
          </div>
        </div>

        {/* Message / Remarks for the customer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
              Message to Customer (Sent via In-App Notification)
            </label>
            <span className="text-[11px] text-stone-400">Optional</span>
          </div>

          {/* Quick template chips */}
          <div className="flex flex-wrap gap-1.5 pb-1">
            {quickTemplates.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => {
                  setMessage(t.text);
                  if (t.status) setSelectedStatus(t.status);
                }}
                className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-[11px] font-medium transition-colors cursor-pointer"
              >
                + {t.label}
              </button>
            ))}
          </div>

          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type custom message, instructions, or reason for the customer..."
            className="w-full rounded-2xl border border-stone-300 dark:border-stone-700 p-3 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:border-black dark:focus:border-white focus:outline-none"
          />

          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            🔔 {clientName} will instantly receive an in-app notification with your message and updated appointment status.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Update & Send Notification
          </Button>
        </div>
      </form>
    </Modal>
  );
};
