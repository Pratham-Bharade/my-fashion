import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { Sparkles, Heart, Award, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { SITE_MEDIA } from '../../config/siteMedia';

export const AboutPage: React.FC = () => {
  const { settings } = useSettings();

  const businessName = settings?.business_name || 'Vandana Creations';

  return (
    <div className="space-y-10 pb-12 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Header */}
      <section className="pt-8 pb-4 text-center max-w-2xl mx-auto px-4 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Our Heritage
        </div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white">
          About {businessName}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
          15+ years of bespoke Indian tailoring, handcrafted bridal blouses, and custom saree styling.
        </p>
      </section>

      {/* Story */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-3">
            <h2 className="font-serif font-bold text-lg sm:text-xl text-black dark:text-white">
              Graceful, Modern & Stylish Craftsmanship
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              At Vandana Creations, every garment is drafted from scratch to your individual measurements. We believe true luxury is in the comfort of the fit, deep back necklines, pre-washed cotton linings, and meticulous seam allowances.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center">
                <span className="font-serif font-bold text-xl text-black dark:text-white block">12,000+</span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Outfits Tailored</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center">
                <span className="font-serif font-bold text-xl text-black dark:text-white block">100%</span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Fit Guarantee</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-xs border border-stone-200 dark:border-stone-800">
              <img
                src={SITE_MEDIA.about.storyPhoto}
                alt="Vandana Creations Craftsmanship"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=700&q=80';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <h2 className="font-serif font-bold text-lg sm:text-xl text-black dark:text-white">
            Our Quality Standards
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-2xs">
            <ShieldCheck className="w-6 h-6 text-black dark:text-white" />
            <h3 className="font-serif font-semibold text-xs text-black dark:text-white">2-Inch Margin</h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">Room for future alterations.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-2xs">
            <Heart className="w-6 h-6 text-black dark:text-white" />
            <h3 className="font-serif font-semibold text-xs text-black dark:text-white">Cotton Linings</h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">Pre-washed & breathable.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-2xs">
            <Award className="w-6 h-6 text-black dark:text-white" />
            <h3 className="font-serif font-semibold text-xs text-black dark:text-white">Hand Zardozi</h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">Pure metallic thread embroidery.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-2xs">
            <Clock className="w-6 h-6 text-black dark:text-white" />
            <h3 className="font-serif font-semibold text-xs text-black dark:text-white">Timely Delivery</h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">Punctual festive completion.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 text-center space-y-3 pt-4">
        <h2 className="font-serif font-bold text-lg sm:text-xl text-black dark:text-white">
          Book a Consultation
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
          Visit our boutique studio for fabric styling and custom measurements.
        </p>
        <Link to="/appointments/book">
          <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Book Your Slot
          </Button>
        </Link>
      </section>
    </div>
  );
};
