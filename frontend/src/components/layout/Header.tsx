import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Menu,
  X,
  Calendar,
  User as UserIcon,
  LogOut,
  Bell,
  LayoutDashboard,
  Sun,
  Moon,
  CheckCheck,
  Sparkles,
  Scissors,
  CheckCircle2,
  Clock,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { Button } from '../common/Button';

export const Header: React.FC = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { settings } = useSettings();
  const { isDark, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const businessName = settings?.business_name || 'Vandana Creations';

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Gallery', href: '/designs' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
    };
    if (isNotifDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifDropdownOpen]);

  // Close menus on route change
  useEffect(() => {
    setIsNotifDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNotificationClick = async (notifId: string, linkUrl?: string | null) => {
    await markAsRead(notifId);
    setIsNotifDropdownOpen(false);
    if (linkUrl) {
      navigate(linkUrl);
    } else {
      navigate('/notifications');
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'QUOTATION_RECEIVED':
      case 'CUSTOM_REQUEST':
        return <Sparkles className="w-4 h-4 text-brand-500" />;
      case 'APPOINTMENT_CONFIRMED':
      case 'APPOINTMENT':
        return <Calendar className="w-4 h-4 text-emerald-500" />;
      case 'ORDER_STATUS':
      case 'STITCHING':
        return <Scissors className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-stone-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-950/95 backdrop-blur-sm border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20 sm:h-22">
          
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-3 group py-1.5">
            <img
              src="/logo.png"
              alt="Vandana Creations"
              className="h-14 sm:h-16 md:h-18 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg sm:text-xl text-black dark:text-white tracking-tight leading-none uppercase">
                Vandana
              </span>
              <span className="font-serif italic text-stone-600 dark:text-stone-400 text-xs sm:text-sm font-semibold leading-tight">
                Creations
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive(link.href)
                    ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-2xs'
                    : 'text-stone-700 dark:text-stone-300 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-2">
            
            {/* Theme Toggle Button with Rotate Effect */}
            <button
              onClick={(e) => toggleTheme(e)}
              className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-900 border border-stone-200 dark:border-stone-800 transition-all active:scale-90 hover:scale-105 shadow-2xs"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 rotate-0 transition-transform duration-500 animate-in spin-in-180" />
              ) : (
                <Moon className="w-4 h-4 text-stone-700 rotate-0 transition-transform duration-500 animate-in spin-in-180" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 relative" ref={dropdownRef}>
                
                {/* Interactive Notification Bell with Badge & Dropdown */}
                <button
                  onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                  className={`p-2 rounded-xl border transition-all relative cursor-pointer ${
                    isNotifDropdownOpen
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                      : 'text-stone-600 dark:text-stone-300 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-900 border-stone-200 dark:border-stone-800'
                  }`}
                  title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  
                  {/* Unread Pill Badge */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-sm animate-pulse border-2 border-white dark:border-stone-950">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Real-time Notification Dropdown Popover */}
                {isNotifDropdownOpen && (
                  <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                    <div className="p-3.5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>

                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] font-semibold text-stone-500 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/60">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center space-y-1">
                          <Bell className="w-6 h-6 text-stone-300 dark:text-stone-600 mx-auto" />
                          <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                            No notifications yet
                          </p>
                          <p className="text-[11px] text-stone-400">
                            Updates on appointments & stitching will show up here.
                          </p>
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n.id, n.link_url)}
                            className={`p-3 sm:p-3.5 hover:bg-stone-50 dark:hover:bg-stone-800/70 transition-colors cursor-pointer flex gap-3 items-start ${
                              !n.is_read ? 'bg-amber-50/40 dark:bg-stone-800/40' : ''
                            }`}
                          >
                            <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 shrink-0 mt-0.5">
                              {getNotifIcon(n.type)}
                            </div>
                            <div className="flex-1 min-w-0 space-y-0.5">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className={`text-xs truncate ${!n.is_read ? 'font-bold text-stone-950 dark:text-white' : 'font-semibold text-stone-700 dark:text-stone-300'}`}>
                                  {n.title}
                                </h4>
                                <div className="flex items-center gap-1">
                                  {!n.is_read && (
                                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(n.id);
                                    }}
                                    title="Delete notification"
                                    className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                                {n.message}
                              </p>
                              <span className="text-[9px] text-stone-400 dark:text-stone-500 block pt-0.5">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-2.5 bg-stone-50 dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 text-center">
                      <Link
                        to="/notifications"
                        onClick={() => setIsNotifDropdownOpen(false)}
                        className="text-xs font-semibold text-stone-800 dark:text-stone-200 hover:text-black dark:hover:text-white inline-flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                      >
                        <span>View All Notifications</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}

                {isAdmin ? (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}>
                      Admin
                    </Button>
                  </Link>
                ) : (
                  <Link to="/dashboard">
                    <Button variant="outline" size="sm" leftIcon={<UserIcon className="w-3.5 h-3.5" />}>
                      Account
                    </Button>
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/appointments/book">
                  <Button variant="primary" size="sm" leftIcon={<Calendar className="w-3.5 h-3.5" />}>
                    Book Slot
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Mobile Theme Toggle */}
            <button
              onClick={(e) => toggleTheme(e)}
              className="p-2 text-stone-700 dark:text-stone-300 hover:text-black dark:hover:text-white active:scale-90 transition-all"
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 rotate-0 transition-transform duration-500 animate-in spin-in-180" />
              ) : (
                <Moon className="w-4 h-4 text-stone-700 rotate-0 transition-transform duration-500 animate-in spin-in-180" />
              )}
            </button>

            {/* Mobile Bell Button with Badge */}
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="p-2 text-stone-600 dark:text-stone-300 hover:text-black dark:hover:text-white relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 bg-rose-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-black dark:text-white hover:bg-stone-100 dark:hover:bg-stone-900 rounded-lg"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 px-4 py-3 space-y-2">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`block px-3 py-2 rounded-lg text-xs font-medium ${
                  isActive(link.href)
                    ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                    : 'text-stone-700 dark:text-stone-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {isAuthenticated ? (
            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-1.5">
              <Link
                to="/notifications"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900"
              >
                <span className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </Link>

              {isAdmin ? (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 font-semibold"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900"
                >
                  <UserIcon className="w-4 h-4" />
                  My Account
                </Link>
              )}

              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex gap-2">
              <Link to="/login" className="flex-1">
                <Button variant="ghost" size="sm" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link to="/appointments/book" className="flex-1">
                <Button variant="primary" size="sm" className="w-full">
                  Book Slot
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
