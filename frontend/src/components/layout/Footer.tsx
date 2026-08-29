import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { Phone, Mail, MapPin, MessageCircle, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  const businessName = settings?.business_name || 'Vandana Creations';
  const phone = settings?.phone || '+91 93222 28426';
  const email = settings?.email || 'vandanabharade358@gmail.com';
  const address = settings?.address || 'Moshi, Pune, Maharashtra 412105';
  const whatsapp = settings?.whatsapp || '9322228426';

  return (
    <footer className="bg-white dark:bg-stone-950 text-stone-600 dark:text-stone-400 pt-10 pb-20 md:pb-8 border-t border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Vandana Creations"
                className="h-16 sm:h-20 w-auto object-contain"
              />
              <div>
                <span className="font-serif font-bold text-lg sm:text-xl text-black dark:text-white tracking-tight block">
                  {businessName}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500 dark:text-stone-400 block">
                  Sarees • Kurtis • Blouses
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Bespoke tailoring, bridal blouses, and everyday elegance crafted to your exact fit.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=Hi%20Vandana%20Creations,%20I%20have%20an%20inquiry%20regarding%20custom%20stitching`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-black dark:text-white text-xs font-semibold border border-stone-300 dark:border-stone-700 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
              <a
                href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-stone-800 dark:hover:bg-stone-200 text-xs font-semibold transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Call
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-black dark:text-white text-xs uppercase tracking-wider mb-3">
              Services
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
              <li><Link to="/services?category=BLOUSE" className="hover:text-black dark:hover:text-white transition-colors">Designer & Bridal Blouses</Link></li>
              <li><Link to="/services?category=TRADITIONAL" className="hover:text-black dark:hover:text-white transition-colors">Sarees & Lehengas</Link></li>
              <li><Link to="/services?category=KURTIS" className="hover:text-black dark:hover:text-white transition-colors">Kurtis & Suits</Link></li>
              <li><Link to="/services?category=ALTERATIONS" className="hover:text-black dark:hover:text-white transition-colors">Alterations</Link></li>
            </ul>
          </div>

          {/* Timings */}
          <div>
            <h4 className="font-serif font-bold text-black dark:text-white text-xs uppercase tracking-wider mb-3">
              Hours
            </h4>
            <div className="space-y-1 text-xs text-stone-600 dark:text-stone-400">
              <p>Mon – Sat: <span className="font-semibold text-black dark:text-white">10 AM – 8 PM</span></p>
              <p>Sunday: <span className="font-semibold text-black dark:text-white">11 AM – 5 PM</span></p>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 pt-1">* Trials by appointment</p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-bold text-black dark:text-white text-xs uppercase tracking-wider mb-3">
              Visit
            </h4>
            <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-black dark:text-white shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-black dark:hover:text-white break-all">{email}</a>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="hover:text-black dark:hover:text-white">{phone}</a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-8 pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 gap-2">
          <p>© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Handcrafted with <Heart className="w-3 h-3 text-black dark:text-white fill-black dark:fill-white" /> for Graceful Fashion
          </p>
        </div>
      </div>
    </footer>
  );
};
