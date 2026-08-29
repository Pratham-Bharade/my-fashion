import React from 'react';
import { OrderStatus, OrderStatusHistory } from '../../types';
import { CheckCircle2, Circle, Clock, Scissors, Sparkles, Truck, Check } from 'lucide-react';

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  history?: OrderStatusHistory[];
}

const STAGES: Array<{ status: OrderStatus; label: string; description: string }> = [
  { status: 'ORDER_RECEIVED', label: 'Order Received', description: 'Order recorded and fabrics checked.' },
  { status: 'MEASUREMENTS_CONFIRMED', label: 'Measurements Verified', description: 'Tailoring master confirmed pattern measurements.' },
  { status: 'CUTTING', label: 'Cutting Stage', description: 'Fabric precision cut with margin allowances.' },
  { status: 'STITCHING', label: 'Artisan Stitching', description: 'Under active stitching and lining construction.' },
  { status: 'QUALITY_CHECK', label: 'Quality & Finishing', description: 'Piping, latkans, thread trimming & iron press.' },
  { status: 'READY', label: 'Ready for Pickup / Dispatch', description: 'Garment packed and ready in boutique.' },
  { status: 'DELIVERED', label: 'Delivered to Customer', description: 'Garment fitted and handed over.' },
];

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ currentStatus, history = [] }) => {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
        This order has been marked as cancelled.
      </div>
    );
  }

  const currentStageIndex = STAGES.findIndex((s) => s.status === currentStatus);

  return (
    <div className="py-2">
      <div className="relative pl-6 sm:pl-8 space-y-6 sm:space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const isFuture = idx > currentStageIndex;

          const historyEntry = history.find((h) => h.status === stage.status);

          return (
            <div key={stage.status} className="relative flex items-start group">
              {/* Dot Icon */}
              <div
                className={`absolute -left-6 sm:-left-8 top-0.5 w-6 sm:w-7 h-6 sm:h-7 rounded-full flex items-center justify-center border-2 bg-white transition-colors ${
                  isCompleted
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-600'
                    : isCurrent
                    ? 'border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-600/30 ring-4 ring-brand-100'
                    : 'border-stone-300 text-stone-300'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                ) : (
                  <Circle className="w-2.5 h-2.5 fill-stone-200" />
                )}
              </div>

              {/* Stage Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-sm sm:text-base font-bold ${
                      isCurrent
                        ? 'text-brand-700 font-serif'
                        : isCompleted
                        ? 'text-stone-900'
                        : 'text-stone-400'
                    }`}
                  >
                    {stage.label}
                  </h4>
                  {historyEntry && (
                    <span className="text-[11px] text-stone-400 font-medium whitespace-nowrap">
                      {new Date(historyEntry.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                <p
                  className={`text-xs mt-0.5 leading-relaxed ${
                    isCurrent
                      ? 'text-stone-700 font-medium'
                      : isCompleted
                      ? 'text-stone-500'
                      : 'text-stone-400'
                  }`}
                >
                  {historyEntry?.notes || stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
