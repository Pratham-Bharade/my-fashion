import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  Sparkles,
  FileText,
  Users,
  Scissors,
  Image as ImageIcon,
  Star,
  MessageSquare,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Store,
  Bell,
  Sun,
  Moon
} from 'lucide-react';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const { isDark, toggleTheme } = useTheme();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navGroups = [
    {
      title: 'Operations',
      links: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
        { label: 'Appointments', href: '/admin/appointments', icon: Calendar },
        { label: 'Orders & Stitching', href: '/admin/orders', icon: ShoppingBag },
        { label: 'Custom Requests', href: '/admin/custom-requests', icon: Sparkles },
        { label: 'Quotations', href: '/admin/quotations', icon: FileText },
      ],
    },
    {
      title: 'Catalog & Customers',
      links: [
        { label: 'Customers', href: '/admin/customers', icon: Users },
        { label: 'Services Catalog', href: '/admin/services', icon: Scissors },
        { label: 'Design Gallery', href: '/admin/designs', icon: ImageIcon },
        { label: 'Customer Reviews', href: '/admin/reviews', icon: Star },
        { label: 'Inquiries & Contact', href: '/admin/contact', icon: MessageSquare },
      ],
    },
    {
      title: 'Analytics & Studio',
      links: [
        { label: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
        { label: 'Boutique Settings', href: '/admin/settings', icon: SettingsIcon },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActiveLink = (href: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col md:flex-row transition-colors duration-200">
      
      {/* Mobile Admin Top Navigation Header */}
      <header className="md:hidden bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 focus:outline-none"
            aria-label="Open Admin Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/admin" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Vandana Creations"
              className="h-8 w-auto object-contain"
            />
            <span className="font-serif font-bold text-sm text-black dark:text-white">
              Admin Studio
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link
            to="/"
            target="_blank"
            className="p-2 rounded-xl text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Open Live Website"
          >
            <Store className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
        <div className="p-5 space-y-6">
          
          {/* Logo & Status Badge */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
            <Link to="/admin" className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Vandana Creations"
                className="h-9 w-auto object-contain"
              />
              <div>
                <h2 className="font-serif font-bold text-sm text-black dark:text-white leading-tight">
                  Vandana Creations
                </h2>
                <span className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
                  Tailor Studio
                </span>
              </div>
            </Link>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-stone-400 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Groups */}
          <div className="space-y-5">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-3 block">
                  {group.title}
                </span>
                {group.links.map((item) => {
                  const Icon = item.icon;
                  const active = isActiveLink(item.href, item.exact);
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-black dark:bg-white text-white dark:text-black shadow-2xs'
                          : 'text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-white dark:text-black' : 'text-stone-400 dark:text-stone-500'}`} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* User Info & Store Link Footer */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 space-y-3 bg-stone-50/50 dark:bg-stone-900/50">
          <Link
            to="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-black dark:hover:text-white transition-colors shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-stone-400" />
              <span>View Storefront</span>
            </span>
            <span className="text-[10px] font-bold text-stone-400">Live ↗</span>
          </Link>

          <div className="flex items-center justify-between pt-1 px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-black dark:text-white truncate block">
                  {user?.name || 'Master Tailor'}
                </span>
                <span className="text-[10px] text-stone-400 truncate block">
                  {user?.email}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-stone-900 h-full flex flex-col justify-between p-5 z-10 overflow-y-auto shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
                  <span className="font-serif font-bold text-sm text-black dark:text-white">Admin Studio</span>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-black dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {navGroups.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-3 block">
                      {group.title}
                    </span>
                    {group.links.map((item) => {
                      const Icon = item.icon;
                      const active = isActiveLink(item.href, item.exact);
                      return (
                        <NavLink
                          key={item.href}
                          to={item.href}
                          onClick={() => setIsMobileDrawerOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                            active
                              ? 'bg-black dark:bg-white text-white dark:text-black'
                              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 truncate">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Dynamic Outlet */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <Outlet />
        {children}
      </main>
    </div>
  );
};
