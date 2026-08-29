import React from 'react';
import { Quotation } from '../../types';
import { StatusBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { FileText, Calendar, CheckCircle2, XCircle } from 'lucide-react';

interface QuotationCardProps {
  quotation: Quotation;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  isLoading?: boolean;
}

export const QuotationCard: React.FC<QuotationCardProps> = ({
  quotation,
  onAccept,
  onReject,
  isLoading = false,
}) => {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-base text-stone-900">
              Custom Stitching Quotation
            </h4>
            <span className="text-xs text-stone-400">
              Valid until {new Date(quotation.valid_until).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
        <StatusBadge status={quotation.status} />
      </div>

      {/* Breakup Details */}
      <div className="bg-stone-50 rounded-xl p-4 space-y-2 text-sm text-stone-600">
        <div className="flex justify-between">
          <span>Base Stitching & Pattern:</span>
          <span className="font-medium text-stone-900">₹{quotation.base_price.toLocaleString('en-IN')}</span>
        </div>
        {quotation.additional_charges > 0 && (
          <div className="flex justify-between">
            <span>Special Embroidery / Latkans / Padding:</span>
            <span className="font-medium text-stone-900">+₹{quotation.additional_charges.toLocaleString('en-IN')}</span>
          </div>
        )}
        {quotation.discount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Promotional Discount:</span>
            <span className="font-medium">-₹{quotation.discount.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="pt-2 border-t border-stone-200 flex justify-between text-base font-bold text-stone-900">
          <span>Total Quotation Amount:</span>
          <span className="font-serif text-brand-700 text-lg">
            ₹{quotation.final_amount.toLocaleString('en-IN')}
          </span>
        </div>
        {quotation.advance_amount > 0 && (
          <div className="flex justify-between text-xs text-stone-500 pt-1">
            <span>Required Advance on Confirmation:</span>
            <span className="font-semibold text-stone-800">₹{quotation.advance_amount.toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>

      {quotation.notes && (
        <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-100 text-xs text-brand-900 leading-relaxed">
          <span className="font-bold">Tailor's Note:</span> {quotation.notes}
        </div>
      )}

      {/* Actions if status is PENDING */}
      {quotation.status === 'PENDING' && onAccept && onReject && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => onReject(quotation.id)}
            isLoading={isLoading}
            leftIcon={<XCircle className="w-4 h-4 text-rose-500" />}
          >
            Decline Quote
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => onAccept(quotation.id)}
            isLoading={isLoading}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Accept & Proceed
          </Button>
        </div>
      )}
    </div>
  );
};
