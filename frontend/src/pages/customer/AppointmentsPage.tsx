import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { appointmentsApi } from '../../api/appointments';
import { Appointment } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { CancellationModal } from '../../components/common/CancellationModal';
import { useToast } from '../../context/ToastContext';
import { Calendar, Clock, Plus, XCircle, Trash2 } from 'lucide-react';

export const AppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cancellation Modal State
  const [cancellationTarget, setCancellationTarget] = useState<{
    id: string;
    action: 'CANCEL' | 'DELETE';
    description: string;
  } | null>(null);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await appointmentsApi.getMy();
      const sorted = (res.data || []).slice().sort((a, b) => {
        const tA = new Date(a.updated_at || a.created_at).getTime();
        const tB = new Date(b.updated_at || b.created_at).getTime();
        return tB - tA;
      });
      setAppointments(sorted);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleOpenCancelModal = (apt: Appointment, action: 'CANCEL' | 'DELETE') => {
    const desc = `${apt.service?.name || 'Tailoring Session'} on ${new Date(apt.appointment_date).toLocaleDateString('en-IN')} at ${apt.start_time}`;
    setCancellationTarget({ id: apt.id, action, description: desc });
  };

  const handleConfirmCancellation = async (reason: string) => {
    if (!cancellationTarget) return;
    try {
      if (cancellationTarget.action === 'CANCEL') {
        await appointmentsApi.updateStatus(cancellationTarget.id, 'CANCELLED', reason);
        success('Appointment cancelled and saved in Cancelled Items section.');
      } else {
        await appointmentsApi.delete(cancellationTarget.id, reason);
        success('Appointment deleted and reason logged.');
      }
      setCancellationTarget(null);
      navigate('/cancellations');
    } catch (err: any) {
      toastError(err.message || 'Failed to process cancellation.');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white">
            My Appointments & Trial Visits
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            View upcoming consultations, past fitting visits, and cancellation history.
          </p>
        </div>

        <Link to="/appointments/book">
          <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
            Book New Slot
          </Button>
        </Link>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-8 h-8 text-black dark:text-white" />}
          title="No Appointments Scheduled"
          description="Schedule a consultation with our master tailor for measurements and styling discussion."
          actionLabel="Book an Appointment"
          onAction={() => window.location.href = '/appointments/book'}
        />
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => {
            const isEligibleCancel = apt.status === 'PENDING' || apt.status === 'CONFIRMED';
            return (
              <div
                key={apt.id}
                className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-black dark:text-white flex items-center justify-center shrink-0">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base sm:text-lg text-black dark:text-white">
                        {apt.service?.name || 'Tailoring Fitting Session'}
                      </h3>
                      <span className="text-xs text-stone-400">
                        Requested on {new Date(apt.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={apt.status} />
                    <button
                      onClick={() => handleOpenCancelModal(apt, 'DELETE')}
                      className="p-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-800 transition-colors cursor-pointer"
                      title="Delete appointment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                  <div className="bg-stone-50 dark:bg-stone-800/60 p-3 rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">Date</span>
                    <span className="font-semibold text-black dark:text-white">
                      {new Date(apt.appointment_date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="bg-stone-50 dark:bg-stone-800/60 p-3 rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">Time Slot</span>
                    <span className="font-semibold text-black dark:text-white">
                      {apt.start_time} – {apt.end_time}
                    </span>
                  </div>

                  <div className="bg-stone-50 dark:bg-stone-800/60 p-3 rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">Measurements</span>
                    <span className="font-semibold text-black dark:text-white truncate block">
                      {apt.measurement_profile?.name || 'In-Studio Measurements'}
                    </span>
                  </div>
                </div>

                {apt.notes && (
                  <div className="text-xs text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/80 p-3 rounded-xl border border-stone-200 dark:border-stone-700">
                    <span className="font-bold text-black dark:text-white">Notes:</span> {apt.notes}
                  </div>
                )}

                {/* Cancel Action if eligible */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-end gap-2">
                  {isEligibleCancel && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenCancelModal(apt, 'CANCEL')}
                      className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      leftIcon={<XCircle className="w-4 h-4" />}
                    >
                      Cancel Appointment
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenCancelModal(apt, 'DELETE')}
                    className="border-stone-200 dark:border-stone-700 text-stone-500 hover:text-rose-600 hover:border-rose-300"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Delete Record
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {cancellationTarget && (
        <CancellationModal
          isOpen={!!cancellationTarget}
          onClose={() => setCancellationTarget(null)}
          onConfirm={handleConfirmCancellation}
          title={cancellationTarget.action === 'CANCEL' ? 'Cancel Appointment' : 'Delete Appointment Record'}
          itemDescription={cancellationTarget.description}
          confirmButtonText={cancellationTarget.action === 'CANCEL' ? 'Submit Cancellation' : 'Delete Record'}
        />
      )}
    </div>
  );
};
