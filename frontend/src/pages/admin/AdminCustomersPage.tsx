import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customersApi } from '../../api/contact';
import { notificationsApi } from '../../api/notifications';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import { Users, Search, Phone, Mail, Eye, UserCheck, UserX, Trash2, Bell, Send, Radio } from 'lucide-react';

export const AdminCustomersPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Notification Modal State
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [targetCustomer, setTargetCustomer] = useState<{ id?: string; name: string } | null>(null);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifLinkUrl, setNotifLinkUrl] = useState('');
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await customersApi.list({ search: search || undefined, page, limit: 20 });
      setCustomers(res.items);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleToggleStatus = async (id: string, name: string) => {
    try {
      await customersApi.toggleStatus(id);
      success(`Customer status updated for ${name}.`);
      fetchCustomers();
    } catch (err: any) {
      toastError(err.message || 'Failed to toggle status.');
    }
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete customer "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await customersApi.delete(id);
      success(`Customer "${name}" deleted successfully.`);
      fetchCustomers();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete customer.');
    }
  };

  const openDirectNotifModal = (customer: { id: string; name: string }) => {
    setTargetCustomer(customer);
    setNotifTitle('');
    setNotifMessage('');
    setNotifLinkUrl('');
    setIsNotifModalOpen(true);
  };

  const openBroadcastNotifModal = () => {
    setTargetCustomer({ name: 'All Registered Customers' });
    setNotifTitle('');
    setNotifMessage('');
    setNotifLinkUrl('');
    setIsNotifModalOpen(true);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) {
      toastError('Please enter both title and notification message.');
      return;
    }

    setIsSendingNotif(true);
    try {
      await notificationsApi.send({
        user_id: targetCustomer?.id,
        title: notifTitle.trim(),
        message: notifMessage.trim(),
        link_url: notifLinkUrl.trim() || undefined,
      });

      success(
        targetCustomer?.id
          ? `Notification sent to ${targetCustomer.name}.`
          : 'Broadcast notification sent to all customers!'
      );
      setIsNotifModalOpen(false);
    } catch (err: any) {
      toastError(err.message || 'Failed to send notification.');
    } finally {
      setIsSendingNotif(false);
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white">
            Customer Directory
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            Registered boutique clients, measurement records, and direct customer notifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={openBroadcastNotifModal}
            leftIcon={<Radio className="w-3.5 h-3.5 text-rose-500" />}
          >
            Broadcast Notice
          </Button>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-xs w-full">
            <Input
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-xs"
            />
            <Button type="submit" variant="secondary" size="sm" className="h-9 px-3">
              <Search className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No Customers Found"
          description="Try modifying your search term."
        />
      ) : (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs overflow-hidden">
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {customers.map((c) => (
              <div
                key={c.id}
                className="p-5 sm:p-6 hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-black dark:text-white flex items-center justify-center font-bold font-serif text-lg shrink-0">
                    {c.name?.charAt(0)}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-base text-black dark:text-white">{c.name}</h3>
                      {!c.is_active && (
                        <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                          Deactivated
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {c.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {c.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-800">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 block">Orders / Spend</span>
                    <span className="font-semibold text-black dark:text-white text-xs sm:text-sm">
                      {c.total_orders || 0} jobs • ₹{(c.total_spent || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Send Notification Button */}
                    <button
                      onClick={() => openDirectNotifModal(c)}
                      className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                      title={`Send in-app notification to ${c.name}`}
                    >
                      <Bell className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    </button>

                    <Link to={`/admin/customers/${c.id}`}>
                      <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                        Profile
                      </Button>
                    </Link>

                    <button
                      onClick={() => handleToggleStatus(c.id, c.name)}
                      className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                        c.is_active
                          ? 'border-stone-200 dark:border-stone-700 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                          : 'border-emerald-200 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                      }`}
                      title={c.is_active ? 'Deactivate Customer' : 'Activate Customer'}
                    >
                      {c.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleDeleteCustomer(c.id, c.name)}
                      className="p-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:border-rose-300 transition-colors cursor-pointer"
                      title="Permanently Delete Customer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Send In-App Notification Modal */}
      {isNotifModalOpen && (
        <Modal
          isOpen={isNotifModalOpen}
          onClose={() => setIsNotifModalOpen(false)}
          title="Send In-App Notification"
          subtitle={`Recipient: ${targetCustomer?.name || 'Customer'}`}
          maxWidth="md"
        >
          <form onSubmit={handleSendNotification} className="space-y-4 pt-2">
            <Input
              label="Notification Title"
              placeholder="e.g. Trial Fitting Scheduled / Special Announcement"
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              required
              autoFocus
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
                Notification Message
              </label>
              <textarea
                rows={3}
                placeholder="Enter the alert or update details that the customer will see inside their Bell icon..."
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                required
                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 p-3 text-sm focus:outline-none"
              />
            </div>

            <Input
              label="Redirect URL (Optional)"
              placeholder="e.g. /custom-requests, /appointments, /orders"
              value={notifLinkUrl}
              onChange={(e) => setNotifLinkUrl(e.target.value)}
            />

            <div className="flex justify-end gap-2.5 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsNotifModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSendingNotif} leftIcon={<Send className="w-4 h-4" />}>
                Send Notification
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
