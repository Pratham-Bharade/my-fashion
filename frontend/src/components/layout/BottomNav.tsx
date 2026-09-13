import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Sparkles, Calendar, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BottomNav: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const items = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Gallery', href: '/designs', icon: Sparkles },
    { label: 'Book', href: '/appointments/book', icon: Calendar, highlight: true },
    { label: 'Bookings', href: isAuthenticated ? '/orders' : '/login', icon: ShoppingBag },
    { label: 'Account', href: isAuthenticated ? '/dashboard' : '/login', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-950/95 backdrop-blur-lg border-t border-stone-200 dark:border-stone-800 shadow-lg px-2 pb-safe transition-colors">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || (item.href === '/orders' && (location.pathname.startsWith('/orders') || location.pathname.startsWith('/bookings')));

          if (item.highlight) {
            return (
              <NavLink
                key={item.label}
                to={item.href}
                className="flex flex-col items-center justify-center -mt-5 group"
              >
                <div className="w-13 h-13 rounded-full bg-black dark:bg-white text-white dark:text-black shadow-lg flex items-center justify-center border-4 border-white dark:border-stone-950 group-active:scale-95 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-black dark:text-white mt-0.5 tracking-tight">
                  {item.label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.label}
              to={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-black dark:text-white font-bold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white active:scale-95'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[11px] mt-1 tracking-tight">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
