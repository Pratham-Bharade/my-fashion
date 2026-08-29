import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../../api/orders';
import { Order, OrderStatus } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import { ShoppingBag, Search, ChevronRight, Phone, Trash2 } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'ORDER_RECEIVED', label: 'Order Received' },
  { value: 'MEASUREMENTS_CONFIRMED', label: 'Measurements Confirmed' },
  { value: 'CUTTING', label: 'Cutting' },
  { value: 'STITCHING', label: 'Stitching' },
  { value: 'QUALITY_CHECK', label: 'Quality Check' },
  { value: 'READY', label: 'Ready for Pickup' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const AdminOrdersPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await ordersApi.listAdmin({
        status: (statusFilter as OrderStatus) || undefined,
        search: search || undefined,
        page,
        limit: 25,
      });
      setOrders(res.items);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleDeleteOrder = async (id: string, orderNumber: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete Order #${orderNumber}? This action cannot be undone.`)) {
      return;
    }
    try {
      await ordersApi.delete(id);
      success(`Order #${orderNumber} deleted successfully.`);
      fetchOrders();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete order.');
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white">
            Tailoring Orders & Production Line
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            Monitor active garment cuts, update stitching phases, and record payments.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <Input
              placeholder="Order # or client name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
            <Button type="submit" variant="primary" size="md">
              Search
            </Button>
          </form>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
            className="min-h-[42px] px-3 rounded-xl border border-stone-300 dark:border-stone-700 text-xs bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List / Responsive Cards */}
      {isLoading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="No Orders Found"
          description="Try changing your search terms or status filter."
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-2xs hover:border-stone-400 dark:hover:border-stone-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="font-serif font-bold text-base sm:text-lg text-black dark:text-white hover:underline transition-colors"
                  >
                    #{order.order_number}
                  </Link>
                  <StatusBadge status={order.status} />
                  <span className="text-xs text-stone-400">
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600 dark:text-stone-400">
                  <span className="font-semibold text-black dark:text-white">{order.customer?.name}</span>
                  <span>{order.customer?.phone}</span>
                  <span className="text-stone-400 truncate">• {order.service?.name || order.notes}</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-800">
                <div className="text-left sm:text-right">
                  <span className="font-serif font-bold text-base sm:text-lg text-black dark:text-white block">
                    ₹{order.price.toLocaleString('en-IN')}
                  </span>
                  <span className={`text-xs font-semibold ${order.remaining_amount > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {order.remaining_amount > 0 ? `Pending: ₹${order.remaining_amount.toLocaleString('en-IN')}` : 'Paid ✓'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/admin/orders/${order.id}`}>
                    <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                      Manage
                    </Button>
                  </Link>
                  <button
                    onClick={() => handleDeleteOrder(order.id, order.order_number)}
                    className="p-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:border-rose-300 transition-colors cursor-pointer"
                    title="Delete Order"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
