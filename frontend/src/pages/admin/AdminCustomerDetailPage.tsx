import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { customersApi } from '../../api/contact';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, User, Phone, Mail, MapPin, Ruler, Calendar, ShoppingBag, Trash2 } from 'lucide-react';

export const AdminCustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await customersApi.getDetails(id);
        setData(res.data);
      } catch (err) {
        console.error('Failed to load customer profile:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  const handleDelete = async () => {
    if (!data?.user) return;
    if (!window.confirm(`Are you sure you want to permanently delete customer "${data.user.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await customersApi.delete(id!);
      success(`Customer "${data.user.name}" deleted successfully.`);
      navigate('/admin/customers');
    } catch (err: any) {
      toastError(err.message || 'Failed to delete customer.');
    }
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  const { user, total_spent, measurements, recent_orders, recent_appointments } = data;

  return (
    <div className="space-y-6 sm:space-y-8 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      <div className="flex items-center justify-between">
        <Link to="/admin/customers" className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-black dark:hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          className="border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
        >
          Delete Customer
        </Button>
      </div>

      {/* Customer Info Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-serif font-bold text-xl shadow-md">
              {user.name?.charAt(0)}
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl sm:text-2xl text-black dark:text-white">{user.name}</h1>
              <p className="text-xs text-stone-400">Client since {new Date(user.created_at).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-stone-400 dark:text-stone-500 font-semibold uppercase block">Total Lifetime Value</span>
            <span className="font-serif font-bold text-2xl text-black dark:text-white">₹{total_spent.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-black dark:text-white" />
            <span className="font-medium text-stone-900 dark:text-stone-100">{user.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-black dark:text-white" />
            <span className="font-medium text-stone-900 dark:text-stone-100">{user.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-black dark:text-white" />
            <span className="font-medium text-stone-900 dark:text-stone-100 truncate">
              {user.profile?.address ? `${user.profile.address}, ${user.profile.city || ''}` : 'No address saved'}
            </span>
          </div>
        </div>
      </div>

      {/* Sizing Profiles */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
        <h2 className="font-serif font-bold text-lg text-black dark:text-white flex items-center gap-2">
          <Ruler className="w-5 h-5 text-black dark:text-white" />
          Saved Measurement Profiles ({measurements.length})
        </h2>

        {measurements.length === 0 ? (
          <p className="text-xs text-stone-400">No measurement profiles saved for this customer.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {measurements.map((m: any) => (
              <div key={m.id} className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-black dark:text-white">{m.name}</span>
                  <span className="text-[10px] font-bold uppercase text-black dark:text-white bg-stone-200 dark:bg-stone-700 px-2 py-0.5 rounded-full">
                    {m.garment_type}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {Object.entries(m.measurements || {}).map(([k, v]) => (
                    <div key={k} className="bg-white dark:bg-stone-900 p-1.5 rounded-lg border border-stone-200 dark:border-stone-800">
                      <span className="text-[9px] text-stone-400 block truncate">{k.replace(/_/g, ' ')}</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">{String(v)}&quot;</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
        <h2 className="font-serif font-bold text-lg text-black dark:text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-black dark:text-white" />
          Tailoring Orders History ({recent_orders.length})
        </h2>

        {recent_orders.length === 0 ? (
          <p className="text-xs text-stone-400">No orders placed by this customer.</p>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {recent_orders.map((o: any) => (
              <div key={o.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <Link to={`/admin/orders/${o.id}`} className="font-bold text-black dark:text-white hover:underline">
                    Order #{o.order_number}
                  </Link>
                  <p className="text-xs text-stone-400">{new Date(o.created_at).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-black dark:text-white">₹{Number(o.price).toLocaleString('en-IN')}</span>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
