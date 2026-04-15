import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Package, Eye, CheckCircle, Clock, XCircle, ShoppingBag } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function FarmerProducts() {
  const [status, setStatus] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['my-products', status],
    queryFn: () => api.get('/products/my-products', { params: { status: status||undefined } }).then(r => r.data.data),
  });

  const del = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => { 
      toast.success('Product deleted'); 
      qc.invalidateQueries(['my-products']); 
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  });

  const products = data?.products || [];
  
  const TABS = [
    { value: '',         label: 'All Products', icon: ShoppingBag, color: 'gray'   },
    { value: 'approved',  label: 'Approved',     icon: CheckCircle, color: 'emerald' },
    { value: 'pending',   label: 'Pending',      icon: Clock,       color: 'amber'   },
    { value: 'rejected',  label: 'Rejected',     icon: XCircle,     color: 'rose'    },
  ];

  const getColorStyles = (color, isActive) => {
    const map = {
      emerald: isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white text-gray-500 border-gray-100 hover:bg-emerald-50 hover:text-emerald-600',
      amber:   isActive ? 'bg-amber-100 text-amber-700 border-amber-200'     : 'bg-white text-gray-500 border-gray-100 hover:bg-amber-50 hover:text-amber-600',
      rose:    isActive ? 'bg-rose-100 text-rose-700 border-rose-200'       : 'bg-white text-gray-500 border-gray-100 hover:bg-rose-50 hover:text-rose-600',
      gray:    isActive ? 'bg-primary-600 text-white border-primary-600 shadow-md' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50 hover:text-gray-700',
    };
    return map[color];
  };

  return (
    <div className="space-y-6 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-primary-800 tracking-tight">My Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your storefront and product availability</p>
        </div>
        <Link to="/farmer/products/add" className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-2xl text-sm font-bold hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-200/50 transition-all active:scale-95 group">
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Add Product
        </Link>
      </div>

      {/* Modern Filter Chips */}
      <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto no-scrollbar">
        {TABS.map(t => {
          const Icon = t.icon;
          const isActive = status === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setStatus(t.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all duration-300 whitespace-nowrap active:scale-95
                ${getColorStyles(t.color, isActive)}
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'opacity-100' : 'opacity-60'}`} strokeWidth={2.5} />
              {t.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i=><div key={i} className="card h-64 animate-pulse relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" /></div>)}
        </div>
      ) : products.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-24 border-dashed bg-gray-50/30 text-center">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 border border-gray-100 shadow-sm group-hover:scale-110 transition-transform duration-500">
            <Package className="w-10 h-10 text-gray-200" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-primary-800 mb-2 leading-tight">No products found</h3>
          <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
            {status ? `You don't have any products currently in '${status}' status.` : "You haven't added any products to your catalog yet. Start selling today!"}
          </p>
          <Link to="/farmer/products/add" className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1 transition-all active:scale-95">
            <Plus className="w-5 h-5" />
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map(p => (
            <div key={p._id} className="group card overflow-hidden border-gray-100 hover:border-primary-100 hover:shadow-2xl hover:shadow-primary-100/30 hover:-translate-y-2 transition-all duration-500">
              <div className="aspect-[16/10] bg-gray-50 relative overflow-hidden">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-40">
                    <Package className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md border shadow-sm
                  ${p.isApproved === 'approved' ? 'bg-emerald-500/90 text-white border-emerald-400' : 
                    p.isApproved === 'rejected' ? 'bg-rose-500/90 text-white border-rose-400' : 
                    'bg-amber-500/90 text-white border-amber-400'
                  }`}>
                  {p.isApproved}
                </div>
              </div>
              
              <div className="p-5">
                <p className="font-black text-primary-800 text-lg leading-tight truncate group-hover:text-primary-700 transition-colors uppercase tracking-tight">{p.name}</p>
                
                <div className="flex items-center justify-between mt-4 pb-4 border-b border-gray-50">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Pricing</p>
                    <p className="text-xl font-black text-primary-700 leading-none">₹{p.price?.selling}<span className="text-xs text-gray-400 font-bold">/{p.price?.unit}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Stock</p>
                    <p className="text-lg font-black text-primary-800 leading-none tracking-tight">{p.stock?.quantity}<span className="text-[10px] text-gray-400 ml-1">UNITS</span></p>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-5">
                  <Link to={`/farmer/products/edit/${p._id}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all active:scale-95">
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Details
                  </Link>
                  <button 
                    onClick={() => setDeleteModal({ isOpen: true, productId: p._id })} 
                    className="w-11 h-11 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 hover:text-rose-600 transition-all active:scale-90"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, productId: null })} 
        onConfirm={() => { if(deleteModal.productId) del.mutate(deleteModal.productId); }} 
        title="Delete Product?" 
        message="Are you sure you want to permanently remove this item from your catalog? This action cannot be undone." 
        confirmText="Delete" 
        variant="danger" 
      />
    </div>
  );
}
