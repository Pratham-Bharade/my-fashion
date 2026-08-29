import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { Bell, CheckCheck, Sparkles, Calendar, Scissors, ArrowRight, Trash2 } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { success, info } = useToast();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    success('All notifications marked as read.');
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteNotification(id);
    info('Notification deleted.');
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      await clearAllNotifications();
      success('All notifications cleared.');
    }
  };

  const getNotifIcon = (type: string, isRead: boolean) => {
    const baseClass = `w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
      isRead
        ? 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
        : 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
    }`;

    switch (type) {
      case 'QUOTATION_RECEIVED':
      case 'CUSTOM_REQUEST':
        return (
          <div className={baseClass}>
            <Sparkles className="w-5 h-5" />
          </div>
        );
      case 'APPOINTMENT_CONFIRMED':
      case 'APPOINTMENT':
        return (
          <div className={baseClass}>
            <Calendar className="w-5 h-5" />
          </div>
        );
      case 'ORDER_STATUS':
      case 'STITCHING':
        return (
          <div className={baseClass}>
            <Scissors className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className={baseClass}>
            <Bell className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif font-bold text-2xl text-stone-900 dark:text-stone-100">
              Notification Center
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-rose-600 text-white font-bold text-xs rounded-full shadow-sm">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Real-time updates regarding appointments, quotations, stitching milestones, and boutique notices.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                leftIcon={<CheckCheck className="w-4 h-4 text-emerald-600" />}
              >
                Mark All Read
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              leftIcon={<Trash2 className="w-4 h-4 text-stone-500 hover:text-rose-600" />}
              className="text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8 text-black dark:text-white" />}
          title="No Notifications Yet"
          description="You are all caught up! You will receive alerts when your order status updates or appointments are confirmed."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markAsRead(n.id)}
              className={`group p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer relative ${
                n.is_read
                  ? 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 shadow-2xs hover:border-stone-400 dark:hover:border-stone-600'
                  : 'bg-stone-50 dark:bg-stone-800/80 border-stone-400 dark:border-stone-600 text-stone-950 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              }`}
            >
              {getNotifIcon(n.type, n.is_read)}

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-serif font-bold text-sm ${!n.is_read ? 'text-black dark:text-white' : 'text-stone-800 dark:text-stone-200'}`}>
                      {n.title}
                    </h4>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 font-medium whitespace-nowrap">
                      {new Date(n.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {/* Delete Single Notification Button */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, n.id)}
                      title="Delete Notification"
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed pr-6">
                  {n.message}
                </p>

                {n.link_url && (
                  <div className="pt-1.5">
                    <Link
                      to={n.link_url}
                      onClick={() => markAsRead(n.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-black dark:text-white underline underline-offset-2 hover:opacity-80 transition-opacity"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
