import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { servicesApi } from '../../api/services';
import { designsApi } from '../../api/designs';
import { reviewsApi } from '../../api/reviews';
import { Service, Design, Review } from '../../types';
import { ServiceCard } from '../../components/customer/ServiceCard';
import { DesignCard } from '../../components/customer/DesignCard';
import { Button } from '../../components/common/Button';
import { SITE_MEDIA } from '../../config/siteMedia';
import {
  Calendar,
  Sparkles,
  Ruler,
  Star,
  ChevronRight,
  ShieldCheck,
  Clock,
  MessageCircle
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [featuredDesigns, setFeaturedDesigns] = useState<Design[]>([]);
  const [testimonials, setTestimonials] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [srvRes, desRes, revRes] = await Promise.all([
          servicesApi.list(),
          designsApi.list({ limit: 4 }),
          reviewsApi.getPublic(3),
        ]);
        setFeaturedServices((srvRes?.data || []).slice(0, 4));
        setFeaturedDesigns((desRes?.items || []).slice(0, 4));
        setTestimonials(revRes?.data || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
        setFeaturedServices([]);
        setFeaturedDesigns([]);
        setTestimonials([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-12 sm:space-y-16 pb-12 bg-white dark:bg-stone-950 transition-colors">
      
      {/* 1. COMPACT HERO SECTION */}
      <section className="relative pt-6 sm:pt-10 pb-8 sm:pb-12 bg-white dark:bg-stone-950 border-b border-stone-100 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                VANDANA CREATIONS • BESPOKE TAILORING
              </div>

              <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-black dark:text-white leading-tight">
                Graceful. Modern. <br />
                <span className="italic font-normal text-stone-700 dark:text-stone-300">Bespoke Fits.</span>
              </h1>

              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto lg:mx-0 leading-relaxed">
                Custom designer blouses, sarees, kurtis, and lehengas tailored to your exact measurements with premium finish.
              </p>

              {/* Action Buttons: Book Slot | View Gallery | WhatsApp */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1">
                <Link to="/appointments/book">
                  <Button variant="primary" size="md" leftIcon={<Calendar className="w-4 h-4" />}>
                    Book Slot
                  </Button>
                </Link>
                <Link to="/designs">
                  <Button variant="outline" size="md" leftIcon={<Sparkles className="w-4 h-4" />}>
                    View Gallery
                  </Button>
                </Link>
                <a
                  href="https://wa.me/919322228426?text=Hello%20Vandana%20Creations,%20I%20would%20like%20to%20inquire%20about%20custom%20stitching."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="md"
                    leftIcon={<MessageCircle className="w-4 h-4" />}
                  >
                    WhatsApp
                  </Button>
                </a>
              </div>

              {/* Minimalist Stat Badges */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-stone-200 dark:border-stone-800 max-w-sm mx-auto lg:mx-0 text-center">
                <div>
                  <span className="font-serif font-bold text-base sm:text-lg text-black dark:text-white">15+ Yrs</span>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">Craftsmanship</p>
                </div>
                <div className="border-x border-stone-200 dark:border-stone-800">
                  <span className="font-serif font-bold text-base sm:text-lg text-black dark:text-white">100%</span>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">Fit Guarantee</p>
                </div>
                <div>
                  <span className="font-serif font-bold text-base sm:text-lg text-black dark:text-white">4.9 ★</span>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">Rating</p>
                </div>
              </div>

              {/* Custom Requests Option Bar */}
              <div className="pt-3 max-w-sm mx-auto lg:mx-0">
                <Link
                  to="/custom-requests/create"
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black hover:bg-stone-800 dark:hover:bg-stone-200 shadow-sm transition-all group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/20 dark:bg-black/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-amber-300 dark:text-amber-600 animate-pulse" />
                    </div>
                    <div className="text-left">
                      <span className="font-serif font-bold text-xs block leading-tight">Custom Stitching Request</span>
                      <span className="text-[10px] text-stone-300 dark:text-stone-600 block">Have a reference photo? Upload & get quote</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Compact Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-xs sm:max-w-sm aspect-4/5 rounded-2xl overflow-hidden shadow-md border-2 border-black dark:border-stone-700 bg-stone-100 dark:bg-stone-800">
                <img
                  src={SITE_MEDIA.home.heroPhoto}
                  alt="Vandana Creations Saree & Blouse"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/homepage_photo.png';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 text-white">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-white text-black text-[9px] font-bold uppercase">
                      Bridal Couture
                    </span>
                    <h3 className="font-serif font-semibold text-sm text-white mt-1">
                      Bespoke Silk & Zardozi Craft
                    </h3>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. TAILORING SERVICES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 block">
              Sarees • Kurtis • Blouses
            </span>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-black dark:text-white">
              Our Services
            </h2>
          </div>
          <Link to="/services">
            <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
              All Services
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {featuredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* 3. WHY CHOOSE VANDANA CREATIONS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800">
          <div className="text-center max-w-lg mx-auto mb-6 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
              The Vandana Touch
            </span>
            <h2 className="font-serif font-bold text-lg sm:text-xl text-black dark:text-white">
              Why Women Choose Us
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3.5 rounded-xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-center space-y-1.5 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mx-auto">
                <Ruler className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-semibold text-xs text-black dark:text-white">Measurement Vault</h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">Save your precise size profile once.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-center space-y-1.5 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mx-auto">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-semibold text-xs text-black dark:text-white">Custom Photo Upload</h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">Tailor from your reference image.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-center space-y-1.5 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mx-auto">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-semibold text-xs text-black dark:text-white">2" Alter Margin</h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">Extra seam allowance for adjustments.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-center space-y-1.5 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mx-auto">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-semibold text-xs text-black dark:text-white">Live Stage Tracking</h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">Track Cutting to Ready status.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. GALLERY PREVIEW */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 block">
              Portfolio
            </span>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-black dark:text-white">
              Featured Designs
            </h2>
          </div>
          <Link to="/designs">
            <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
              All Designs
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {featuredDesigns.map((design) => (
            <DesignCard key={design.id} design={design} />
          ))}
        </div>
      </section>

      {/* 5. 5-STEP JOURNEY */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-2xs">
          <div className="text-center mb-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Simple Process
            </span>
            <h2 className="font-serif font-bold text-base sm:text-lg text-black dark:text-white">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center">
            {[
              { step: '1', title: 'Service' },
              { step: '2', title: 'Book Slot' },
              { step: '3', title: 'Size' },
              { step: '4', title: 'Stitching' },
              { step: '5', title: 'Ready' },
            ].map((item) => (
              <div key={item.step} className="space-y-1">
                <span className="inline-flex w-7 h-7 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold items-center justify-center">
                  {item.step}
                </span>
                <p className="text-[11px] font-medium text-stone-800 dark:text-stone-200 block">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. REVIEWS */}
      {testimonials.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-5">
            <h2 className="font-serif font-bold text-lg sm:text-xl text-black dark:text-white">
              Client Feedback
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {testimonials.map((rev) => (
              <div key={rev.id} className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2 shadow-2xs">
                <div className="flex text-black dark:text-white">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-black dark:fill-white" />
                  ))}
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 italic">
                  "{rev.comment}"
                </p>
                <div className="pt-1 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-black dark:text-white">{rev.customer?.name || 'Client'}</span>
                  <span className="text-stone-500 dark:text-stone-400 font-medium">Verified</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. COMPACT CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl bg-black dark:bg-stone-900 text-white p-6 sm:p-8 text-center space-y-3 shadow-sm border dark:border-stone-800">
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-white">
            Ready to stitch your perfect outfit?
          </h2>
          <p className="text-xs text-stone-300 max-w-sm mx-auto">
            Book an atelier trial slot or upload your reference photo for a quick price quote.
          </p>
          <div className="pt-1">
            <Link to="/appointments/book">
              <Button variant="outline" size="sm" className="bg-white text-black hover:bg-stone-100 border-none" leftIcon={<Calendar className="w-3.5 h-3.5" />}>
                Book Consultation Slot
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
