import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersApi } from '../../api/orders';
import { Order, OrderStatus } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { OrderTimeline } from '../../components/customer/OrderTimeline';
import { ReviewModal } from '../../components/customer/ReviewModal';
import {
  ShoppingBag,
  Clock,
  CreditCard,
  Ruler,
  Star,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Scissors,
  MessageCircle
} from 'lucide-react';

const getProgressPercent = (status: OrderStatus) => {
  switch (status) {
    case 'ORDER_RECEIVED':
      return 15;
    case 'MEASUREMENTS_CONFIRMED':
      return 30;
    case 'CUTTING':
      return 50;
    case 'STITCHING':
      return 70;
    case 'QUALITY_CHECK':
      return 85;
    case 'READY':
      return 95;
    case 'DELIVERED':
      return 100;
    case 'CANCELLED':
      return 0;
    default:
      return 15;
  }
};

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const fetchOrderDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await ordersApi.getById(id);
      setOrder(res.data);
    } catch (err) {
      console.error('Failed to load order detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold font-serif text-black dark:text-white">Booking Not Found</h2>
        <p className="text-xs text-stone-500 dark:text-stone-400">The requested tailoring booking does not exist or has been removed.</p>
        <Link to="/orders">
          <Button variant="primary">Return to Bookings</Button>
        </Link>
      </div>
    );
  }

  const isDelivered = order.status === 'DELIVERED';
  const percent = getProgressPercent(order.status);
  const whatsappUrl = `https://wa.me/919322228426?text=${encodeURIComponent(
    `Hello Vandana Creations! I have a question regarding my tailoring order #${order.order_number} (${order.service?.name || order.notes || 'Custom Stitching'}).`
  )}`;

  return (
    <div className="space-y-6 sm:space-y-8 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors pb-12">
      {/* Back button */}
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to My Bookings
      </Link>

      {/* Header Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif font-bold text-xl sm:text-2xl text-black dark:text-white">
                Booking #{order.order_number}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Direct WhatsApp Tailor Action */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Tailor</span>
            </a>

            {/* Review Button if Delivered */}
            {isDelivered && !order.review && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReviewModalOpen(true)}
                leftIcon={<Star className="w-4 h-4 text-amber-500" />}
              >
                Review Fitting
              </Button>
            )}
          </div>
        </div>

        {/* Live Progress Bar Section */}
        <div className="space-y-2 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Scissors className="w-4 h-4 text-black dark:text-white" />
              <span>How far has your garment reached:</span>
            </span>
            <span className="font-serif font-bold text-xs text-black dark:text-white">
              {percent}% Completed
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${
                order.status === 'CANCELLED'
                  ? 'bg-rose-500'
                  : percent >= 95
                  ? 'bg-emerald-500'
                  : 'bg-black dark:bg-white'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Financial & Garment Quick Overview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 dark:bg-stone-800/80 p-4 rounded-2xl text-xs sm:text-sm border border-stone-200 dark:border-stone-700">
          <div>
            <span className="text-[10px] font-bold uppercase text-stone-400 dark:text-stone-500 block">Garment / Service</span>
            <span className="font-semibold text-black dark:text-white truncate block">
              {order.service?.name || order.design?.title || order.notes || 'Bespoke Outfit'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-stone-400 dark:text-stone-500 block">Total Price</span>
            <span className="font-serif font-bold text-black dark:text-white text-base">
              ₹{order.price.toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-stone-400 dark:text-stone-500 block">Advance Paid</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              ₹{order.advance_amount.toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-stone-400 dark:text-stone-500 block">Remaining Balance</span>
            <span className={`font-bold ${order.remaining_amount > 0 ? 'text-amber-600 dark:text-amber-400 font-serif text-base' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {order.remaining_amount > 0 ? `₹${order.remaining_amount.toLocaleString('en-IN')}` : 'Paid in Full ✓'}
            </span>
          </div>
        </div>

        {order.notes && (
          <div className="text-xs text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700">
            <span className="font-bold text-black dark:text-white">Custom Tailoring Specs:</span> {order.notes}
          </div>
        )}
      </div>

      {/* Vertical Live Stitching Progress Timeline */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div>
          <h2 className="font-serif font-bold text-lg text-black dark:text-white">
            Live Tailoring Production Milestones
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Track every phase of fabric pattern drafting, cutting, artisan stitching, and final quality inspection.
          </p>
        </div>

        <OrderTimeline
          currentStatus={order.status}
          history={order.status_history}
        />
      </div>

      {/* Applied Measurement Profile */}
      {order.measurement_profile && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 text-black dark:text-white flex items-center justify-center">
              <Ruler className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-black dark:text-white">
                Applied Measurement Specifications: {order.measurement_profile.name}
              </h3>
              <span className="text-xs text-stone-400 dark:text-stone-500 font-semibold uppercase">
                {order.measurement_profile.garment_type}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2.5 bg-stone-50 dark:bg-stone-800/60 p-4 rounded-2xl text-xs border border-stone-200 dark:border-stone-700">
            {Object.entries(order.measurement_profile.measurements || {}).map(([k, v]) => (
              <div key={k} className="bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800">
                <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-tight block">
                  {k.replace(/_/g, ' ')}
                </span>
                <span className="font-bold text-black dark:text-white text-sm">{v}&quot;</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        orderId={order.id}
        orderNumber={order.order_number}
        onSuccess={fetchOrderDetail}
      />
    </div>
  );
};
