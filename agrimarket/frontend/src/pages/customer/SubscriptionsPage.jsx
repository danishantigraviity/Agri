import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Plus, PauseCircle, XCircle, Clock, CreditCard, ArrowRight, Package } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function SubscriptionsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ 
    queryKey: ['my-subs'], 
    queryFn: () => api.get('/subscriptions/my').then(r => r.data.data) 
  });

  const pause = useMutation({ 
    mutationFn: (id) => api.patch(`/subscriptions/${id}/pause`), 
    onSuccess: () => { 
      toast.success('Subscription paused'); 
      qc.invalidateQueries(['my-subs']); 
    } 
  });

  const cancel = useMutation({ 
    mutationFn: (id) => api.patch(`/subscriptions/${id}/cancel`), 
    onSuccess: () => { 
      toast.success('Subscription cancelled'); 
      qc.invalidateQueries(['my-subs']); 
    } 
  });

  const subs = data || [];

  return (
    <div className="page-container py-12 max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-primary-800 tracking-tighter">My Subscriptions</h1>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.2em] opacity-70">
            Automated farm-to-table deliveries
          </p>
        </div>
        <Link 
          to="/" 
          className="flex items-center gap-2.5 px-6 py-3 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/30 active:scale-95 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" strokeWidth={3} /> New Plan
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1,2].map(i => (
            <div key={i} className="card h-40 animate-pulse bg-gray-50 border-gray-100 rounded-3xl" />
          ))}
        </div>
      ) : subs.length === 0 ? (
        <div className="card p-20 flex flex-col items-center justify-center text-center space-y-8 bg-gray-50/50 border-dashed border-2 border-gray-200">
          <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-xl group hover:rotate-180 transition-transform duration-1000">
            <RefreshCw className="w-10 h-10 text-gray-200" strokeWidth={1} />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-primary-800 tracking-tight">No active plans</h3>
            <p className="text-sm text-gray-500 font-medium max-w-xs mx-auto leading-relaxed">
              Subscribe for daily milk, fresh vegetables and more to enjoy seamless farm deliveries.
            </p>
          </div>

          <Link 
            to="/" 
            className="flex items-center gap-2.5 px-8 py-4 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/30 active:scale-95 transition-all shadow-lg"
          >
            Start Your First Plan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {subs.map(s => (
            <div key={s._id} className="card overflow-hidden group hover:shadow-2xl hover:shadow-gray-900/5 transition-all duration-500">
              <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                  <div className="flex items-start gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110
                      ${s.status === 'active' ? 'bg-emerald-500 text-white shadow-emerald-200' : 
                        s.status === 'paused' ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-rose-500 text-white shadow-rose-200'}`}>
                      <RefreshCw className={`w-6 h-6 ${s.status === 'active' ? 'animate-spin-slow' : ''}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                          ${s.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                            s.status === 'paused' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                          {s.status === 'active' && <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />}
                          {s.status}
                        </span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {s._id.slice(-6)}</span>
                      </div>
                      <h4 className="text-xl font-black text-primary-800 tracking-tight capitalize">
                        {s.frequency?.replace(/_/g, ' ')} Delivery Plan
                      </h4>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-primary-500" />
                        {s.deliverySlot} Slot
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 self-end md:self-start">
                    {s.status === 'active' && (
                      <button 
                        onClick={() => pause.mutate(s._id)} 
                        className="px-5 py-2.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-black uppercase tracking-widest border border-amber-100 hover:bg-amber-100 transition-all active:scale-95 flex items-center gap-2"
                      >
                        <PauseCircle className="w-4 h-4" /> Pause
                      </button>
                    )}
                    {s.status !== 'cancelled' && (
                      <button 
                        onClick={() => { if(window.confirm('Cancel this subscription plan?')) cancel.mutate(s._id); }} 
                        className="px-5 py-2.5 bg-white text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-50 transition-all active:scale-95 flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" /> Terminate
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subscribed Items</p>
                    <div className="space-y-3">
                      {s.items?.map(i => (
                        <div key={i._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100 transition-all group/item">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-300 border border-gray-100">
                              <Package className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-primary-800 group-hover/item:text-primary-600 transition-colors capitalize">{i.product?.name || 'Product'}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Qty: {i.quantity}</p>
                            </div>
                          </div>
                          <span className="text-sm font-black text-primary-700 tabular-nums">₹{i.discountedPrice}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-5 bg-primary-50/50 rounded-2xl border border-primary-100/50">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Financial Summary</p>
                        <CreditCard className="w-4 h-4 text-primary-400" />
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-primary-800 tracking-tighter">₹{s.items?.reduce((acc, i) => acc + (i.discountedPrice * i.quantity), 0)}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">/ Cycle</span>
                      </div>
                    </div>

                    {s.nextDeliveryDate && s.status === 'active' && (
                      <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-widest">
                          Incoming Stream: {format(new Date(s.nextDeliveryDate), 'dd MMMM yyyy')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Bottom Decorative Pattern */}
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-50" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
