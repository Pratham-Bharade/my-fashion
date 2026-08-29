import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/contact';
import { DashboardAnalytics } from '../../types';
import { CardSkeleton } from '../../components/common/Skeleton';
import { Button } from '../../components/common/Button';
import {
  Users,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Sparkles,
  Scissors,
  ArrowRight,
  Clock,
  CheckCircle2,
  MessageSquare,
  Eye,
  ChevronRight
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await dashboardApi.getAnalytics();
        setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-stone-200 dark:bg-stone-800 w-48 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const { stats, monthly_revenue_trend, order_status_distribution, orders_by_service_category, recent_activity } = analytics;

  return (
    <div className="space-y-8 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Header & Quick Action Shortcuts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white">
            Tailor Studio Overview
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            Live atelier metrics, client appointments, production stitching pipeline, and order values.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/admin/appointments">
            <Button variant="primary" size="sm" leftIcon={<Calendar className="w-4 h-4" />}>
              Today's Schedule ({stats.todays_appointments})
            </Button>
          </Link>
          <Link to="/admin/orders">
            <Button variant="outline" size="sm" leftIcon={<ShoppingBag className="w-4 h-4" />}>
              Active Orders ({stats.active_orders})
            </Button>
          </Link>
          <Link to="/admin/custom-requests">
            <Button variant="outline" size="sm" leftIcon={<Sparkles className="w-4 h-4" />}>
              Quotes ({stats.new_custom_requests})
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Primary KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Customers */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Total Clients</span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 text-black dark:text-white flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white block">
            {stats.total_customers}
          </span>
          <Link to="/admin/customers" className="text-xs font-semibold text-black dark:text-white hover:underline flex items-center gap-1">
            Client Directory <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Active Production Orders */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Active Stitching</span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 text-black dark:text-white flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <span className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white block">
            {stats.active_orders}
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">{stats.ready_orders} orders ready for pickup</span>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Today's Visits</span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 text-black dark:text-white flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <span className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white block">
            {stats.todays_appointments}
          </span>
          <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">{stats.pending_appointments} pending approvals</span>
        </div>

        {/* Total Orders Value / Revenue */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Orders Volume</span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 text-black dark:text-white flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white block">
            ₹{stats.total_revenue.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Month: ₹{stats.monthly_revenue.toLocaleString('en-IN')}</span>
        </div>

      </div>

      {/* Second Row: Monthly Revenue Trend & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 6-Month Revenue Visual Bars */}
        <div className="lg:col-span-8 bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-lg text-black dark:text-white">
                Monthly Orders Performance
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">Order value and jobs over the last 6 months</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-semibold text-black dark:text-white hover:underline">
              All Orders
            </Link>
          </div>

          <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-48 sm:h-56 pt-6 px-2">
            {monthly_revenue_trend.map((m) => {
              const maxVal = Math.max(...monthly_revenue_trend.map((x) => x.revenue), 1000);
              const heightPct = Math.max(12, Math.round((m.revenue / maxVal) * 100));

              return (
                <div key={m.month} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] sm:text-xs font-bold text-black dark:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{m.revenue >= 1000 ? `${(m.revenue / 1000).toFixed(1)}k` : m.revenue}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[48px] rounded-xl bg-black dark:bg-white group-hover:opacity-80 transition-all shadow-2xs"
                  />
                  <span className="text-[10px] sm:text-xs font-medium text-stone-500 dark:text-stone-400 truncate max-w-full text-center">
                    {m.month.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="lg:col-span-4 bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="font-serif font-bold text-lg text-black dark:text-white">
              Production Queue
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">Current stitching stage distribution</p>
          </div>

          <div className="space-y-2.5">
            {order_status_distribution.map((st) => (
              <div key={st.status} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 text-xs">
                <span className="font-semibold text-stone-800 dark:text-stone-200">{st.status.replace(/_/g, ' ')}</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-bold text-black dark:text-white shadow-2xs">
                  {st.count}
                </span>
              </div>
            ))}
          </div>

          <Link to="/admin/orders">
            <Button variant="outline" size="sm" fullWidth rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Manage Production Pipeline
            </Button>
          </Link>
        </div>

      </div>

      {/* Category Performance & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Popular Categories */}
        <div className="lg:col-span-6 bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
          <h2 className="font-serif font-bold text-lg text-black dark:text-white">
            Top Tailoring Categories
          </h2>

          <div className="space-y-3">
            {orders_by_service_category.length === 0 ? (
              <p className="text-xs text-stone-400">No category statistics available yet.</p>
            ) : (
              orders_by_service_category.map((cat) => (
                <div key={cat.category} className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-black dark:text-white block">{cat.category}</span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">{cat.count} total jobs stitched</span>
                  </div>
                  <span className="font-serif font-bold text-base text-black dark:text-white">
                    ₹{cat.revenue.toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Studio Activities */}
        <div className="lg:col-span-6 bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-lg text-black dark:text-white">
              Recent Studio Orders
            </h2>
            <Link to="/admin/orders" className="text-xs font-semibold text-stone-500 hover:text-black dark:hover:text-white">
              View All
            </Link>
          </div>

          <div className="space-y-2.5">
            {recent_activity.length === 0 ? (
              <p className="text-xs text-stone-400">No recent orders yet.</p>
            ) : (
              recent_activity.map((act) => (
                <Link
                  key={act.id}
                  to={`/admin/orders/${act.id}`}
                  className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700/60 flex items-center justify-between text-xs transition-colors group block"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-black dark:text-white group-hover:underline block">{act.title}</span>
                    <span className="text-stone-500 dark:text-stone-400">Client: {act.customer}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-black dark:text-white block">
                      ₹{act.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-stone-400 block">{new Date(act.date).toLocaleDateString('en-IN')}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
