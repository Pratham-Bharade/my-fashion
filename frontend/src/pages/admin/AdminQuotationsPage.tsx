import React, { useState, useEffect } from 'react';
import { quotationsApi } from '../../api/quotations';
import { Quotation, QuotationStatus } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { AdminQuotationMessageModal } from '../../components/admin/AdminQuotationMessageModal';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  CheckCircle2,
  Phone,
  Mail,
  ShoppingBag,
  MessageCircle,
  Edit3,
  Trash2,
  User,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const STATUS_FILTERS: Array<{ value: QuotationStatus | ''; label: string }> = [
  { value: '', label: 'All Quotations' },
  { value: 'PENDING', label: 'Pending Response' },
  { value: 'ACCEPTED', label: 'Accepted by User' },
  { value: 'REJECTED', label: 'Declined / Rejected' },
  { value: 'EXPIRED', label: 'Expired' },
];

export const AdminQuotationsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [filterStatus, setFilterStatus] = useState<QuotationStatus | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  // Message Modal State
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  const fetchQuotations = async () => {
    setIsLoading(true);
    try {
      const res = await quotationsApi.listAdmin({
        status: filterStatus || undefined,
        search: searchTerm.trim() || undefined,
        limit: 50,
      });
      setQuotations(res.items || []);
    } catch (err) {
      console.error('Failed to load quotations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [filterStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuotations();
  };

  const handleConvertToOrder = async (quoteId: string) => {
    setConvertingId(quoteId);
    try {
      await quotationsApi.convertToOrder(quoteId);
      success('Quotation converted into active Stitching Order!');
      fetchQuotations();
    } catch (err: any) {
      toastError(err.message || 'Failed to convert quotation.');
    } finally {
      setConvertingId(null);
    }
  };

  const handleSendMessage = async (id: string, message: string) => {
    try {
      await quotationsApi.sendMessage(id, message);
      success('Message sent & in-app notification delivered to the customer.');
      fetchQuotations();
    } catch (err: any) {
      toastError(err.message || 'Failed to send message.');
      throw err;
    }
  };

  const handleDeleteQuotation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quotation record?')) return;
    try {
      await quotationsApi.delete(id);
      success('Quotation deleted successfully.');
      fetchQuotations();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete quotation.');
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white">
            Custom Stitching Quotations
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Track user accepted & declined estimates, convert approved quotes to orders, and message customers directly.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Search by client name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 sm:w-60 text-xs"
            />
          </form>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="min-h-[42px] px-3 rounded-xl border border-stone-300 dark:border-stone-700 text-xs bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quotations List */}
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : quotations.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8 text-black dark:text-white" />}
          title="No Quotations Found"
          description="Prepare custom price estimates from the Custom Requests section."
        />
      ) : (
        <div className="space-y-5">
          {quotations.map((q) => {
            const clientName = q.customer?.name || q.custom_request?.customer?.name || 'Customer';
            const rawPhone = q.customer?.phone || q.custom_request?.contact_phone;
            const cleanPhone = rawPhone ? rawPhone.replace(/\D/g, '') : '';
            const garmentName = q.custom_request?.garment_type || 'Custom Stitching';
            const isAccepted = q.status === 'ACCEPTED';
            const isRejected = q.status === 'REJECTED';

            return (
              <div
                key={q.id}
                className={`bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-7 border shadow-2xs space-y-4 transition-all ${
                  isAccepted
                    ? 'border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-500/10'
                    : isRejected
                    ? 'border-rose-200 dark:border-rose-900/60'
                    : 'border-stone-200 dark:border-stone-800'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-serif font-bold text-base sm:text-lg text-black dark:text-white">
                        {garmentName} • {clientName}
                      </span>
                      <StatusBadge status={q.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
                      <span>
                        Created {new Date(q.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • Valid until {new Date(q.valid_until).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {rawPhone && (
                        <div className="flex items-center gap-1.5 font-medium text-stone-800 dark:text-stone-200 ml-1">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          <span>{rawPhone}</span>
                          <div className="flex items-center gap-1 ml-1">
                            <a
                              href={`tel:${cleanPhone}`}
                              className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-200"
                              title="Call Client"
                            >
                              Call
                            </a>
                            <a
                              href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                                `Hello ${clientName}, regarding your ${garmentName} quotation (₹${q.final_amount.toLocaleString('en-IN')}) at Vandana Creations:`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200"
                              title="WhatsApp Client"
                            >
                              WhatsApp
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-stone-400 font-bold uppercase block leading-none">Final Amount</span>
                      <span className="font-serif font-bold text-xl text-black dark:text-white">
                        ₹{q.final_amount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedQuotation(q)}
                      leftIcon={<MessageCircle className="w-3.5 h-3.5" />}
                    >
                      Message User
                    </Button>
                  </div>
                </div>

                {/* Price Breakdown Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-stone-50 dark:bg-stone-800/60 p-4 rounded-2xl border border-stone-200 dark:border-stone-700">
                  <div>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-bold block">Base Tailoring</span>
                    <span className="font-semibold text-black dark:text-white">₹{q.base_price.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-bold block">Additional / Latkans</span>
                    <span className="font-semibold text-black dark:text-white">+₹{q.additional_charges.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-bold block">Discount</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">-₹{q.discount.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-bold block">Required Advance</span>
                    <span className="font-semibold text-black dark:text-white">₹{q.advance_amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Acceptance / Decline Notice */}
                {isAccepted && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Customer has Accepted this Quotation! You can now convert it to a production order.</span>
                    </span>
                  </div>
                )}

                {isRejected && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Customer declined this quotation. You can message them with revised pricing or alternate designs.</span>
                  </div>
                )}

                {q.notes && (
                  <div className="text-xs text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/80 p-3 rounded-xl border border-stone-200 dark:border-stone-700 whitespace-pre-line">
                    <span className="font-bold text-black dark:text-white">History & Notes:</span> {q.notes}
                  </div>
                )}

                {/* Footer Action */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <span className="text-[11px] text-stone-400 font-mono">
                    ID: {q.id.slice(0, 8)}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Action: Convert to Order if ACCEPTED */}
                    {isAccepted && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleConvertToOrder(q.id)}
                        isLoading={convertingId === q.id}
                        leftIcon={<ShoppingBag className="w-4 h-4" />}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Convert to Production Order
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedQuotation(q)}
                      leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                    >
                      Message Customer
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuotation(q.id)}
                      className="text-stone-400 hover:text-rose-600"
                      title="Delete quotation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Message Modal */}
      {selectedQuotation && (
        <AdminQuotationMessageModal
          isOpen={!!selectedQuotation}
          onClose={() => setSelectedQuotation(null)}
          quotation={selectedQuotation}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
};
