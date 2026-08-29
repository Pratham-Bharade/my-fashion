import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { contactApi } from '../../api/contact';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Phone, Mail, MapPin, MessageCircle, Clock, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const businessName = settings?.business_name || 'Vandana Creations';
  const phoneNum = settings?.phone || '+91 93222 28426';
  const emailAddr = settings?.email || 'vandanabharade358@gmail.com';
  const address = settings?.address || 'Moshi, Pune, Maharashtra 412105';
  const whatsapp = settings?.whatsapp || '9322228426';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all required fields (Name, Email, and Message).');
      return;
    }

    setIsSubmitting(true);

    try {
      await contactApi.submit({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        message: message.trim(),
      });
      success('Thank you! Your message has been sent to Vandana Creations.');
      setIsSubmitted(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      const errMsg = err.message || 'Failed to send message. Please try again or WhatsApp us directly.';
      setError(errMsg);
      toastError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Header */}
      <section className="pt-8 pb-2 text-center max-w-xl mx-auto px-4 space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
          Get In Touch
        </span>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white">
          Contact Atelier
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Message us for bridal queries, blouse customizations, or studio appointments.
        </p>
      </section>

      {/* Main Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left Details */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
              <h2 className="font-serif font-bold text-base text-black dark:text-white">
                Atelier Location
              </h2>

              <div className="space-y-3 text-xs text-stone-600 dark:text-stone-400">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5" />
                  <span className="font-medium text-stone-800 dark:text-stone-200">{address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-black dark:text-white shrink-0" />
                  <a href={`tel:${phoneNum.replace(/[^0-9+]/g, '')}`} className="hover:text-black dark:hover:text-white font-semibold text-stone-800 dark:text-stone-200">
                    {phoneNum}
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-black dark:text-white shrink-0" />
                  <a href={`mailto:${emailAddr}`} className="hover:text-black dark:hover:text-white text-stone-800 dark:text-stone-200 break-all font-medium">
                    {emailAddr}
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-black dark:text-white shrink-0" />
                  <span>Mon – Sat: 10 AM – 8 PM (Sunday: 11 AM – 5 PM)</span>
                </div>
              </div>

              {/* Direct Buttons */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=Hi%20Vandana%20Creations,%20I%20have%20an%20inquiry%20regarding%20custom%20stitching`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-black dark:text-white text-xs font-semibold border border-stone-300 dark:border-stone-700 shadow-2xs transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
                <a
                  href={`tel:${phoneNum.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-stone-800 dark:hover:bg-stone-200 text-xs font-semibold shadow-2xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Studio
                </a>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="md:col-span-7">
            <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs">
              <h2 className="font-serif font-bold text-base text-black dark:text-white mb-4">
                Send a Direct Message
              </h2>

              {isSubmitted ? (
                <div className="text-center py-6 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-black dark:text-white mx-auto" />
                  <h3 className="font-serif font-bold text-base text-black dark:text-white">Message Received!</h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Thank you for reaching out. We will get back to you shortly.</p>
                  <Button variant="outline" size="sm" onClick={() => setIsSubmitted(false)} className="mt-2">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  {error && (
                    <div className="p-2.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-medium">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Your Name *"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      required
                    />
                    <Input
                      label="Email Address *"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. priya@example.com"
                      required
                    />
                  </div>

                  <Input
                    label="Phone Number"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                  />

                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Message / Design Query *
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your blouse, saree, or kurti stitching requirement..."
                      className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 px-3 py-2 text-xs focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors"
                      required
                    />
                  </div>

                  <Button type="submit" variant="primary" size="md" fullWidth isLoading={isSubmitting} leftIcon={<Send className="w-3.5 h-3.5" />}>
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
