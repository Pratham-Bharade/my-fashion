import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertCircle, AlertTriangle, X } from 'lucide-react';

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  title: string;
  itemDescription?: string;
  confirmButtonText?: string;
  isDanger?: boolean;
}

const COMMON_REASONS = [
  'Schedule conflict / Change of plans',
  'Found another design or garment style',
  'Want to book a different date or time slot',
  'Budget or pricing consideration',
  'Accidental or duplicate booking',
  'Other reason (please describe below)',
];

export const CancellationModal: React.FC<CancellationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemDescription,
  confirmButtonText = 'Confirm Cancellation',
  isDanger = true,
}) => {
  const [selectedReasonCategory, setSelectedReasonCategory] = useState(COMMON_REASONS[0]);
  const [detailedReason, setDetailedReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = detailedReason.trim()
      ? `${selectedReasonCategory}: ${detailedReason.trim()}`
      : selectedReasonCategory;

    if (!finalReason || finalReason.length < 5) {
      setError('Please provide a brief explanation so our tailoring team understands.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirm(finalReason);
      setDetailedReason('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit cancellation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {itemDescription && (
          <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-stone-500 shrink-0" />
            <span>{itemDescription}</span>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-1">
          <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Reason Required for Admin & Tailor</span>
          </span>
          <p className="text-[11px] text-amber-800 dark:text-amber-400">
            Please let our master tailor know why you are cancelling so we can release the reserved slot or update our workshop schedule.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Reason category */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
            Select Reason <span className="text-rose-600">*</span>
          </label>
          <select
            value={selectedReasonCategory}
            onChange={(e) => setSelectedReasonCategory(e.target.value)}
            className="w-full min-h-[46px] rounded-xl border border-stone-300 dark:border-stone-700 px-3.5 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:border-black dark:focus:border-white focus:outline-none"
          >
            {COMMON_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Detailed Explanation */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
            Additional Details / Explanation <span className="text-rose-600">*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="e.g. Out of town for an urgent family function, will rebook next week..."
            value={detailedReason}
            onChange={(e) => setDetailedReason(e.target.value)}
            className="w-full rounded-xl border border-stone-300 dark:border-stone-700 p-3.5 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:border-black dark:focus:border-white focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Keep Booking
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            className={isDanger ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''}
          >
            {confirmButtonText}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
