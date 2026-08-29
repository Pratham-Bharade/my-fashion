import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../../api/orders';
import { appointmentsApi } from '../../api/appointments';
import { customRequestsApi } from '../../api/customRequests';
import { Order, Appointment, CustomRequest } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import {
  Ban,
  Calendar,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  MessageCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Trash2
} from 'lucide-react';

export const CancellationsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'orders' | 'appointments' | 'requests'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCancelledData = async () => {
    setIsLoading(true);
    try {
      const [ordRes, aptRes, reqRes] = await Promise.all([
        ordersApi.getMy(),
        appointmentsApi.getMy(),
        customRequestsApi.getMy(),
      ]);

      const cancelledOrders = (ordRes.data || []).filter((o) => o.status === 'CANCELLED');
      const cancelledAppointments = (aptRes.data || []).filter((a) => a.status === 'CANCELLED');
      const cancelledRequests = (reqRes.data || []).filter((r) => r.status === 'CANCELLED' || r.status === 'REJECTED');

      const sortDesc = (items: any[]) =>
        items.slice().sort((a, b) => {
          const tA = new Date(a.updated_at || a.created_at).getTime();
          const tB = new Date(b.updated_at || b.created_at).getTime();
          return tB - tA;
        });

      setOrders(sortDesc(cancelledOrders));
      setAppointments(sortDesc(cancelledAppointments));
      setCustomRequests(sortDesc(cancelledRequests));
    } catch (err) {
      console.error('Failed to load cancelled items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCancelledData();
  }, []);

  // Direct 1-Click Permanent Delete from Archive (NO REASON REQUIRED)
  const handleDeletePermanent = async (type: 'ORDER' | 'APPOINTMENT' | 'REQUEST', id: string) => {
    if (!window.confirm('Delete this cancelled item permanently from your archive?')) return;
    setDeletingId(id);
    try {
      if (type === 'ORDER') {
        await ordersApi.delete(id);
      } else if (type === 'APPOINTMENT') {
        await appointmentsApi.delete(id);
      } else {
        await customRequestsApi.delete(id);
      }
      success('Item permanently deleted from your cancelled archive.');
      fetchCancelledData();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete item.');
    } finally {
      setDeletingId(null);
    }
  };

  const totalCount = orders.length + appointments.length + customRequests.length;

  const unifiedCancelled = [
    ...orders.map((o) => ({ type: 'ORDER' as const, data: o, time: new Date(o.updated_at || o.created_at).getTime() })),
    ...appointments.map((a) => ({ type: 'APPOINTMENT' as const, data: a, time: new Date(a.updated_at || a.created_at).getTime() })),
    ...customRequests.map((r) => ({ type: 'REQUEST' as const, data: r, time: new Date(r.updated_at || r.created_at).getTime() })),
  ].sort((a, b) => b.time - a.time);

  return (
    <div className="space-y-6 sm:space-y-8 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Ban className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white">
              Cancelled Bookings & Orders
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Archive of all cancelled appointments, custom stitching requests, and orders along with recorded reasons.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/appointments/book">
            <Button variant="primary" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
              Re-Book a Slot
            </Button>
          </Link>
          <Link to="/custom-requests/create">
            <Button variant="outline" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
              New Custom Stitching
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
          All Cancelled ({totalCount})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer relative ${
            activeTab === 'orders'
              ? 'text-black dark:text-white border-b-2 border-black dark:border-white font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white'
          }`}
        >
          Stitching Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer relative ${
            activeTab === 'appointments'
              ? 'text-black dark:text-white border-b-2 border-black dark:border-white font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white'
          }`}
        >
          Fitting Visits ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer relative ${
            activeTab === 'requests'
              ? 'text-black dark:text-white border-b-2 border-black dark:border-white font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white'
          }`}
        >
          Custom Requests ({customRequests.length})
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : totalCount === 0 ? (
        <EmptyState
          icon={<Ban className="w-8 h-8 text-stone-400" />}
          title="No Cancelled Bookings or Orders"
          description="You do not have any cancelled tailoring appointments, custom requests, or orders."
          actionLabel="View Active Bookings"
          onAction={() => (window.location.href = '/orders')}
        />
      ) : (
        <div className="space-y-5">
          
          {/* Unified Cards Mapping */}
          {activeTab === 'all' &&
            unifiedCancelled.map((item) => {
              if (item.type === 'ORDER') return renderCancelledOrder(item.data as Order);
              if (item.type === 'APPOINTMENT') return renderCancelledAppointment(item.data as Appointment);
              return renderCancelledRequest(item.data as CustomRequest);
            })}

          {activeTab === 'orders' && orders.map((o) => renderCancelledOrder(o))}
          {activeTab === 'appointments' && appointments.map((a) => renderCancelledAppointment(a))}
          {activeTab === 'requests' && customRequests.map((r) => renderCancelledRequest(r))}
        </div>
      )}
    </div>
  );

  function renderCancelledOrder(order: Order) {
    const whatsappUrl = `https://wa.me/919322228426?text=${encodeURIComponent(
      `Hello Vandana Creations! Regarding cancelled Order #${order.order_number} (${order.service?.name || order.notes || 'Tailoring'}):`
    )}`;

    return (
      <div
        key={order.id}
        className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-7 border border-rose-200 dark:border-rose-950/60 shadow-2xs space-y-4 relative group"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="font-serif font-bold text-base sm:text-lg text-black dark:text-white">
                Order #{order.order_number}
              </span>
              <StatusBadge status="CANCELLED" />
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Cancelled on {new Date(order.updated_at || order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Original Price</span>
              <span className="font-serif font-bold text-lg text-black dark:text-white line-through opacity-70">
                ₹{order.price.toLocaleString('en-IN')}
              </span>
            </div>
            
            {/* Direct 1-Click Delete Button (No Reason Required) */}
            <button
              onClick={() => handleDeletePermanent('ORDER', order.id)}
              disabled={deletingId === order.id}
              className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-800 transition-colors cursor-pointer"
              title="Delete permanently from archive"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Garment Details */}
        <div className="text-xs text-stone-700 dark:text-stone-300">
          <span className="font-bold text-black dark:text-white">Garment / Service:</span>{' '}
          {order.service?.name || order.design?.title || order.notes || 'Bespoke Tailoring'}
        </div>

        {/* Cancellation Reason Callout */}
        <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-1">
          <span className="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Reason for Cancellation:</span>
          </span>
          <p className="text-xs text-rose-800 dark:text-rose-300 pl-5 whitespace-pre-line">
            {order.notes || 'Cancelled by customer / boutique request.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Discuss on WhatsApp</span>
          </a>

          <div className="flex items-center gap-2">
            <Link to="/services">
              <Button variant="outline" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
                Re-order Service
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeletePermanent('ORDER', order.id)}
              className="text-stone-400 hover:text-rose-600"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  }

  function renderCancelledAppointment(apt: Appointment) {
    const whatsappUrl = `https://wa.me/919322228426?text=${encodeURIComponent(
      `Hello Vandana Creations! Regarding my cancelled appointment for ${apt.service?.name || 'Fitting'} on ${new Date(apt.appointment_date).toLocaleDateString('en-IN')}:`
    )}`;

    return (
      <div
        key={apt.id}
        className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-rose-200 dark:border-rose-950/60 shadow-2xs space-y-4 relative group"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-black dark:text-white">
                Fitting Visit: {apt.service?.name || 'In-Studio Sizing Visit'}
              </h3>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Was scheduled for {new Date(apt.appointment_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} at {apt.start_time}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status="CANCELLED" />
            <button
              onClick={() => handleDeletePermanent('APPOINTMENT', apt.id)}
              disabled={deletingId === apt.id}
              className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-800 transition-colors cursor-pointer"
              title="Delete permanently from archive"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cancellation Reason */}
        <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-1">
          <span className="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Reason for Cancellation:</span>
          </span>
          <p className="text-xs text-rose-800 dark:text-rose-300 pl-5 whitespace-pre-line">
            {apt.notes || 'Cancelled by customer / boutique request.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Discuss on WhatsApp</span>
          </a>

          <div className="flex items-center gap-2">
            <Link to="/appointments/book">
              <Button variant="primary" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
                Re-Book Alternate Slot
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeletePermanent('APPOINTMENT', apt.id)}
              className="text-stone-400 hover:text-rose-600"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  }

  function renderCancelledRequest(req: CustomRequest) {
    const whatsappUrl = `https://wa.me/919322228426?text=${encodeURIComponent(
      `Hello Vandana Creations! Regarding cancelled custom stitching request for ${req.garment_type}:`
    )}`;

    return (
      <div
        key={req.id}
        className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-rose-200 dark:border-rose-950/60 shadow-2xs space-y-4 relative group"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-black dark:text-white">
                Custom Request: {req.garment_type} ({req.fabric || 'Fabric Provided'})
              </h3>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Submitted on {new Date(req.created_at).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={req.status} />
            <button
              onClick={() => handleDeletePermanent('REQUEST', req.id)}
              disabled={deletingId === req.id}
              className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-800 transition-colors cursor-pointer"
              title="Delete permanently from archive"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-300">
          {req.description}
        </p>

        {/* Cancellation Reason */}
        <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-1">
          <span className="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Reason for Cancellation / Decline:</span>
          </span>
          <p className="text-xs text-rose-800 dark:text-rose-300 pl-5 whitespace-pre-line">
            {req.notes || 'Cancelled by customer / boutique request.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Discuss on WhatsApp</span>
          </a>

          <div className="flex items-center gap-2">
            <Link to="/custom-requests/create">
              <Button variant="primary" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
                Submit New Custom Design
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeletePermanent('REQUEST', req.id)}
              className="text-stone-400 hover:text-rose-600"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  }
};
