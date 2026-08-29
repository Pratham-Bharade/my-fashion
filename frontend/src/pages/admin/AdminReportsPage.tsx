import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/contact';
import { DashboardAnalytics } from '../../types';
import { Skeleton, CardSkeleton } from '../../components/common/Skeleton';
import { Button } from '../../components/common/Button';
import { BarChart3, TrendingUp, DollarSign, Calendar, ShoppingBag, Download } from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await dashboardApi.getAnalytics();
        setData(res.data);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  const { stats, monthly_revenue_trend, orders_by_service_category } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900">
            Business Intelligence & Reports
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Detailed breakdown of tailoring revenue, average order value, and category popularity.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-xs"
        >
          <Download className="w-4 h-4" /> Print / Export PDF
        </button>
      </div>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase text-stone-400">Total Lifetime Invoiced</span>
          <span className="font-serif font-bold text-3xl text-brand-700 block">
            ₹{stats.total_revenue.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-stone-500">Across all completed & active jobs</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase text-stone-400">Current Month Collections</span>
          <span className="font-serif font-bold text-3xl text-emerald-700 block">
            ₹{stats.monthly_revenue.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-stone-500">Payments collected this calendar month</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase text-stone-400">Total Outfits Stitched</span>
          <span className="font-serif font-bold text-3xl text-stone-900 block">
            {stats.total_orders}
          </span>
          <span className="text-xs text-stone-500">{stats.active_orders} orders currently in production</span>
        </div>
      </div>

      {/* Category Performance Breakdown Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
        <h2 className="font-serif font-bold text-lg text-stone-900">
          Service Category Volume & Revenue Breakdown
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase text-[10px]">
                <th className="pb-3 font-bold">Category</th>
                <th className="pb-3 font-bold">Jobs Stitched</th>
                <th className="pb-3 font-bold">Total Revenue</th>
                <th className="pb-3 font-bold text-right">Avg Job Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders_by_service_category.map((cat) => {
                const avg = cat.count > 0 ? Math.round(cat.revenue / cat.count) : 0;
                return (
                  <tr key={cat.category} className="hover:bg-stone-50/50">
                    <td className="py-3.5 font-bold text-stone-900">{cat.category}</td>
                    <td className="py-3.5 text-stone-600">{cat.count} jobs</td>
                    <td className="py-3.5 font-serif font-bold text-brand-700">₹{cat.revenue.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 text-right font-medium text-stone-800">₹{avg.toLocaleString('en-IN')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
