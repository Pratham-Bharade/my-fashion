import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';

export const PublicLayout: React.FC = () => {
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
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};
