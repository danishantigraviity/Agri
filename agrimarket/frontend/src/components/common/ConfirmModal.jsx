import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", variant = "danger" }) {
  if (!isOpen) return null;
  
  const isDanger = variant === 'danger';
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl shadow-gray-900/20 max-w-sm w-full p-6 animate-in zoom-in-95 duration-200 border border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDanger ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-primary-50 text-primary-600 border border-primary-100'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-primary-800 hover:bg-gray-50 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <h3 className="text-xl font-black text-primary-800 tracking-tight">{title}</h3>
        <p className="text-sm text-gray-500 mt-2 font-medium leading-relaxed">{message}</p>
        
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all active:scale-95">
            Cancel
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className={`flex-1 py-3 px-4 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md ${isDanger ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-primary-600 hover:bg-primary-500 shadow-primary-600/20'}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
