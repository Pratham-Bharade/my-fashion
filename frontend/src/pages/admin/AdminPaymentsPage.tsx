import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paymentsApi } from '../../api/payments';
import { Payment } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { CreditCard, Phone, Calendar, ArrowRight } from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await paymentsApi.listAdmin({ limit: 50 });
        setPayments(res.items);
      } catch (err) {
        console.error('Failed to load payments:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif font-bold text-2xl text-stone-900">
          Payment Transactions & Cash Receipts
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Audit log of all advances, balance settlements, and payment methods recorded.
        </p>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-8 h-8" />}
          title="No Payments Logged"
          description="Payments recorded against tailoring orders will be listed here."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="divide-y divide-stone-100">
            {payments.map((p) => (
              <div
                key={p.id}
                className="p-5 sm:p-6 hover:bg-stone-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-stone-900">
                        {p.customer?.name || 'Customer'}
                      </span>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 text-xs text-stone-500">
                      <span>Order #{p.order?.order_number}</span>
                      <span>Method: <strong className="text-stone-800">{p.payment_method}</strong></span>
                      {p.transaction_id && <span>Ref: {p.transaction_id}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <div className="text-left sm:text-right">
                    <span className="font-serif font-bold text-lg text-emerald-800 block">
                      +₹{p.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {new Date(p.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <Link to={`/admin/orders/${p.order_id}`}>
                    <Button variant="outline" size="sm">
                      View Order
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
