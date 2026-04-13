import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Eye, Package, Settings2, ShieldCheck, Timer, AlertCircle } from 'lucide-react';
import ActionDropdown from '../../components/common/ActionDropdown';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [tab, setTab] = useState('pending');
  const qc = useQueryClient();
  
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-products', tab],
    queryFn: () => tab === 'pending'
      ? api.get('/admin/products/pending', { params: { limit: 50 } }).then(r => r.data.data)
      : api.get('/products', { params: { limit: 50, ...(tab!=='all'&&{isApproved:tab}) } }).then(r => r.data.data),
  });

  const review = useMutation({
    mutationFn: ({ id, action, note }) => api.patch(`/admin/products/${id}/approval`, { action, note }),
    onSuccess: (_, { action }) => { 
      toast.success(`Product ${action}d successfully`); 
      qc.invalidateQueries(['admin-products']); 
    },
  });

  if (isError) {
    const msg = error.response?.data?.message || error.message || 'Failed to fetch products';
    return (
      <div className="card p-10 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4"><Package /></div>
        <h3 className="text-lg font-bold text-primary-800">Error Loading Products</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-xs">{msg}</p>
        <button onClick={() => qc.invalidateQueries(['admin-products'])} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold">Retry</button>
      </div>
    );
  }

  const products = data?.products || [];
  const TABS = [
    { id: 'pending',  label: 'Pending Review', icon: Timer,        color: 'amber' },
    { id: 'approved', label: 'Market Approved', icon: ShieldCheck,  color: 'emerald' },
    { id: 'rejected', label: 'Rejected Cases',  icon: AlertCircle, color: 'rose' },
  ];

  return (
    <div className="space-y-6 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-primary-800 tracking-tight">Product Review</h1>
          <p className="text-sm text-gray-500 mt-1">Review catalog items for quality and compliance</p>
        </div>
      </div>

      {/* Premium Tab System */}
      <div className="flex flex-wrap gap-2 pb-2">
        {TABS.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300 active:scale-95 shadow-sm border
                ${isActive 
                  ? 'bg-primary-600 text-white border-primary-600 shadow-primary-200 shadow-lg' 
                  : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                }
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              {t.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="card h-64 animate-pulse bg-gray-50" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Farmer</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pricing</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
                          <Package className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-bold text-primary-800">No {tab} products</h3>
                        <p className="text-sm text-gray-500 max-w-sm mt-1">Review queue is empty. New product submissions will appear here.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map(p => (
                    <tr key={p._id} className="hover:bg-primary-50/50 transition-colors duration-200 group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-sm border border-gray-100 group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100">
                              <Package className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-primary-800 group-hover:text-primary-700 transition-colors">{p.name}</p>
                            <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                              {p.category}
                              {p.isOrganic && <span className="w-1 h-1 rounded-full bg-emerald-400" />}
                              {p.isOrganic && "Organic"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-bold text-gray-700">{p.farmer?.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{format(new Date(p.createdAt), 'dd MMM yyyy')}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-black text-primary-700 text-base leading-tight">₹{p.price?.selling}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">per {p.price?.unit}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-sm border
                          ${p.isApproved === 'approved' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : p.isApproved === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                          {p.isApproved === 'approved' ? <ShieldCheck className="w-3.5 h-3.5" /> : p.isApproved === 'rejected' ? <XCircle className="w-3.5 h-3.5" /> : <Timer className="w-3.5 h-3.5" />}
                          {p.isApproved}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <ActionDropdown 
                          label="Review Status"
                          icon={Settings2}
                          options={[
                            { 
                              label: 'Approve Item', 
                              icon: CheckCircle, 
                              color: 'green', 
                              hidden: p.isApproved === 'approved', 
                              onClick: () => review.mutate({id:p._id,action:'approve'}) 
                            },
                            { 
                              label: p.isApproved === 'pending' ? 'Reject Item' : 'Revoke Approval', 
                              icon: XCircle, 
                              color: 'red', 
                              hidden: p.isApproved === 'rejected', 
                              onClick: () => review.mutate({id:p._id,action:'reject',note:'Does not meet quality standards'}) 
                            }
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
