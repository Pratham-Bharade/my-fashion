import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/Badge';
import { OrderStatus, AppointmentStatus, Appointment, Order } from '../../types';
import {
  Calendar,
  Clock,
  Scissors,
  CheckCircle2,
  Circle,
  MessageCircle,
  Sparkles,
  MapPin,
  Check
} from 'lucide-react';

interface BookingTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    type: 'ORDER' | 'APPOINTMENT';
    order?: Order;
    appointment?: Appointment;
  } | null;
}

const ORDER_STAGES: Array<{ status: OrderStatus; label: string; description: string }> = [
  { status: 'ORDER_RECEIVED', label: '1. Booking & Order Received', description: 'Design registered and fabrics verified at workshop.' },
  { status: 'MEASUREMENTS_CONFIRMED', label: '2. Measurements Confirmed', description: 'Pattern draft verified by master tailor.' },
  { status: 'CUTTING', label: '3. Precision Cutting', description: 'Fabric cut to exact customer body allowances.' },
  { status: 'STITCHING', label: '4. Artisan Stitching', description: 'Active tailoring, lining, and machine work in progress.' },
  { status: 'QUALITY_CHECK', label: '5. Quality & Pressing', description: 'Piping, latkans, thread trimming & steam ironing.' },
  { status: 'READY', label: '6. Ready for Trial / Pickup', description: 'Packed & ready at Vandana Creations boutique.' },
  { status: 'DELIVERED', label: '7. Delivered to Customer', description: 'Final fitting completed & handed over.' },
];

const APPOINTMENT_STAGES: Array<{ status: AppointmentStatus; label: string; description: string }> = [
  { status: 'PENDING', label: '1. Booking Request Submitted', description: 'Your slot request has been sent to our boutique.' },
  { status: 'CONFIRMED', label: '2. Slot Confirmed by Atelier', description: 'Master tailor reserved your consultation timing.' },
  { status: 'COMPLETED', label: '3. Fitting & Consultation Done', description: 'Measurements and styling completed in studio.' },
];

const getOrderProgressPercent = (status: OrderStatus) => {
  switch (status) {
    case 'ORDER_RECEIVED': return 15;
    case 'MEASUREMENTS_CONFIRMED': return 30;
    case 'CUTTING': return 50;
    case 'STITCHING': return 70;
    case 'QUALITY_CHECK': return 85;
    case 'READY': return 95;
    case 'DELIVERED': return 100;
    case 'CANCELLED': return 0;
    default: return 15;
  }
};

const getAppointmentProgressPercent = (status: AppointmentStatus) => {
  switch (status) {
    case 'PENDING': return 33;
    case 'CONFIRMED': return 66;
    case 'COMPLETED': return 100;
    case 'CANCELLED': return 0;
    default: return 33;
  }
};

export const BookingTrackModal: React.FC<BookingTrackModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  if (!item) return null;

  const isOrder = item.type === 'ORDER' && item.order;
  const order = item.order;
  const appointment = item.appointment;

  const percent = isOrder
    ? getOrderProgressPercent(order!.status)
    : getAppointmentProgressPercent(appointment!.status);

  const title = isOrder
    ? `Track Order #${order!.order_number}`
    : `Track Booking: ${appointment?.service?.name || 'Fitting Session'}`;

  const currentStatusStr = isOrder ? order!.status : appointment!.status;

  const whatsappMsg = isOrder
    ? `Hello Vandana Creations! I'm checking the status of my Order #${order!.order_number} (${order!.service?.name || 'Tailoring'}).`
    : `Hello Vandana Creations! I'm checking on my appointment scheduled for ${new Date(appointment!.appointment_date).toLocaleDateString('en-IN')} at ${appointment!.start_time}.`;

  const whatsappUrl = `https://wa.me/919322228426?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="lg">
      <div className="space-y-6 text-stone-900 dark:text-stone-100">
        
        {/* Status and Overview Header */}
        <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">
                Current Production Status
              </span>
              <h3 className="font-serif font-bold text-lg text-black dark:text-white">
                {isOrder
                  ? order!.service?.name || order!.design?.title || order!.notes || `Order #${order!.order_number}`
                  : appointment?.service?.name || 'In-Studio Fitting Visit'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={currentStatusStr} />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-stone-600 dark:text-stone-400">
                Live Production Progress
              </span>
              <span className="font-bold text-black dark:text-white">{percent}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  currentStatusStr === 'CANCELLED'
                    ? 'bg-rose-500'
                    : percent >= 95
                    ? 'bg-emerald-500'
                    : 'bg-black dark:bg-white'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Dates & Quick Info */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
            <div>
              <span className="text-[10px] font-bold uppercase text-stone-400 block">
                {isOrder ? 'Expected Delivery' : 'Scheduled Slot'}
              </span>
              <span className="font-semibold text-black dark:text-white">
                {isOrder
                  ? order!.expected_delivery_date
                    ? new Date(order!.expected_delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Scheduled with atelier'
                  : `${new Date(appointment!.appointment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at ${appointment!.start_time}`}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-stone-400 block">
                {isOrder ? 'Amount' : 'Measurement Profile'}
              </span>
              <span className="font-semibold text-black dark:text-white truncate block">
                {isOrder
                  ? `₹${order!.price.toLocaleString('en-IN')}`
                  : appointment!.measurement_profile?.name || 'In-Studio Measurements'}
              </span>
            </div>
          </div>
        </div>

        {/* All Stages Timeline */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-sm text-black dark:text-white flex items-center gap-1.5">
            <Scissors className="w-4 h-4 text-black dark:text-white" />
            <span>All Stages & Live Progress</span>
          </h4>

          {isOrder ? (
            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800">
              {ORDER_STAGES.map((stage, idx) => {
                const currentStageIdx = ORDER_STAGES.findIndex((s) => s.status === order!.status);
                const isCompleted = idx < currentStageIdx || order!.status === 'DELIVERED';
                const isCurrent = idx === currentStageIdx && order!.status !== 'DELIVERED';
                const historyEntry = order!.status_history?.find((h) => h.status === stage.status);

                return (
                  <div key={stage.status} className="relative flex items-start">
                    {/* Dot */}
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white dark:bg-stone-900 transition-colors ${
                        isCompleted
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:border-emerald-500'
                          : isCurrent
                          ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black shadow-xs ring-2 ring-stone-200 dark:ring-stone-700'
                          : 'border-stone-300 dark:border-stone-700 text-stone-300'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : isCurrent ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black animate-ping" />
                      ) : (
                        <Circle className="w-1.5 h-1.5 fill-stone-300 dark:fill-stone-700" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h5
                          className={`text-xs sm:text-sm font-bold ${
                            isCurrent
                              ? 'text-black dark:text-white'
                              : isCompleted
                              ? 'text-stone-800 dark:text-stone-200'
                              : 'text-stone-400 dark:text-stone-600'
                          }`}
                        >
                          {stage.label}
                        </h5>
                        {historyEntry && (
                          <span className="text-[10px] text-stone-400">
                            {new Date(historyEntry.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] mt-0.5 ${isCurrent ? 'text-stone-700 dark:text-stone-300 font-medium' : 'text-stone-400 dark:text-stone-500'}`}>
                        {historyEntry?.notes || stage.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800">
              {APPOINTMENT_STAGES.map((stage, idx) => {
                const currentStageIdx = APPOINTMENT_STAGES.findIndex((s) => s.status === appointment!.status);
                const isCompleted = idx < currentStageIdx || appointment!.status === 'COMPLETED';
                const isCurrent = idx === currentStageIdx && appointment!.status !== 'COMPLETED';

                return (
                  <div key={stage.status} className="relative flex items-start">
                    {/* Dot */}
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white dark:bg-stone-900 transition-colors ${
                        isCompleted
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:border-emerald-500'
                          : isCurrent
                          ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black shadow-xs ring-2 ring-stone-200 dark:ring-stone-700'
                          : 'border-stone-300 dark:border-stone-700 text-stone-300'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : isCurrent ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black animate-ping" />
                      ) : (
                        <Circle className="w-1.5 h-1.5 fill-stone-300 dark:fill-stone-700" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h5
                        className={`text-xs sm:text-sm font-bold ${
                          isCurrent
                            ? 'text-black dark:text-white'
                            : isCompleted
                            ? 'text-stone-800 dark:text-stone-200'
                            : 'text-stone-400 dark:text-stone-600'
                        }`}
                      >
                        {stage.label}
                      </h5>
                      <p className={`text-[11px] mt-0.5 ${isCurrent ? 'text-stone-700 dark:text-stone-300 font-medium' : 'text-stone-400 dark:text-stone-500'}`}>
                        {stage.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Tailor</span>
          </a>

          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close Tracker
          </Button>
        </div>
      </div>
    </Modal>
  );
};
