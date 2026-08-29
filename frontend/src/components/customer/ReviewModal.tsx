import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Star } from 'lucide-react';
import { reviewsApi } from '../../api/reviews';
import { useToast } from '../../context/ToastContext';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  onSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || comment.length < 5) {
      setError('Please provide at least 5 characters for your review feedback.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await reviewsApi.submit({
        order_id: orderId,
        rating,
        comment: comment.trim(),
      });
      success('Thank you! Your review was submitted for approval.');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Leave Tailoring Feedback"
      subtitle={`Order #${orderNumber}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Star Rating Selector */}
        <div className="flex flex-col items-center justify-center p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            How was the fit & finish?
          </span>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const filled = star <= (hoverRating || rating);
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-gold-500 transition-transform active:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      filled ? 'fill-gold-400 text-gold-500' : 'text-stone-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <span className="text-xs font-semibold text-stone-700">
            {rating === 5 && '⭐️⭐️⭐️⭐️⭐️ Exceptional Master Fit!'}
            {rating === 4 && '⭐️⭐️⭐️⭐️ Great Quality & Stitching'}
            {rating === 3 && '⭐️⭐️⭐️ Average / Acceptable'}
            {rating === 2 && '⭐️⭐️ Needs Improvement'}
            {rating === 1 && '⭐️ Unsatisfied'}
          </span>
        </div>

        {/* Text Review */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 block">
            Your Experience / Review <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts on the fitting, fabric handling, embroidery, latkans, and boutique service..."
            className="w-full rounded-xl border border-stone-300 p-3.5 text-sm text-stone-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100 resize-none transition-all"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};
