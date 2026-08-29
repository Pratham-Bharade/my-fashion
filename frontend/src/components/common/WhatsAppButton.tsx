import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const WhatsAppButton: React.FC = () => {
  const { settings } = useSettings();
  const rawPhone = settings?.whatsapp || '+919322228426';
  const cleanNumber = rawPhone.replace(/[^\d]/g, '');

  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    'Hello Vandana Creations, I would like to inquire about bespoke tailoring & custom stitching.'
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 md:bottom-7 right-4 md:right-7 z-40 flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-3.5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 active:scale-95 select-none"
      aria-label="Chat with us on WhatsApp"
      title="Chat with Master Tailor on WhatsApp"
    >
      <div className="relative">
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full animate-ping" />
      </div>
      <span className="text-xs font-bold tracking-wide hidden sm:inline-block">
        WhatsApp Chat
      </span>
    </a>
  );
};
