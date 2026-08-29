import React, { useState, useEffect } from 'react';
import { customRequestsApi } from '../../api/customRequests';
import { quotationsApi } from '../../api/quotations';
import { CustomRequest, CustomRequestStatus } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import { Sparkles, FileText, Phone, Mail, CheckCircle2, ArrowRight, Trash2, AlertCircle } from 'lucide-react';

const COMMON_REASONS = [
  'Requested fabric/material is currently out of stock.',
  'Cannot complete this intricate design within the requested deadline.',
  'Reference images are unclear; please re-submit with higher resolution photos.',
  'Design requirements outside current atelier tailoring scope.',
  'Customer requested cancellation over call/chat.',
];

export const AdminCustomRequestsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quote Generation Modal state
  const [selectedReqForQuote, setSelectedReqForQuote] = useState<CustomRequest | null>(null);
  const [basePrice, setBasePrice] = useState('1500');
  const [additionalCharges, setAdditionalCharges] = useState('0');
  const [discount, setDiscount] = useState('0');
  const [advanceAmount, setAdvanceAmount] = useState('500');
  const [validDays, setValidDays] = useState('7');
  const [notes, setNotes] = useState('');
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);

  // Delete Request Modal state
  const [selectedReqForDelete, setSelectedReqForDelete] = useState<CustomRequest | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await customRequestsApi.listAdmin({ limit: 50 });
      setRequests(res.items);
    } catch (err) {
      console.error('Failed to load custom requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openQuoteModal = (req: CustomRequest) => {
    setSelectedReqForQuote(req);
    setBasePrice('1500');
    setAdditionalCharges('0');
    setDiscount('0');
    setAdvanceAmount('500');
    setValidDays('7');
    setNotes('Includes pure cotton canvas lining and handcrafted latkans.');
  };

  const openDeleteModal = (req: CustomRequest) => {
    setSelectedReqForDelete(req);
    setDeleteReason('');
  };

  const calculatedFinal = Math.max(
    0,
    (parseFloat(basePrice) || 0) + (parseFloat(additionalCharges) || 0) - (parseFloat(discount) || 0)
  );

  const handleGenerateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqForQuote) return;

    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + (parseInt(validDays, 10) || 7));

    setIsGeneratingQuote(true);
    try {
      await quotationsApi.create({
        custom_request_id: selectedReqForQuote.id,
        base_price: parseFloat(basePrice) || 0,
        additional_charges: parseFloat(additionalCharges) || 0,
        discount: parseFloat(discount) || 0,
        advance_amount: parseFloat(advanceAmount) || 0,
        valid_until: validUntilDate.toISOString().split('T')[0],
        notes: notes.trim() || undefined,
      });

      success('Quotation generated and notification sent to customer account.');
      setSelectedReqForQuote(null);
      fetchRequests();
    } catch (err: any) {
      toastError(err.message || 'Failed to generate quotation.');
    } finally {
      setIsGeneratingQuote(false);
    }
  };

  const handleDeleteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqForDelete) return;

    setIsDeleting(true);
    try {
      await customRequestsApi.delete(selectedReqForDelete.id, deleteReason.trim() || undefined);
      success(`Custom request for '${selectedReqForDelete.garment_type}' deleted. Customer notified.`);
      setSelectedReqForDelete(null);
      fetchRequests();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete custom request.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Header */}
      <div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white">
          Custom Stitching Inquiries & Inspiration Reviews
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
          Review customer uploaded photo inspirations, fabric details, prepare price quotations, or decline with feedback.
        </p>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-8 h-8" />}
          title="No Custom Requests"
          description="Customer submitted custom requests will appear here."
        />
      ) : (
        <div className="space-y-6">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-7 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-5"
            >
              {/* Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-black dark:text-white flex items-center justify-center font-bold font-serif shrink-0">
                    {req.customer?.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-black dark:text-white">
                      {req.customer?.name || 'Customer'} — {req.garment_type}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      <a
                        href={`tel:${req.contact_phone || req.customer?.phone}`}
                        className="flex items-center gap-1 font-semibold text-stone-900 dark:text-stone-100 hover:text-emerald-600 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>+91 {req.contact_phone || req.customer?.phone || 'Not provided'}</span>
                      </a>
                      {(req.contact_phone || req.customer?.phone) && (
                        <a
                          href={`https://wa.me/91${(req.contact_phone || req.customer?.phone || '').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold hover:bg-emerald-200 transition-colors"
                        >
                          💬 WhatsApp
                        </a>
                      )}
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {req.customer?.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={req.status} />
                  <button
                    onClick={() => openDeleteModal(req)}
                    className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                    title="Delete Request and Send Reason"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description & Specifications */}
              <div className="space-y-3">
                <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-100 dark:border-stone-800 space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">Customer Request Description</span>
                  <p className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-medium">
                    {req.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-stone-50 dark:bg-stone-800/60 p-2.5 rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-stone-400 dark:text-stone-500 block">Fabric</span>
                    <span className="font-semibold text-black dark:text-white">{req.fabric || 'Customer Fabric'}</span>
                  </div>
                  <div className="bg-stone-50 dark:bg-stone-800/60 p-2.5 rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-stone-400 dark:text-stone-500 block">Color</span>
                    <span className="font-semibold text-black dark:text-white">{req.preferred_color || 'As discussed'}</span>
                  </div>
                  <div className="bg-stone-50 dark:bg-stone-800/60 p-2.5 rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-stone-400 dark:text-stone-500 block">Occasion</span>
                    <span className="font-semibold text-black dark:text-white">{req.occasion || 'Standard'}</span>
                  </div>
                  <div className="bg-stone-50 dark:bg-stone-800/60 p-2.5 rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-stone-400 dark:text-stone-500 block">Required By</span>
                    <span className="font-semibold text-black dark:text-white">
                      {req.required_date ? new Date(req.required_date).toLocaleDateString('en-IN') : 'Flexible'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attached Photos */}
              {req.images && req.images.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-stone-500 dark:text-stone-400 block">
                    Uploaded Reference Photos ({req.images.length})
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {req.images.map((img) => (
                      <a
                        key={img.id}
                        href={img.file_path}
                        target="_blank"
                        rel="noreferrer"
                        className="w-24 h-24 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 hover:opacity-90 shadow-2xs"
                      >
                        <img src={img.file_path} alt="Reference" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDeleteModal(req)}
                  className="border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Delete Request
                </Button>

                {req.status === 'SUBMITTED' || req.status === 'REVIEWING' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openQuoteModal(req)}
                    leftIcon={<FileText className="w-4 h-4" />}
                  >
                    Generate Price Quotation
                  </Button>
                ) : (
                  <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                    Quotation processed ({req.status.replace(/_/g, ' ')})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quote Generation Modal */}
      {selectedReqForQuote && (
        <Modal
          isOpen={!!selectedReqForQuote}
          onClose={() => setSelectedReqForQuote(null)}
          title="Prepare Price Quotation"
          subtitle={`For ${selectedReqForQuote.customer?.name} • ${selectedReqForQuote.garment_type}`}
          maxWidth="md"
        >
          <form onSubmit={handleGenerateQuote} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Base Stitching (₹)"
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                required
              />
              <Input
                label="Extra Embroidery / Latkans (₹)"
                type="number"
                value={additionalCharges}
                onChange={(e) => setAdditionalCharges(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Discount (₹)"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
              <Input
                label="Required Advance (₹)"
                type="number"
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(e.target.value)}
              />
            </div>

            {/* Live Calculated Total Banner */}
            <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-stone-700 dark:text-stone-300">Final Quotation Amount:</span>
              <span className="font-serif font-bold text-2xl text-black dark:text-white">
                ₹{calculatedFinal.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Valid For (Days)"
                type="number"
                value={validDays}
                onChange={(e) => setValidDays(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
                Tailor Note for Customer
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Details on lining, finishing, and delivery..."
                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 p-3 text-sm focus:border-black dark:focus:border-white focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setSelectedReqForQuote(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isGeneratingQuote}>
                Send Quotation to Client
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete / Decline Modal with Reason */}
      {selectedReqForDelete && (
        <Modal
          isOpen={!!selectedReqForDelete}
          onClose={() => setSelectedReqForDelete(null)}
          title="Delete / Cancel Custom Request"
          subtitle={`For ${selectedReqForDelete.customer?.name} • ${selectedReqForDelete.garment_type}`}
          maxWidth="md"
        >
          <form onSubmit={handleDeleteRequest} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600" /> Customer Will Be Notified
              </div>
              <p>
                When you delete this request, an automatic notification will be sent to <strong>{selectedReqForDelete.customer?.name}</strong> containing the reason you provide below.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
                Reason for Cancellation / Deletion <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Please state why this custom request cannot be fulfilled..."
                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 p-3 text-xs sm:text-sm focus:outline-none"
              />
            </div>

            {/* Quick Reason Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">
                Quick Reason Suggestions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setDeleteReason(r)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer text-left"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-stone-100 dark:border-stone-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedReqForDelete(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete & Notify Client
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
