import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, Package, ArrowRight, Clock, CheckCircle, Truck, XCircle, Zap, Filter, Search } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';

export default function CustomerOrders() {
  const [status, setStatus] = useState('');
  const qc = useQueryClient();
  
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-orders', status],
    queryFn: () => api.get('/orders/my', { params: { status: status||undefined, limit: 50 } }).then(r => r.data.data),
  });

  const orders = data?.orders || [];

  const TABS = [
    { value: '',         label: 'All Activity', icon: Zap,          color: 'primary' },
    { value: 'placed',   label: 'Processing',    icon: Clock,        color: 'blue'    },
    { value: 'confirmed', label: 'Confirmed',     icon: CheckCircle,  color: 'emerald' },
    { value: 'shipped',   label: 'In Transit',    icon: Truck,        color: 'indigo'  },
    { value: 'delivered', label: 'Completed',     icon: Package,      color: 'green'   },
    { value: 'cancelled', label: 'Cancelled',     icon: XCircle,      color: 'rose'    },
  ];

  if (isError) {
    const msg = error.response?.data?.message || error.message || 'Failed to fetch orders';
    return (
      <div className="page-container py-12 max-w-4xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto border border-red-100 shadow-sm"><ShoppingBag /></div>
        <h3 className="text-xl font-extrabold text-primary-800 tracking-tight">Stream Connection Failed</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">{msg}</p>
        <button onClick={() => qc.invalidateQueries(['my-orders'])} className="px-6 py-2.5 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 active:scale-95 transition-all">Retry Synchronization</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft py-12 md:py-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="page-container max-w-5xl mx-auto space-y-12">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-primary-800 tracking-tighter">My Order History</h1>
            <p className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-[0.2em] opacity-80">Track and manage your farm-fresh deliveries</p>
          </div>
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white shadow-soft rounded-2xl border border-gray-100">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black text-primary-800 uppercase tracking-widest">{orders.length} TOTAL SHIPMENTS</span>
          </div>
        </div>

        {/* Clean Filter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 px-4">
          {TABS.map(t => {
            const Icon = t.icon;
            const isActive = status === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setStatus(t.value)}
                className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border transition-all duration-500 active:scale-95 group
                  ${isActive 
                    ? 'bg-primary-600 text-white border-primary-600 shadow-xl shadow-primary-200' 
                    : 'bg-white text-gray-500 border-gray-100 hover:border-primary-200 hover:bg-primary-50/10 shadow-soft'
                  }
                `}
              >
                <div className={`p-2.5 rounded-xl transition-all duration-500 ${isActive ? 'bg-white/20' : 'bg-gray-50 group-hover:bg-primary-100/50'}`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-600'}`} strokeWidth={isActive ? 3 : 2.5} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="space-y-6 px-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-white/50 animate-pulse rounded-[2.5rem] border border-gray-100" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-8 border border-gray-100 shadow-soft group hover:rotate-6 transition-all duration-500">
              <ShoppingBag className="w-10 h-10 text-gray-200 group-hover:text-primary-500 transition-colors" strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-black text-primary-800 tracking-tighter uppercase">No activity stream found</h3>
            <p className="text-sm font-medium text-gray-400 mt-3 max-w-xs mx-auto leading-relaxed tracking-wide">Your delivery schedule is currently empty for this category.</p>
            <Link to="/" className="mt-10 px-10 py-5 bg-primary-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] hover:bg-gray-50 hover:shadow-2xl hover:shadow-primary-600/30 active:scale-95 transition-all">
              Discover Farm Produce
            </Link>
          </div>
        ) : (
          <div className="space-y-6 px-4">
            {orders.map(o => (
              <Link 
                key={o._id} 
                to={`/my/orders/${o._id}`} 
                className="group block bg-white hover:bg-gray-50/50 transition-all duration-300 shadow-soft hover:shadow-xl hover:-translate-y-0.5 border border-gray-100 rounded-3xl overflow-hidden"
              >
                <div className="p-5 md:p-6 flex flex-row items-center justify-between gap-6">
                  
                  {/* Left: Info Section */}
                  <div className="flex-1 min-w-0 flex items-center gap-4">
                    <div className="hidden sm:flex flex-col -space-y-3">
                      {o.items?.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="h-10 w-10 rounded-xl ring-4 ring-white bg-gray-50 border border-gray-100 overflow-hidden shadow-sm" style={{ zIndex: 10 - idx }}>
                           <img src={item.image} alt="" className="h-full w-full object-cover" />
                        </div>
                      ))}
                      {o.items?.length > 2 && (
                        <div className="flex items-center justify-center h-10 w-10 rounded-xl ring-4 ring-white bg-white text-[9px] font-black text-white shadow-sm z-0">
                          +{o.items.length - 2}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md uppercase tracking-widest">#{o.orderNumber?.slice(-8).toUpperCase()}</span>
                        <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border
                          ${o.orderStatus === 'delivered' ? 'bg-emerald-500 text-white border-emerald-400' : 
                            o.orderStatus === 'cancelled' ? 'bg-rose-500 text-white border-rose-400' :
                            o.orderStatus === 'placed' ? 'bg-blue-500 text-white border-blue-400' :
                            o.orderStatus === 'confirmed' ? 'bg-emerald-600 text-white border-emerald-500' :
                            o.orderStatus === 'shipped' ? 'bg-indigo-500 text-white border-indigo-400' :
                            'bg-amber-500 text-white border-amber-400'}`}>
                          {o.orderStatus?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      
                      <h4 className="text-base font-black text-primary-800 tracking-tight group-hover:text-primary-700 transition-colors leading-snug">
                        Order for {o.items?.[0]?.name} {o.items?.length > 1 && <span className="text-gray-400 text-sm font-bold">+{o.items.length - 1}</span>}
                      </h4>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-gray-300" />
                          <p className="text-[10px] text-gray-400 font-bold tracking-wider uppercase tabular-nums">
                            {format(new Date(o.createdAt), 'dd MMM, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3 h-3 text-gray-300" />
                          <p className="text-[10px] text-gray-400 font-bold tracking-wider uppercase tabular-nums">
                            {o.items?.length} Items
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right: Price & CTA Section */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Total</p>
                      <p className="font-black text-2xl text-primary-800 tracking-tighter leading-none">₹{o.pricing?.total?.toLocaleString()}</p>
                    </div>
                    
                    <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-white transition-all duration-300 shadow-inner group-hover:shadow-lg group-hover:shadow-primary-600/30">
                       <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-white transition-all group-hover:translate-x-0.5" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
