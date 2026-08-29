import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ordersApi } from '../../api/orders';
import { appointmentsApi } from '../../api/appointments';
import { customRequestsApi } from '../../api/customRequests';
import { measurementsApi } from '../../api/measurements';
import { Order, Appointment, CustomRequest, MeasurementProfile, OrderStatus } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { CardSkeleton } from '../../components/common/Skeleton';
import {
  Calendar,
  Sparkles,
  Ruler,
  Clock,
  ArrowRight,
  Plus,
  Scissors,
  ShoppingBag,
  ChevronRight
} from 'lucide-react';

const getProgressPercent = (status: OrderStatus) => {
  switch (status) {
    case 'ORDER_RECEIVED': return 15;
    case 'MEASUREMENTS_CONFIRMED': return 30;
    case 'CUTTING': return 50;
    case 'STITCHING': return 70;
    case 'QUALITY_CHECK': return 85;
    case 'READY': return 95;
    case 'DELIVERED': return 100;
    case 'CANCELLED': return 0;
    default: return 15;
  }
};

const getStageShortText = (status: OrderStatus) => {
  switch (status) {
    case 'ORDER_RECEIVED': return 'Booking Confirmed';
    case 'MEASUREMENTS_CONFIRMED': return 'Measurements Verified';
    case 'CUTTING': return 'Pattern Cutting';
    case 'STITCHING': return 'Stitching in Progress';
    case 'QUALITY_CHECK': return 'Finishing & Ironing';
    case 'READY': return 'Ready for Trial / Pickup';
    case 'DELIVERED': return 'Delivered ✓';
    case 'CANCELLED': return 'Cancelled';
    default: return 'In Progress';
  }
};

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [ordRes, aptRes, reqRes, meaRes] = await Promise.all([
          ordersApi.getMy(),
          appointmentsApi.getMy(),
          customRequestsApi.getMy(),
          measurementsApi.list(),
        ]);

        const sortDesc = (items: any[]) =>
          (items || []).slice().sort((a, b) => {
            const tA = new Date(a.updated_at || a.created_at).getTime();
            const tB = new Date(b.updated_at || b.created_at).getTime();
            return tB - tA;
          });

        setOrders(sortDesc(ordRes.data || []));
        setAppointments(sortDesc(aptRes.data || []));
        setCustomRequests(sortDesc(reqRes.data || []));
        setMeasurements(meaRes.data || []);
      } catch (err) {
        console.error('Failed to load customer dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const activeOrders = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const upcomingAppointments = appointments.filter((a) => a.status !== 'CANCELLED');
  const activeCustomRequests = customRequests.filter((r) => r.status !== 'CONVERTED_TO_ORDER');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-stone-200 dark:bg-stone-800 w-48 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div>
          <h1 className="font-serif font-bold text-xl sm:text-2xl text-stone-900 dark:text-stone-100">
            Hello, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Welcome to your Vandana Creations bespoke styling portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/appointments/book">
            <Button variant="primary" size="sm" leftIcon={<Calendar className="w-4 h-4" />}>
              Book Service
            </Button>
          </Link>
          <Link to="/custom-requests/create">
            <Button variant="outline" size="sm" leftIcon={<Sparkles className="w-4 h-4" />}>
              Custom Stitching
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bookings & Orders KPI */}
        <Link
          to="/orders"
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-1 hover:border-stone-400 dark:hover:border-stone-600 transition-all block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Stitching Orders
            </span>
            <div className="p-2 rounded-xl bg-black dark:bg-white text-white dark:text-black">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-black dark:text-white">
            {orders.length}
          </p>
          <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
            {activeOrders.length > 0 ? `${activeOrders.length} active in production` : 'No active orders'}
          </span>
        </Link>

        {/* Appointments KPI */}
        <Link
          to="/appointments"
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-1 hover:border-stone-400 dark:hover:border-stone-600 transition-all block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Fitting Visits
            </span>
            <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-black dark:text-white">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-black dark:text-white">
            {upcomingAppointments.length}
          </p>
          <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
            {upcomingAppointments.length > 0 ? 'Upcoming visits booked' : 'No upcoming visits'}
          </span>
        </Link>

        {/* Custom Requests KPI */}
        <Link
          to="/custom-requests"
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-1 hover:border-stone-400 dark:hover:border-stone-600 transition-all block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Custom Requests
            </span>
            <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-black dark:text-white">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-black dark:text-white">
            {activeCustomRequests.length}
          </p>
          <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
            {activeCustomRequests.length > 0 ? 'Quotes & designs pending' : 'No active requests'}
          </span>
        </Link>

        {/* Measurements KPI */}
        <Link
          to="/measurements"
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-1 hover:border-stone-400 dark:hover:border-stone-600 transition-all block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Measurements
            </span>
            <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-black dark:text-white">
              <Ruler className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-black dark:text-white">
            {measurements.length}
          </p>
          <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
            {measurements.length > 0 ? 'Saved body profiles' : 'Add custom size'}
          </span>
        </Link>
      </div>

      {/* ACTIVE STITCHING ORDERS TRACKER SECTION */}
      <div className="bg-white dark:bg-stone-900 p-5 sm:p-7 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-black dark:text-white" />
            <h2 className="font-serif font-bold text-base sm:text-lg text-black dark:text-white">
              Live Tailoring Progress & Product Tracking
            </h2>
          </div>
          <Link
            to="/orders"
            className="text-xs font-semibold text-stone-500 hover:text-black dark:hover:text-white inline-flex items-center gap-1"
          >
            View All Bookings <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <ShoppingBag className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto" />
            <p className="text-xs text-stone-500 dark:text-stone-400">
              You do not have any active tailoring bookings yet. Book a service or gallery design to track production.
            </p>
            <div className="flex justify-center gap-2 pt-1">
              <Link to="/services">
                <Button variant="primary" size="sm" leftIcon={<Scissors className="w-3.5 h-3.5" />}>
                  Explore Services
                </Button>
              </Link>
              <Link to="/designs">
                <Button variant="outline" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                  Explore Gallery
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.slice(0, 3).map((order) => {
              const percent = getProgressPercent(order.status);
              const stageShort = getStageShortText(order.status);

              return (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="block p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 transition-all space-y-3 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif font-bold text-sm sm:text-base text-black dark:text-white group-hover:underline">
                          {order.service?.name || order.design?.title || order.notes || `Order #${order.order_number}`}
                        </h3>
                        <StatusBadge status={order.status} />
                      </div>
                      <span className="text-xs text-stone-500 dark:text-stone-400">
                        Order #{order.order_number} • Target Delivery:{' '}
                        {order.expected_delivery_date
                          ? new Date(order.expected_delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                          : 'In progress'}
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs font-bold text-black dark:text-white block">
                        ₹{order.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {order.remaining_amount > 0 ? `₹${order.remaining_amount} balance` : 'Paid in full ✓'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-stone-700 dark:text-stone-300">
                        Current: <strong className="text-black dark:text-white">{stageShort}</strong>
                      </span>
                      <span className="text-black dark:text-white font-bold">{percent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                      <div
                        className="h-full bg-black dark:bg-white rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Column Grid: Appointments & Custom Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments Section */}
        <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-black dark:text-white" />
              <h2 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                Fitting Appointments
              </h2>
            </div>
            <Link
              to="/appointments"
              className="text-xs font-semibold text-stone-500 hover:text-black dark:hover:text-white inline-flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-6 space-y-2">
              <p className="text-xs text-stone-400">No scheduled consultation or fitting slots.</p>
              <Link to="/appointments/book">
                <Button variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Book Consultation Slot
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.slice(0, 3).map((apt) => (
                <div
                  key={apt.id}
                  className="p-3.5 rounded-2xl bg-stone-50/70 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="font-serif font-bold text-sm text-black dark:text-white truncate">
                      {apt.service?.name || 'Tailoring Consultation'}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {new Date(apt.appointment_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {apt.start_time?.slice(0, 5)}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Requests & Quotations Section */}
        <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-black dark:text-white" />
              <h2 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                Custom Stitching Requests
              </h2>
            </div>
            <Link
              to="/custom-requests"
              className="text-xs font-semibold text-stone-500 hover:text-black dark:hover:text-white inline-flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {customRequests.length === 0 ? (
            <div className="text-center py-6 space-y-2">
              <p className="text-xs text-stone-400">No custom design or tailoring requests submitted.</p>
              <Link to="/custom-requests/create">
                <Button variant="outline" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                  Submit Custom Design
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {customRequests.slice(0, 3).map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-2xl bg-stone-50/70 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="font-serif font-bold text-sm text-black dark:text-white truncate">
                      {req.garment_type} Custom Stitching
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                      {req.description || 'Custom tailored request.'}
                    </p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
