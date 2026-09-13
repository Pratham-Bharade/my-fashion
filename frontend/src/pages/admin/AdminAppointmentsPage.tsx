import React, { useState, useEffect } from 'react';
import { appointmentsApi } from '../../api/appointments';
import { Appointment, AppointmentStatus } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { AdminAppointmentActionModal } from '../../components/admin/AdminAppointmentActionModal';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  UserCheck,
  Trash2,
  MessageCircle,
  Edit3
} from 'lucide-react';

const STATUS_FILTERS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending Approval' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const AdminAppointmentsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);

  // Action / Message Modal State
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await appointmentsApi.listAdmin({
        date: filterDate || undefined,
        status: (filterStatus as AppointmentStatus) || undefined,
        limit: 50,
      });
      setAppointments(res?.items || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filterDate, filterStatus]);

  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus, notes?: string) => {
    try {
      await appointmentsApi.updateStatus(id, newStatus, notes);
      success(`Appointment status updated to ${newStatus} & notification sent.`);
      fetchAppointments();
    } catch (err: any) {
      toastError(err.message || 'Failed to update status.');
      throw err;
    }
  };

  const handleDeleteAppointment = async (id: string, clientName?: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete this appointment${clientName ? ` for ${clientName}` : ''}? This action cannot be undone.`)) {
      return;
    }
    try {
      await appointmentsApi.delete(id);
      success('Appointment deleted successfully.');
      fetchAppointments();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete appointment.');
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white">
            Client Appointments & Trial Slots
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Manage visit schedules, confirm/decline slots, and send custom status updates & notifications to clients.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-auto text-xs"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="min-h-[42px] px-3 rounded-xl border border-stone-300 dark:border-stone-700 text-xs bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointment Cards List */}
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-8 h-8 text-black dark:text-white" />}
          title="No Appointments Found"
          description="No boutique consultations or trial sessions match your filter criteria."
        />
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => {
            const rawPhone = apt.contact_phone || apt.customer?.phone;
            const cleanPhone = rawPhone ? rawPhone.replace(/\D/g, '') : '';
            const isPending = apt.status === 'PENDING';

            return (
              <div
                key={apt.id}
                className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-7 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4 hover:border-stone-400 dark:hover:border-stone-600 transition-all"
              >
                {/* Header: Client & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-serif font-bold text-base sm:text-lg text-black dark:text-white">
                        {apt.customer?.name || 'Walk-in Client'}
                      </span>
                      <StatusBadge status={apt.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
                      {rawPhone && (
                        <div className="flex items-center gap-1.5 font-medium text-stone-800 dark:text-stone-200">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          <span>{rawPhone}</span>
                          <div className="flex items-center gap-1 ml-1">
                            <a
                              href={`tel:${cleanPhone}`}
                              className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-200"
                              title="Direct Phone Call"
                            >
                              Call
                            </a>
                            <a
                              href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                                `Hello ${apt.customer?.name || 'Client'}, regarding your appointment for ${apt.service?.name || 'Tailoring'} on ${new Date(apt.appointment_date).toLocaleDateString('en-IN')}:`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200"
                              title="Chat on WhatsApp"
                            >
                              WhatsApp
                            </a>
                          </div>
                        </div>
                      )}
                      {apt.customer?.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-stone-400" />
                          {apt.customer.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Top Action: Manage & Send Message */}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedAppointment(apt)}
                    leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  >
                    Confirm / Cancel / Message
                  </Button>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-stone-50 dark:bg-stone-800/60 p-4 rounded-2xl border border-stone-200 dark:border-stone-700">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-stone-400 dark:text-stone-500 block">Service Requested</span>
                    <span className="font-semibold text-black dark:text-white block">
                      {apt.service?.name || 'Bespoke Fitting'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-stone-400 dark:text-stone-500 block">Date & Time Slot</span>
                    <span className="font-semibold text-black dark:text-white block">
                      {new Date(apt.appointment_date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })} at {apt.start_time}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-stone-400 dark:text-stone-500 block">Attached Sizing</span>
                    <span className="font-semibold text-black dark:text-white block">
                      {apt.measurement_profile?.name || 'In-Studio Measurements'}
                    </span>
                  </div>
                </div>

                {apt.notes && (
                  <div className="text-xs text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/80 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700">
                    <span className="font-bold text-black dark:text-white">Customer / Atelier Note:</span> {apt.notes}
                  </div>
                )}

                {/* Bottom Action Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <div className="text-xs text-stone-400">
                    ID: <code className="text-[11px] font-mono text-stone-500">{apt.id.slice(0, 8)}</code>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED', 'Your appointment has been confirmed by the atelier.')}
                          className="border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Quick Confirm
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAppointment(apt)}
                          className="text-rose-600 hover:bg-rose-50"
                          leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        >
                          Decline
                        </Button>
                      </>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAppointment(apt.id, apt.customer?.name)}
                      className="border-stone-200 dark:border-stone-700 text-stone-500 hover:text-rose-600 hover:border-rose-300"
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Action & Message Notification Modal */}
      {selectedAppointment && (
        <AdminAppointmentActionModal
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          appointment={selectedAppointment}
          onSuccess={fetchAppointments}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};
