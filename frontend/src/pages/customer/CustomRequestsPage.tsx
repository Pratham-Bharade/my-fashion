import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { customRequestsApi } from '../../api/customRequests';
import { quotationsApi } from '../../api/quotations';
import { CustomRequest, Quotation } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { QuotationCard } from '../../components/customer/QuotationCard';
import { CancellationModal } from '../../components/common/CancellationModal';
import { useToast } from '../../context/ToastContext';
import { Sparkles, Plus, Calendar, FileText, Trash2 } from 'lucide-react';

export const CustomRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  // Deletion / Cancellation Modal State
  const [cancellationTarget, setCancellationTarget] = useState<{
    id: string;
    garmentType: string;
  } | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await customRequestsApi.getMy();
      const sorted = (res.data || []).slice().sort((a, b) => {
        const tA = new Date(a.updated_at || a.created_at).getTime();
        const tB = new Date(b.updated_at || b.created_at).getTime();
        return tB - tA;
      });
      // Show non-cancelled requests here (cancelled ones are in /cancellations)
      setRequests(sorted.filter((r) => r.status !== 'CANCELLED'));
    } catch (err) {
      console.error('Failed to load custom requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAcceptQuotation = async (quoteId: string) => {
    setRespondingId(quoteId);
    try {
      await quotationsApi.respond(quoteId, true);
      success('You accepted the quotation! Our boutique has been notified to initiate the order.');
      fetchRequests();
    } catch (err: any) {
      toastError(err.message || 'Failed to accept quotation.');
    } finally {
      setRespondingId(null);
    }
  };

  const handleRejectQuotation = async (quoteId: string) => {
    if (!window.confirm('Are you sure you want to decline this price quotation?')) return;
    setRespondingId(quoteId);
    try {
      await quotationsApi.respond(quoteId, false);
      success('Quotation declined and moved to Cancellations.');
      fetchRequests();
      navigate('/cancellations');
    } catch (err: any) {
      toastError(err.message || 'Failed to decline quotation.');
    } finally {
      setRespondingId(null);
    }
  };

  const handleConfirmDelete = async (reason: string) => {
    if (!cancellationTarget) return;
    try {
      await customRequestsApi.cancel(cancellationTarget.id, reason);
      success('Custom stitching request cancelled and saved in Cancelled Items.');
      setCancellationTarget(null);
      navigate('/cancellations');
    } catch (err: any) {
      toastError(err.message || 'Failed to cancel custom request.');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white">
            Custom Stitching Requests & Quotes
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Review submitted tailoring inquiries, inspirations, and price quotations prepared by our atelier.
          </p>
        </div>

        <Link to="/custom-requests/create">
          <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
            New Custom Request
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-8 h-8 text-black dark:text-white" />}
          title="No Custom Stitching Requests"
          description="Have a specific blouse neckline, saree drape, or bridal gown in mind? Submit your reference photo for a custom quote."
          actionLabel="Submit Custom Request"
          onAction={() => window.location.href = '/custom-requests/create'}
        />
      ) : (
        <div className="space-y-6">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-7 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4"
            >
              {/* Top header bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-black dark:text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-black dark:text-white">
                      {req.garment_type} Custom Stitching
                    </h3>
                    <span className="text-xs text-stone-400">
                      Submitted on {new Date(req.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={req.status} />
                  <button
                    onClick={() => setCancellationTarget({ id: req.id, garmentType: req.garment_type })}
                    className="p-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-800 transition-colors cursor-pointer"
                    title="Cancel & Delete Request"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                {req.description}
              </p>

              {/* Specifications grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-stone-50 dark:bg-stone-800/60 p-4 rounded-2xl border border-stone-200 dark:border-stone-700">
                {req.fabric && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-stone-400 dark:text-stone-500 block">Fabric</span>
                    <span className="font-semibold text-black dark:text-white">{req.fabric}</span>
                  </div>
                )}
                {req.preferred_color && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-stone-400 dark:text-stone-500 block">Color</span>
                    <span className="font-semibold text-black dark:text-white">{req.preferred_color}</span>
                  </div>
                )}
                {req.occasion && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-stone-400 dark:text-stone-500 block">Occasion</span>
                    <span className="font-semibold text-black dark:text-white">{req.occasion}</span>
                  </div>
                )}
                {req.required_date && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-stone-400 dark:text-stone-500 block">Needed By</span>
                    <span className="font-semibold text-black dark:text-white">
                      {new Date(req.required_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                )}
              </div>

              {/* Inspiration images thumbnail strip */}
              {req.images && req.images.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase text-stone-500 dark:text-stone-400 block">
                    Attached Inspirations ({req.images.length})
                  </span>
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    {req.images.map((img) => (
                      <a
                        key={img.id}
                        href={img.file_path}
                        target="_blank"
                        rel="noreferrer"
                        className="w-20 h-20 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shrink-0 hover:opacity-90"
                      >
                        <img src={img.file_path} alt="Inspiration" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Attached Quotations */}
              {req.quotations && req.quotations.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="font-serif font-bold text-sm text-black dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-black dark:text-white" />
                    Quotation Prepared by Master Tailor
                  </h4>
                  {req.quotations.map((quote) => (
                    <QuotationCard
                      key={quote.id}
                      quotation={quote}
                      onAccept={handleAcceptQuotation}
                      onReject={handleRejectQuotation}
                      isLoading={respondingId === quote.id}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {cancellationTarget && (
        <CancellationModal
          isOpen={!!cancellationTarget}
          onClose={() => setCancellationTarget(null)}
          onConfirm={handleConfirmDelete}
          title="Cancel Custom Stitching Request"
          itemDescription={`Custom request for '${cancellationTarget.garmentType}'`}
          confirmButtonText="Cancel & Delete Request"
        />
      )}
    </div>
  );
};
