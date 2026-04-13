import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, CheckCircle, Clock, Truck, ShoppingBag, Zap, MapPin, XCircle, ArrowRight, Filter, Check } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function FarmerOrders() {
  const [status, setStatus] = useState('');
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['farmer-orders', status],
    queryFn: () => api.get('/orders/farmer-orders', { params: { status: status||undefined, limit: 50 } }).then(r => r.data.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => { 
      toast.success('Order fulfilled successfully'); 
      qc.invalidateQueries(['farmer-orders']); 
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  });

  if (isError) {
    const msg = error.response?.data?.message || error.message || 'Failed to fetch orders';
    return (
      <div className="card p-10 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4"><ShoppingBag /></div>
        <h3 className="text-lg font-bold text-primary-800">Error Loading Orders</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-xs">{msg}</p>
        <button onClick={() => qc.invalidateQueries(['farmer-orders'])} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold">Retry</button>
      </div>
    );
  }

  const orders = data?.orders || [];
  
  const TABS = [
    { value: '',         label: 'Live Stream',   icon: Zap,         color: 'emerald' },
    { value: 'placed',   label: 'New Queue',     icon: Clock,       color: 'blue'    },
    { value: 'confirmed', label: 'In Review',     icon: CheckCircle, color: 'amber'   },
    { value: 'packed',    label: 'Ready Ship',    icon: Package,     color: 'violet'  },
    { value: 'shipped',   label: 'In Transit',    icon: Truck,       color: 'indigo'  },
  ];

  return (
    <div className="space-y-6 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-primary-800 tracking-tight">Fulfillment Center</h1>
          <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-widest opacity-80">Cycle control and logistics</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-900/5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">{orders.length} ACTIVE BATCH</span>
        </div>
      </div>

      {/* Modern High-Fidelity Filter Chips */}
      <div className="flex flex-wrap gap-2.5 pb-2 overflow-x-auto no-scrollbar">
        {TABS.map(t => {
          const Icon = t.icon;
          const isActive = status === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setStatus(t.value)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap active:scale-95 shadow-sm
                ${isActive 
                  ? 'bg-primary-600 text-white border-primary-600 shadow-primary-200 shadow-lg' 
                  : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} strokeWidth={isActive ? 3 : 2} />
              {t.label}
              {isActive && <Check className="w-3 h-3 text-white/70 ml-1" strokeWidth={4} />}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card h-20 animate-pulse bg-gray-50" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-24 border-dashed bg-gray-50/20">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
            <Package className="w-10 h-10 text-gray-200" strokeWidth={1} />
          </div>
          <h3 className="text-xl font-black text-primary-800 tracking-tight">Queue Clear</h3>
          <p className="text-sm font-medium text-gray-400 mt-1">Excellent! No orders currently pending this status.</p>
        </div>
      ) : (
        <div className="card shadow-2xl shadow-gray-900/5 overflow-hidden border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                   <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Order Ref</th>
                   <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Partner/Logistics</th>
                   <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Load</th>
                   <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Yield</th>
                   <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status Flag</th>
                   <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {orders.map(o => (
                  <tr key={o._id} className="hover:bg-primary-50/30 transition-all duration-300 group">
                    <td className="px-6 py-6 whitespace-nowrap">
                      <p className="font-mono text-xs font-black text-primary-700 tracking-tight">#{o.orderNumber?.slice(-8).toUpperCase()}</p>
                      <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mt-1.5 opacity-70">
                        {format(new Date(o.createdAt), 'dd MMM HH:mm')}
                      </p>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-primary-600 font-black text-xs border border-gray-100 group-hover:scale-110 transition-transform">
                          {o.customer?.name?.charAt(0)}
                        </div>
                        <div>
                           <p className="font-black text-primary-800 text-sm group-hover:text-primary-800 transition-colors capitalize tracking-tight">{o.customer?.name}</p>
                           <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">{o.customer?.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center min-w-[2.5rem] h-8 px-2 rounded-xl bg-white border border-gray-100 shadow-sm text-xs font-black text-gray-700 tabular-nums">
                        {o.items?.length} SKUs
                      </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <p className="font-black text-primary-800 text-base leading-none tracking-tighter">₹{o.pricing?.total?.toLocaleString()}</p>
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-1.5 self-start">Settled</p>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border-2 shadow-sm shadow-current/5
                        ${o.orderStatus === 'delivered' ? 'bg-emerald-500 text-white border-emerald-400' : 
                          o.orderStatus === 'cancelled' ? 'bg-rose-500 text-white border-rose-400' :
                          o.orderStatus === 'shipped' || o.orderStatus === 'out_for_delivery' ? 'bg-blue-500 text-white border-blue-400' :
                          o.orderStatus === 'packed' ? 'bg-violet-500 text-white border-violet-400' : 
                          'bg-amber-500 text-white border-amber-400'}`}>
                        {o.orderStatus?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        {o.orderStatus === 'placed' && (
                          <button 
                            onClick={() => updateStatus.mutate({ id: o._id, status: 'confirmed' })} 
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-amber-500 text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all active:scale-95 shadow-lg shadow-amber-500/10"
                          >
                             Approve
                          </button>
                        )}
                        {o.orderStatus === 'confirmed' && (
                          <button 
                            onClick={() => updateStatus.mutate({ id: o._id, status: 'packed' })} 
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-violet-500 text-violet-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-500 hover:text-white transition-all active:scale-95 shadow-lg shadow-violet-500/10"
                          >
                             Pack Scan
                          </button>
                        )}
                        {o.orderStatus === 'packed' && (
                          <button 
                            onClick={() => updateStatus.mutate({ id: o._id, status: 'shipped' })} 
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-indigo-500 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all active:scale-95 shadow-lg shadow-indigo-500/10"
                          >
                             Dispatch
                          </button>
                        )}
                        <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-white hover:text-primary-600 border border-transparent hover:border-primary-100 transition-all">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
