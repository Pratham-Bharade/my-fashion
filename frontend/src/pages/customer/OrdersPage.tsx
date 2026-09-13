import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api/orders';
import { appointmentsApi } from '../../api/appointments';
import { customRequestsApi } from '../../api/customRequests';
import { Order, Appointment, CustomRequest, OrderStatus } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { CancellationModal } from '../../components/common/CancellationModal';
import { BookingTrackModal } from '../../components/customer/BookingTrackModal';
import { useToast } from '../../context/ToastContext';
import {
  ShoppingBag,
  ChevronRight,
  Calendar,
  Sparkles,
  Clock,
  ArrowRight,
  Trash2,
  Scissors,
  CheckCircle2,
  Activity,
  BellRing
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

const getStageLabel = (status: OrderStatus) => {
  switch (status) {
    case 'ORDER_RECEIVED':
      return 'Stage 1 of 7 • Booking Received & Fabric Checked';
    case 'MEASUREMENTS_CONFIRMED':
      return 'Stage 2 of 7 • Measurements Verified by Tailor';
    case 'CUTTING':
      return 'Stage 3 of 7 • Pattern Cutting In Progress';
    case 'STITCHING':
      return 'Stage 4 of 7 • Artisan Stitching on Machine';
    case 'QUALITY_CHECK':
      return 'Stage 5 of 7 • Quality Inspection & Ironing';
    case 'READY':
      return 'Stage 6 of 7 • Ready for Trial / Boutique Pickup';
    case 'DELIVERED':
      return 'Stage 7 of 7 • Completed & Handed Over ✓';
    case 'CANCELLED':
      return 'Booking Cancelled';
    default:
      return 'In Progress';
  }
};

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'orders' | 'appointments' | 'requests'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Live Tracking Modal State
  const [trackingItem, setTrackingItem] = useState<{
    type: 'ORDER' | 'APPOINTMENT';
    order?: Order;
    appointment?: Appointment;
  } | null>(null);

  // Cancellation Modal State
  const [cancellationTarget, setCancellationTarget] = useState<{
    id: string;
    type: 'ORDER' | 'APPOINTMENT';
    title: string;
    description: string;
  } | null>(null);

  const fetchAllData = async () => {
    try {
      const [ordRes, aptRes, reqRes] = await Promise.all([
        ordersApi.getMy(),
        appointmentsApi.getMy(),
        customRequestsApi.getMy(),
      ]);

      // Sort all sets by updated_at descending so recently notified/updated items appear first
      const sortDesc = (items: any[]) =>
        (items || []).slice().sort((a, b) => {
          const tA = new Date(a.updated_at || a.created_at).getTime();
          const tB = new Date(b.updated_at || b.created_at).getTime();
          return tB - tA;
        });

      const nonCancelledOrders = (ordRes?.data || []).filter((o) => o?.status && o.status !== 'CANCELLED');
      const nonCancelledAppointments = (aptRes?.data || []).filter((a) => a?.status && a.status !== 'CANCELLED');
      const nonCancelledRequests = (reqRes?.data || []).filter((r) => r?.status && r.status !== 'CANCELLED');

      setOrders(sortDesc(nonCancelledOrders));
      setAppointments(sortDesc(nonCancelledAppointments));
      setCustomRequests(sortDesc(nonCancelledRequests));
    } catch (err) {
      console.error('Failed to load customer orders/bookings:', err);
      setOrders([]);
      setAppointments([]);
      setCustomRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleOpenCancelModal = (e: React.MouseEvent, target: { id: string; type: 'ORDER' | 'APPOINTMENT'; title: string; description: string }) => {
    e.preventDefault();
    e.stopPropagation();
    setCancellationTarget(target);
  };

  const handleConfirmCancellation = async (reason: string) => {
    if (!cancellationTarget) return;
    try {
      if (cancellationTarget.type === 'ORDER') {
        await ordersApi.cancel(cancellationTarget.id, reason);
        success(`Booking cancelled and saved in Cancelled Items section.`);
      } else {
        await appointmentsApi.updateStatus(cancellationTarget.id, 'CANCELLED', reason);
        success(`Appointment cancelled and saved in Cancelled Items section.`);
      }
      setCancellationTarget(null);
      navigate('/cancellations');
    } catch (err: any) {
      toastError(err.message || 'Failed to cancel.');
    }
  };

  const totalCount = orders.length + appointments.length + customRequests.length;

  // Unified items list for "All Items" tab sorted by latest updated activity
  const unifiedItems = [
    ...orders.map((o) => ({ type: 'ORDER' as const, data: o, time: new Date(o.updated_at || o.created_at).getTime() })),
    ...appointments.map((a) => ({ type: 'APPOINTMENT' as const, data: a, time: new Date(a.updated_at || a.created_at).getTime() })),
    ...customRequests.map((r) => ({ type: 'REQUEST' as const, data: r, time: new Date(r.updated_at || r.created_at).getTime() })),
  ].sort((a, b) => b.time - a.time);

  const renderOrderCard = (order: Order) => {
    const percent = getProgressPercent(order.status);
    const stageLabel = getStageLabel(order.status);

    return (
      <div
        key={order.id}
        className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-7 border border-stone-200 dark:border-stone-800 shadow-2xs hover:border-stone-400 dark:hover:border-stone-600 transition-all group relative overflow-hidden space-y-3"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Link
                to={`/orders/${order.id}`}
                className="font-serif font-bold text-base sm:text-lg text-black dark:text-white hover:underline transition-colors"
              >
                Order #{order.order_number}
              </Link>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Booked on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase block leading-none">Total Amount</span>
              <span className="font-serif font-bold text-lg sm:text-xl text-black dark:text-white">
                ₹{order.price.toLocaleString('en-IN')}
              </span>
            </div>
            <button
              onClick={(e) =>
                handleOpenCancelModal(e, {
                  id: order.id,
                  type: 'ORDER',
                  title: `Cancel Stitching Order #${order.order_number}`,
                  description: `Order #${order.order_number} (${order.service?.name || order.notes || 'Bespoke Tailoring'})`,
                })
              }
              className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-800 transition-colors cursor-pointer"
              title="Cancel & Delete Order"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Garment Details & Expected Delivery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 block">Garment / Service</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200 truncate block">
              {order.service?.name || order.design?.title || order.notes || 'Bespoke Tailoring'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 block">Target Delivery</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              {order.expected_delivery_date
                ? new Date(order.expected_delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'Scheduled with boutique master'}
            </span>
          </div>
        </div>

        {/* LIVE MILESTONE PROGRESS TRACKER */}
        <div className="mt-2 pt-3.5 border-t border-stone-100 dark:border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>{stageLabel}</span>
            </span>
            <span className="font-serif font-bold text-xs text-black dark:text-white">
              {percent}% Complete
            </span>
          </div>

          {/* Progress bar line */}
          <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
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

        {/* Action Buttons: Track Progress & Full Detail */}
        <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-100 dark:border-stone-800">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTrackingItem({ type: 'ORDER', order })}
            leftIcon={<Activity className="w-3.5 h-3.5 text-black dark:text-white" />}
            className="border-stone-300 dark:border-stone-700"
          >
            Track Progress
          </Button>

          <Link
            to={`/orders/${order.id}`}
            className="text-xs font-semibold text-black dark:text-white hover:underline inline-flex items-center gap-1"
          >
            Full Details & Measurements <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  };

  const renderAppointmentCard = (apt: Appointment) => (
    <div
      key={apt.id}
      className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-stone-800 text-black dark:text-white flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-black dark:text-white">
              Fitting: {apt.service?.name || 'In-Studio Sizing Visit'}
            </h3>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Scheduled for {new Date(apt.appointment_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} at {apt.start_time}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={apt.status} />
          <button
            onClick={(e) =>
              handleOpenCancelModal(e, {
                id: apt.id,
                type: 'APPOINTMENT',
                title: `Cancel Appointment Visit`,
                description: `${apt.service?.name || 'Fitting Visit'} on ${new Date(apt.appointment_date).toLocaleDateString('en-IN')} at ${apt.start_time}`,
              })
            }
            className="p-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-800 transition-colors cursor-pointer"
            title="Cancel & Delete Appointment"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <span className="text-stone-500 dark:text-stone-400">
          Profile: <strong className="text-black dark:text-white">{apt.measurement_profile?.name || 'In-Studio Fitting'}</strong>
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTrackingItem({ type: 'APPOINTMENT', appointment: apt })}
          leftIcon={<Activity className="w-3.5 h-3.5 text-black dark:text-white" />}
          className="border-stone-300 dark:border-stone-700"
        >
          Track Status
        </Button>
      </div>
    </div>
  );

  const renderRequestCard = (req: CustomRequest) => (
    <div
      key={req.id}
      className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-stone-800 text-black dark:text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-black dark:text-white">
              Custom Quote: {req.garment_type} ({req.fabric || 'Fabric Provided'})
            </h3>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Submitted on {new Date(req.created_at).toLocaleDateString('en-IN')}
            </span>
          </div>
        </div>

        <StatusBadge status={req.status} />
      </div>

      <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2">
        {req.description}
      </p>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100 dark:border-stone-800">
        <span className="text-stone-500 dark:text-stone-400">
          Target Date: <strong className="text-black dark:text-white">{req.required_date ? new Date(req.required_date).toLocaleDateString('en-IN') : 'Flexible'}</strong>
        </span>
        <Link to="/custom-requests" className="font-semibold text-black dark:text-white hover:underline flex items-center gap-1">
          View Quotation Details <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white">
            My Bookings & Stitching Orders
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Track your live tailoring progress, cutting milestones, fitting visits, and custom orders in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/appointments/book">
            <Button variant="primary" size="sm" leftIcon={<Calendar className="w-4 h-4" />}>
              Book Service Slot
            </Button>
          </Link>
          <Link to="/custom-requests/create">
            <Button variant="outline" size="sm" leftIcon={<Sparkles className="w-4 h-4" />}>
              Custom Stitching
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-stone-200 dark:border-stone-800">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer relative ${
            activeTab === 'all'
              ? 'text-black dark:text-white border-b-2 border-black dark:border-white font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white'
          }`}
        >
          All Items ({totalCount})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer relative ${
            activeTab === 'orders'
              ? 'text-black dark:text-white border-b-2 border-black dark:border-white font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white'
          }`}
        >
          Stitching Bookings ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer relative ${
            activeTab === 'appointments'
              ? 'text-black dark:text-white border-b-2 border-black dark:border-white font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white'
          }`}
        >
          Fitting Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer relative ${
            activeTab === 'requests'
              ? 'text-black dark:text-white border-b-2 border-black dark:border-white font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white'
          }`}
        >
          Custom Quotes ({customRequests.length})
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : totalCount === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8 text-black dark:text-white" />}
          title="No Tailoring Orders or Bookings Yet"
          description="Book a fitting appointment from our Services or request custom stitching for any design in our Gallery!"
          actionLabel="Explore Tailoring Services"
          onAction={() => window.location.href = '/services'}
        />
      ) : (
        <div className="space-y-5">
          {activeTab === 'all' && (
            <div className="space-y-5">
              {unifiedItems.map((item) => {
                if (item.type === 'ORDER') return renderOrderCard(item.data as Order);
                if (item.type === 'APPOINTMENT') return renderAppointmentCard(item.data as Appointment);
                return renderRequestCard(item.data as CustomRequest);
              })}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-5">
              {orders.length === 0 ? (
                <EmptyState
                  icon={<ShoppingBag className="w-8 h-8 text-black dark:text-white" />}
                  title="No Stitching Bookings"
                  description="No tailoring orders currently in production."
                />
              ) : (
                orders.map((o) => renderOrderCard(o))
              )}
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <EmptyState
                  icon={<Calendar className="w-8 h-8 text-black dark:text-white" />}
                  title="No Appointments"
                  description="No consultation or fitting appointments scheduled."
                />
              ) : (
                appointments.map((a) => renderAppointmentCard(a))
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {customRequests.length === 0 ? (
                <EmptyState
                  icon={<Sparkles className="w-8 h-8 text-black dark:text-white" />}
                  title="No Custom Requests"
                  description="No custom design inquiries submitted."
                />
              ) : (
                customRequests.map((r) => renderRequestCard(r))
              )}
            </div>
          )}
        </div>
      )}

      {/* Live Booking Tracker Modal */}
      {trackingItem && (
        <BookingTrackModal
          isOpen={!!trackingItem}
          onClose={() => setTrackingItem(null)}
          item={trackingItem}
        />
      )}

      {/* Cancellation Reason Modal */}
      {cancellationTarget && (
        <CancellationModal
          isOpen={!!cancellationTarget}
          onClose={() => setCancellationTarget(null)}
          onConfirm={handleConfirmCancellation}
          title={cancellationTarget.title}
          itemDescription={cancellationTarget.description}
          confirmButtonText="Confirm Cancellation & Send Reason"
        />
      )}
    </div>
  );
};
