import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/Badge';
import { Quotation } from '../../types';
import {
  FileText,
  User,
  Phone,
  MessageCircle,
  Send,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface AdminQuotationMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
  onSendMessage: (id: string, message: string) => Promise<void>;
}

export const AdminQuotationMessageModal: React.FC<AdminQuotationMessageModalProps> = ({
  isOpen,
  onClose,
  quotation,
  onSendMessage,
}) => {
  if (!quotation) return null;

  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = quotation.customer?.name || quotation.custom_request?.customer?.name || 'Customer';
  const clientPhone = quotation.customer?.phone || quotation.custom_request?.contact_phone;
  const garmentType = quotation.custom_request?.garment_type || 'Custom Garment';
  const cleanPhone = clientPhone ? clientPhone.replace(/\D/g, '') : '';

  const quickTemplates = [
    {
      label: 'Acceptance Received',
      text: `Thank you for accepting the quotation for your ${garmentType}! Our master tailor has reserved workshop time to start drafting your pattern.`,
    },
    {
      label: 'Fabric & Sizing',
      text: `Regarding your ${garmentType} estimate (₹${quotation.final_amount.toLocaleString('en-IN')}): please drop off your fabric or visit the boutique for measurements.`,
    },
    {
      label: 'Negotiation / Alternate Option',
      text: `We are happy to customize the embroidery or fabric options to match your budget for this ${garmentType}. Please let us know your thoughts.`,
    },
    {
      label: 'Expiry Reminder',
      text: `Your price quotation of ₹${quotation.final_amount.toLocaleString('en-IN')} is valid until ${new Date(quotation.valid_until).toLocaleDateString('en-IN')}. Please accept or reach out on WhatsApp.`,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 3) {
      setError('Please enter a message for the customer.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSendMessage(quotation.id, message.trim());
      setMessage('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Message Customer Regarding Quotation"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-stone-900 dark:text-stone-100">
        
        {/* Quotation & Customer Summary Card */}
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
                  {garmentType} Custom Stitching
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={quotation.status} />
              {cleanPhone && (
                <div className="flex items-center gap-1">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="p-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 transition-colors"
                    title="Call Customer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                      `Hello ${clientName}, regarding your ${garmentType} quotation (₹${quotation.final_amount.toLocaleString('en-IN')}) at Vandana Creations:`
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
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Final Quoted Price</span>
              <span className="font-serif font-bold text-base text-black dark:text-white">
                ₹{quotation.final_amount.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Required Advance</span>
              <span className="font-semibold text-black dark:text-white">
                ₹{quotation.advance_amount.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Validity</span>
              <span className="font-semibold text-black dark:text-white">
                Until {new Date(quotation.valid_until).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>

          {quotation.notes && (
            <div className="text-xs bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800">
              <span className="font-bold text-stone-800 dark:text-stone-200">Quotation Notes:</span> {quotation.notes}
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Message Input & Quick Templates */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
            Message Content (Sent to Customer's Notification Inbox)
          </label>

          {/* Quick template chips */}
          <div className="flex flex-wrap gap-1.5 pb-1">
            {quickTemplates.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => setMessage(t.text)}
                className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-[11px] font-medium transition-colors cursor-pointer"
              >
                + {t.label}
              </button>
            ))}
          </div>

          <textarea
            rows={4}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your update, query, or instructions for the customer regarding this quotation..."
            className="w-full rounded-2xl border border-stone-300 dark:border-stone-700 p-3 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:border-black dark:focus:border-white focus:outline-none"
          />

          <p className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
            <span>🔔 {clientName} will receive an instant high-priority notification in their user panel.</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Send Message & Notification
          </Button>
        </div>
      </form>
    </Modal>
  );
};
