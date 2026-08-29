import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ordersApi } from '../../api/orders';
import { paymentsApi } from '../../api/payments';
import { Order, OrderStatus, PaymentMethod, PaymentType } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { OrderTimeline } from '../../components/customer/OrderTimeline';
import { useToast } from '../../context/ToastContext';
import {
  ShoppingBag,
  ArrowLeft,
  Scissors,
  CreditCard,
  Ruler,
  Phone,
  Mail,
  CheckCircle2,
  PlusCircle,
  Clock,
  Printer,
  Trash2
} from 'lucide-react';

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  ORDER_RECEIVED: ['MEASUREMENTS_CONFIRMED', 'CANCELLED'],
  MEASUREMENTS_CONFIRMED: ['CUTTING', 'CANCELLED'],
  CUTTING: ['STITCHING', 'CANCELLED'],
  STITCHING: ['QUALITY_CHECK', 'CANCELLED'],
  QUALITY_CHECK: ['READY', 'STITCHING', 'CANCELLED'],
  READY: ['DELIVERED', 'QUALITY_CHECK'],
  DELIVERED: [],
  CANCELLED: [],
};

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash at Boutique Counter' },
  { value: 'UPI', label: 'UPI / QR Code (GPay / PhonePe / Paytm)' },
  { value: 'CARD', label: 'Credit / Debit Card' },
  { value: 'NET_BANKING', label: 'Bank Transfer' },
];

export const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Status Change Modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedNextStatus, setSelectedNextStatus] = useState<OrderStatus>('MEASUREMENTS_CONFIRMED');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Payment Recording Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentType, setPaymentType] = useState<PaymentType>('FINAL');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await ordersApi.getById(id);
      setOrder(res.data);
    } catch (err) {
      console.error('Failed to load admin order:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const openStatusModal = (targetStatus?: OrderStatus) => {
    if (!order) return;
    const allowed = STATUS_TRANSITIONS[order.status] || [];
    setSelectedNextStatus(targetStatus || allowed[0] || 'ORDER_RECEIVED');
    setStatusNotes('');
    setIsStatusModalOpen(true);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setIsUpdatingStatus(true);
    try {
      await ordersApi.updateStatus(order.id, selectedNextStatus, statusNotes.trim() || undefined);
      success(`Order updated to ${selectedNextStatus.replace(/_/g, ' ')}.`);
      setIsStatusModalOpen(false);
      fetchOrder();
    } catch (err: any) {
      toastError(err.message || 'Failed to update order status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const openPaymentModal = () => {
    if (!order) return;
    setPaymentAmount(String(order.remaining_amount));
    setPaymentMethod('UPI');
    setPaymentType(order.advance_amount === 0 ? 'ADVANCE' : 'FINAL');
    setTransactionRef('');
    setPaymentNotes('');
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      toastError('Please enter a valid payment amount.');
      return;
    }

    setIsRecordingPayment(true);
    try {
      await paymentsApi.create({
        order_id: order.id,
        amount: amt,
        payment_method: paymentMethod,
        payment_type: paymentType,
        transaction_id: transactionRef || undefined,
        notes: paymentNotes || undefined,
      });
      success('Payment recorded successfully!');
      setIsPaymentModalOpen(false);
      fetchOrder();
    } catch (err: any) {
      toastError(err.message || 'Failed to record payment.');
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!order) return;
    if (!window.confirm(`Are you sure you want to permanently delete Order #${order.order_number}? This action cannot be undone.`)) {
      return;
    }
    try {
      await ordersApi.delete(order.id);
      success(`Order #${order.order_number} deleted successfully.`);
      navigate('/admin/orders');
    } catch (err: any) {
      toastError(err.message || 'Failed to delete order.');
    }
  };

  if (isLoading || !order) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  const allowedTransitions = STATUS_TRANSITIONS[order.status] || [];

  return (
    <div className="space-y-6 sm:space-y-8 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Back button & Delete */}
      <div className="flex items-center justify-between">
        <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-black dark:hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Production Orders
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeleteOrder}
          className="border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
        >
          Delete Order
        </Button>
      </div>

      {/* Header Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif font-bold text-2xl text-black dark:text-white">
                Order #{order.order_number}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Client: <span className="font-bold text-stone-900 dark:text-stone-100">{order.customer?.name}</span> ({order.customer?.phone})
            </p>
          </div>

          {/* Next Stage Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {allowedTransitions.map((nextSt) => (
              <Button
                key={nextSt}
                variant={nextSt === 'CANCELLED' ? 'ghost' : 'primary'}
                size="sm"
                onClick={() => openStatusModal(nextSt)}
                className={nextSt === 'CANCELLED' ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50' : ''}
              >
                Advance to {nextSt.replace(/_/g, ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Financial & Balances */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 dark:bg-stone-800/60 p-4 rounded-2xl text-xs sm:text-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 block">Total Order Price</span>
            <span className="font-serif font-bold text-lg text-black dark:text-white">₹{order.price.toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 block">Advance Collected</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">₹{order.advance_amount.toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 block">Pending Balance</span>
            <span className={`font-bold ${order.remaining_amount > 0 ? 'text-amber-700 dark:text-amber-400 font-serif text-lg' : 'text-emerald-700 dark:text-emerald-400'}`}>
              ₹{order.remaining_amount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center">
            {order.remaining_amount > 0 && (
              <Button variant="outline" size="sm" fullWidth onClick={openPaymentModal} leftIcon={<CreditCard className="w-3.5 h-3.5" />}>
                Record Payment
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Garment Details & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Production Timeline */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
          <h2 className="font-serif font-bold text-lg text-black dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-black dark:text-white" /> Production History & Stages
          </h2>
          <OrderTimeline history={order.status_history || []} currentStatus={order.status} />
        </div>

        {/* Right: Sizing & Specs */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
            <h2 className="font-serif font-bold text-base text-black dark:text-white flex items-center gap-2">
              <Ruler className="w-4 h-4 text-black dark:text-white" /> Attached Measurements
            </h2>

            {order.measurement_profile ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-900 dark:text-stone-100">{order.measurement_profile.name}</span>
                  <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] font-bold uppercase">
                    {order.measurement_profile.garment_type}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {Object.entries(order.measurement_profile.measurements || {}).map(([k, v]) => (
                    <div key={k} className="bg-stone-50 dark:bg-stone-800 p-2 rounded-xl border border-stone-100 dark:border-stone-700">
                      <span className="text-[9px] text-stone-400 block truncate">{k.replace(/_/g, ' ')}</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">{String(v)}&quot;</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-400">In-Studio Physical Measurement.</p>
            )}
          </div>
        </div>
      </div>

      {/* Advance Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Production Stage"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-stone-500 block mb-1">Target Stage</label>
            <select
              value={selectedNextStatus}
              onChange={(e) => setSelectedNextStatus(e.target.value as OrderStatus)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:outline-none"
            >
              {allowedTransitions.map((st) => (
                <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-stone-500 block mb-1">Status Note / Update Message</label>
            <textarea
              rows={3}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="e.g. Master tailor completed lining cutting..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isUpdatingStatus}>
              Confirm Status Change
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Client Payment"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <Input
            label="Payment Amount (₹)"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            required
          />

          <div>
            <label className="text-xs font-bold uppercase text-stone-500 block mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:outline-none"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <Input
            label="Transaction Reference / Note"
            placeholder="e.g. UPI Ref # / Counter Receipt"
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isRecordingPayment}>
              Save Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
