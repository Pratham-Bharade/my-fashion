import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paymentsApi } from '../../api/payments';
import { Payment } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { CreditCard, ArrowRight } from 'lucide-react';

export const CustomerPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await paymentsApi.getMy();
        setPayments(res.data);
      } catch (err) {
        console.error('Failed to load customer payments:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-serif font-bold text-2xl text-stone-900">
          Payment Receipts & Invoices
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          History of all advances, UPI payments, and final settlements made for your tailoring orders.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-8 h-8" />}
          title="No Payment Records"
          description="Your payment receipts will appear here once you place a tailoring order."
        />
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-stone-900">
                      Payment for Order #{p.order?.order_number}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 text-xs text-stone-500">
                    <span>Method: <strong className="text-stone-800">{p.payment_method}</strong></span>
                    <span>• {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {p.transaction_id && <span>• Ref: {p.transaction_id}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <span className="font-serif font-bold text-xl text-emerald-800">
                  ₹{p.amount.toLocaleString('en-IN')}
                </span>

                <Link
                  to={`/orders/${p.order_id}`}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                >
                  View Order <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
