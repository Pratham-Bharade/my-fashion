import React, { useState, useEffect } from 'react';
import { contactApi } from '../../api/contact';
import { ContactMessage } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import { MessageSquare, Phone, Mail, CheckCircle2 } from 'lucide-react';

export const AdminContactInquiriesPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const res = await contactApi.listAdmin({ limit: 50 });
      setMessages(res.items);
    } catch (err) {
      console.error('Failed to load contact messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'REPLIED' | 'ARCHIVED') => {
    try {
      await contactApi.updateStatus(id, status);
      success(`Message marked as ${status.toLowerCase()}.`);
      fetchMessages();
    } catch (err: any) {
      toastError(err.message || 'Failed to update message.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif font-bold text-2xl text-stone-900">
          Customer Inquiries & Messages
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Messages submitted through the public storefront contact form.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : messages.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-8 h-8" />}
          title="No Contact Inquiries"
          description="Customer messages will appear here."
        />
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-stone-900">{m.name}</h3>
                    <StatusBadge status={m.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 text-xs text-stone-500 mt-0.5">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {m.email}</span>
                    {m.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {m.phone}</span>}
                    <span>• {new Date(m.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-0">
                  {m.status === 'NEW' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateStatus(m.id, 'REPLIED')}
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Mark Replied
                    </Button>
                  )}
                  {m.status !== 'ARCHIVED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(m.id, 'ARCHIVED')}
                    >
                      Archive
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-sm text-stone-800 bg-stone-50 p-3.5 rounded-2xl border border-stone-100 leading-relaxed font-medium">
                "{m.message}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
