import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import {
  LayoutDashboard,
  ShoppingBag,
  Calendar,
  Sparkles,
  Bell,
  Ban,
  Ruler,
  User
} from 'lucide-react';

export const CustomerLayout: React.FC = () => {
  const location = useLocation();

  const sidebarLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Bookings & Orders', href: '/orders', icon: ShoppingBag },
    { label: 'Appointments', href: '/appointments', icon: Calendar },
    { label: 'Custom Requests', href: '/custom-requests', icon: Sparkles },
    { label: 'Cancelled Items', href: '/cancellations', icon: Ban },
    { label: 'Measurements', href: '/measurements', icon: Ruler },
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'My Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 relative transition-colors duration-200">
      {/* Brand Model & V Monogram Watermark Background (No Text) */}
      <div
        className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden select-none opacity-[0.09] dark:opacity-[0.04]"
        aria-hidden="true"
      >
        <img
          src="/logo-emblem.png"
          alt=""
          className="w-[420px] sm:w-[540px] max-w-[85vw] object-contain grayscale"
        />
      </div>

      <Header />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
          
          {/* Desktop Customer Sidebar Navigation */}
          <aside className="hidden md:block md:col-span-1 lg:col-span-1">
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-2xs sticky top-24 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-3 py-1.5 block">
                Customer Portal
              </span>
              {sidebarLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href || (item.href !== '/dashboard' && (location.pathname.startsWith(item.href) || (item.href === '/orders' && location.pathname.startsWith('/bookings'))));
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-black dark:bg-white text-white dark:text-black shadow-2xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-black' : 'text-stone-400 dark:text-stone-500'}`} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </aside>

          {/* Main Workspace Content Area */}
          <main className="md:col-span-3 lg:col-span-4 min-w-0 pb-24 md:pb-6">
            <Outlet />
          </main>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};
