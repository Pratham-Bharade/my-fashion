import React, { useState, useEffect } from 'react';
import { reviewsApi } from '../../api/reviews';
import { Review, ReviewStatus } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import { Star, CheckCircle2, EyeOff, Trash2 } from 'lucide-react';

export const AdminReviewsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await reviewsApi.listAdmin({ limit: 50 });
      setReviews(res.items);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: ReviewStatus) => {
    try {
      await reviewsApi.updateStatus(id, newStatus);
      success(`Review status changed to ${newStatus}.`);
      fetchReviews();
    } catch (err: any) {
      toastError(err.message || 'Failed to update review status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      await reviewsApi.delete(id);
      success('Review deleted.');
      fetchReviews();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete review.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif font-bold text-2xl text-stone-900">
          Customer Reviews & Testimonial Moderation
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Approve or hide customer ratings and comments displayed on the storefront.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<Star className="w-8 h-8" />}
          title="No Reviews Submitted"
          description="Customer reviews submitted upon order delivery will appear here for moderation."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-stone-900">
                      {r.customer?.name || 'Customer'}
                    </span>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="flex items-center gap-1 text-gold-500">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold-400" />
                    ))}
                    <span className="text-xs text-stone-400 ml-2">
                      Order #{r.order?.order_number} • {new Date(r.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Moderation Actions */}
                <div className="flex items-center gap-2">
                  {r.status !== 'APPROVED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateStatus(r.id, 'APPROVED')}
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Approve & Publish
                    </Button>
                  )}
                  {r.status !== 'HIDDEN' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(r.id, 'HIDDEN')}
                      leftIcon={<EyeOff className="w-3.5 h-3.5" />}
                    >
                      Hide
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(r.id)}
                    className="text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <p className="text-sm text-stone-700 italic bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
                "{r.comment}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
