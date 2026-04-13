import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ShoppingBag, Clock, Package, CheckCircle, Truck, XCircle, ArrowRight, Settings2, MapPin, Zap } from 'lucide-react';
import StatusPickerModal from '../../components/common/StatusPickerModal';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState(null);
  
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-orders', status, search],
    queryFn: () => api.get('/admin/orders', { params: { status: status||undefined, search: search||undefined, limit: 20 } }).then(r => r.data.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => { 
      toast.success('Order status updated'); 
      qc.invalidateQueries(['admin-orders']); 
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
        <button onClick={() => qc.invalidateQueries(['admin-orders'])} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold">Retry</button>
      </div>
    );
  }

  const orders = data?.orders || [];
  const STATUSES = [
    { value: '',      label: 'All Statuses',    icon: ShoppingBag, color: 'gray' },
    { value: 'placed', label: 'Placed',         icon: Clock,       color: 'blue' },
    { value: 'confirmed', label: 'Confirmed',   icon: CheckCircle, color: 'amber' },
    { value: 'processing', label: 'Processing', icon: Zap,         color: 'purple' },
    { value: 'packed', label: 'Packed',         icon: Package,     color: 'violet' },
    { value: 'shipped', label: 'Shipped',       icon: Truck,       color: 'indigo' },
    { value: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin, color: 'sky' },
    { value: 'delivered', label: 'Delivered',   icon: CheckCircle, color: 'emerald' },
    { value: 'cancelled', label: 'Cancelled',   icon: XCircle,     color: 'rose' },
  ];

  const getColorStyles = (color, isActive) => {
    const map = {
      blue:    isActive ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-500 border-gray-100 hover:bg-blue-50 hover:text-blue-600',
      amber:   isActive ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white text-gray-500 border-gray-100 hover:bg-amber-50 hover:text-amber-600',
      purple:  isActive ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-white text-gray-500 border-gray-100 hover:bg-purple-50 hover:text-purple-600',
      violet:  isActive ? 'bg-violet-100 text-violet-700 border-violet-200' : 'bg-white text-gray-500 border-gray-100 hover:bg-violet-50 hover:text-violet-600',
      indigo:  isActive ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white text-gray-500 border-gray-100 hover:bg-indigo-50 hover:text-indigo-600',
      sky:     isActive ? 'bg-sky-100 text-sky-700 border-sky-200' : 'bg-white text-gray-500 border-gray-100 hover:bg-sky-50 hover:text-sky-600',
      emerald: isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white text-gray-500 border-gray-100 hover:bg-emerald-50 hover:text-emerald-600',
      rose:    isActive ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-white text-gray-500 border-gray-100 hover:bg-rose-50 hover:text-rose-600',
      gray:    isActive ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50 hover:text-gray-600',
    };
    return map[color];
  };

  return (
    <div className="space-y-6 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-primary-800 tracking-tight">Order Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage platform sales and fulfillment</p>
        </div>
      </div>
      
      {/* Search & Filter Modernized UI */}
      <div className="space-y-4">
        <div className="relative group max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors duration-300" />
          <input 
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-[1.5rem] text-sm transition-all duration-300 focus:border-primary-300 focus:ring-4 focus:ring-primary-500/5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-gray-300 outline-none placeholder:text-gray-400 font-medium" 
            placeholder="Search by order number or customer..." 
            value={search} 
            onChange={e=>setSearch(e.target.value)} 
          />
        </div>

        {/* Card-based Status Chips Filter */}
        <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto no-scrollbar">
          {STATUSES.map(s => {
            const Icon = s.icon;
            const isActive = status === s.value;
            return (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-[1rem] border text-xs font-bold transition-all duration-300 whitespace-nowrap active:scale-95 shadow-sm
                  ${getColorStyles(s.color, isActive)}
                `}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'opacity-100' : 'opacity-60'}`} strokeWidth={2.5} />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? <div className="card h-64 animate-pulse" /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="flex flex-col items-center justify-center py-20 px-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
                          <ShoppingBag className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-bold text-primary-800 mb-1">No orders found</h3>
                        <p className="text-sm text-gray-500 max-w-sm text-center">There are no orders that match your current search or status filter.</p>
                      </div>
                    </td>
                  </tr>
                ) : orders.map(o => (
                  <tr key={o._id} className="hover:bg-primary-50/50 transition-colors duration-200 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-gray-500 group-hover:text-primary-600 transition-colors">{o.orderNumber}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-bold text-primary-800 group-hover:text-primary-700 transition-colors">{o.customer?.name}</p>
                        <p className="text-xs text-gray-500">{o.customer?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-black text-primary-700 text-sm">₹{o.pricing?.total?.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                        o.paymentStatus==='paid' ? 'bg-green-100 text-green-700' :
                        o.paymentStatus==='failed' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>{o.paymentStatus}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest
                        ${o.orderStatus === 'delivered' ? 'bg-green-100 text-green-700 border border-green-200' : 
                          o.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700 border border-red-200' :
                          o.orderStatus === 'shipped' || o.orderStatus === 'out_for_delivery' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                        {o.orderStatus?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 font-medium">{format(new Date(o.createdAt),'dd MMM yyyy')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => setUpdatingOrder(o)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-100 text-primary-600 rounded-xl text-xs font-bold hover:bg-primary-50 hover:border-primary-200 transition-all shadow-sm active:scale-95 group"
                      >
                        <Settings2 className="w-3.5 h-3.5 text-primary-400 group-hover:text-primary-600 group-hover:rotate-45 transition-all" />
                        Manage Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status Picker Modal */}
      <StatusPickerModal 
        isOpen={!!updatingOrder}
        onClose={() => setUpdatingOrder(null)}
        currentStatus={updatingOrder?.orderStatus}
        orderNumber={updatingOrder?.orderNumber}
        onSelect={(newStatus) => updateStatus.mutate({ id: updatingOrder._id, status: newStatus })}
      />
    </div>
  );
}
