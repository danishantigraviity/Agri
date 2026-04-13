import { CheckCircle, Circle, Clock, Package, Truck, Home, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const ORDER_STEPS = [
  { key: 'placed',           label: 'Order Placed',       icon: Package },
  { key: 'confirmed',        label: 'Confirmed',          icon: CheckCircle },
  { key: 'processing',       label: 'Being Processed',    icon: Clock },
  { key: 'packed',           label: 'Packed',             icon: Package },
  { key: 'shipped',          label: 'Shipped',            icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery',   icon: Truck },
  { key: 'delivered',        label: 'Delivered',          icon: Home },
];

const STATUS_INDEX = Object.fromEntries(ORDER_STEPS.map((s, i) => [s.key, i]));

export default function OrderTimeline({ order }) {
  const currentIdx = STATUS_INDEX[order.orderStatus] ?? 0;
  const isCancelled = order.orderStatus === 'cancelled';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
        <div>
          <p className="font-semibold text-red-700">Order Cancelled</p>
          {order.cancellationReason && (
            <p className="text-sm text-red-500">Reason: {order.cancellationReason}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {ORDER_STEPS.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isPending = idx > currentIdx;
        const Icon = step.icon;

        // Find matching tracking event
        const event = order.trackingEvents?.find(e => e.status === step.key);

        return (
          <div key={step.key} className="flex gap-4">
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10
                transition-all duration-300
                ${isDone ? 'bg-primary-600 text-white' : ''}
                ${isCurrent ? 'bg-primary-600 text-white ring-4 ring-primary-100' : ''}
                ${isPending ? 'bg-gray-100 text-gray-400 border-2 border-gray-200' : ''}
              `}>
                {isDone ? (
                  <CheckCircle className="w-4 h-4" />
                ) : isCurrent ? (
                  <Icon className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
              {idx < ORDER_STEPS.length - 1 && (
                <div className={`w-0.5 flex-1 my-1 min-h-[20px] transition-colors duration-300 ${idx < currentIdx ? 'bg-white' : 'bg-gray-200'}`} />
              )}
            </div>

            {/* Content */}
            <div className={`pb-5 flex-1 pt-1 ${idx === ORDER_STEPS.length - 1 ? 'pb-0' : ''}`}>
              <p className={`font-semibold text-sm leading-tight ${isCurrent ? 'text-primary-700' : isPending ? 'text-gray-400' : 'text-primary-800'}`}>
                {step.label}
              </p>
              {event && (
                <>
                  {event.message && (
                    <p className="text-xs text-gray-500 mt-0.5">{event.message}</p>
                  )}
                  {event.location && (
                    <p className="text-xs text-gray-400 mt-0.5">📍 {event.location}</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1">
                    {format(new Date(event.timestamp), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </>
              )}
              {isCurrent && !event && (
                <p className="text-xs text-primary-500 mt-0.5 animate-pulse">In progress...</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
