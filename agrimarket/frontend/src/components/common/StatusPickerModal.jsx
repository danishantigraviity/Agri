import { X, Clock, CheckCircle, Zap, Package, Truck, MapPin, XCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';

const STATUS_CONFIG = {
  placed:            { label: 'Placed',            icon: Clock,       color: 'blue',   bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-100',    hover: 'hover:bg-blue-100 transition-all shadow-blue-100/50' },
  confirmed:         { label: 'Confirmed',         icon: CheckCircle, color: 'amber',  bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-100',   hover: 'hover:bg-amber-100 transition-all shadow-amber-100/50' },
  processing:        { label: 'Processing',        icon: Zap,         color: 'purple', bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-100',  hover: 'hover:bg-purple-100 transition-all shadow-purple-100/50' },
  packed:            { label: 'Packed',            icon: Package,     color: 'violet', bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-100',  hover: 'hover:bg-violet-100 transition-all shadow-violet-100/50' },
  shipped:           { label: 'Shipped',           icon: Truck,       color: 'indigo', bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-100',  hover: 'hover:bg-indigo-100 transition-all shadow-indigo-100/50' },
  out_for_delivery: { label: 'Out for Delivery', icon: MapPin,      color: 'sky',    bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-100',     hover: 'hover:bg-sky-100 transition-all shadow-sky-100/50' },
  delivered:         { label: 'Delivered',         icon: CheckCircle, color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', hover: 'hover:bg-emerald-100 transition-all shadow-emerald-100/50' },
  cancelled:         { label: 'Cancelled',         icon: XCircle,     color: 'rose',    bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-100',    hover: 'hover:bg-rose-100 transition-all shadow-rose-100/50' },
};

export default function StatusPickerModal({ isOpen, onClose, currentStatus, onSelect, orderNumber }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-white/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-lg bg-white rounded-[1.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-primary-800">Update Status</h2>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5 font-bold uppercase tracking-wider"># {orderNumber}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors active:scale-90"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => {
              const Icon = config.icon;
              const isActive = currentStatus === status;
              
              return (
                <button
                  key={status}
                  onClick={() => {
                    onSelect(status);
                    onClose();
                  }}
                  className={`group relative flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-300 overflow-hidden
                    ${isActive ? `${config.border} ${config.bg} ring-4 ring-gray-100/50 shadow-sm` : `border-gray-50 bg-white hover:border-gray-100 ${config.hover} hover:shadow-lg hover:-translate-y-1`}
                  `}
                >
                  {/* Icon Container */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all bg-white shadow-sm border border-gray-50 group-hover:scale-110 duration-500
                    ${isActive ? config.text : 'text-gray-400 group-hover:' + config.text}
                  `}>
                    <Icon className="w-4.5 h-4.5" strokeWidth={2.5} />
                  </div>

                  {/* Label */}
                  <div className="text-left font-bold tracking-tight">
                    <p className={`text-xs transition-colors ${isActive ? config.text : 'text-gray-500 group-hover:text-primary-800'}`}>
                      {config.label}
                    </p>
                  </div>
                  
                  {/* Status Indicator */}
                  {isActive && (
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full animate-pulse bg-current" />
                  )}
                  
                  {/* Subtle Background Glow */}
                  <div className={`absolute -right-3 -bottom-3 w-14 h-14 rounded-full opacity-5 transition-all duration-500 group-hover:scale-150 ${config.bg}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all active:scale-95"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
