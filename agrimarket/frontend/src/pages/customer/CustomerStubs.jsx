import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, RefreshCw, User, Package, ArrowLeft, Plus, Star, ShoppingBag, CheckSquare, Users, Shield, Truck } from 'lucide-react';
import { useState } from 'react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import ProductCard from '../../components/common/ProductCard';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// WishlistPage
export function WishlistPage() {
  const { data, isLoading, refetch } = useQuery({ queryKey: ['wishlist'], queryFn: () => api.get('/auth/me').then(r => r.data.user?.wishlist || []) });
  return (
    <div className="page-container py-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-primary-800 mb-6">My Wishlist</h1>
      {isLoading ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i=><div key={i} className="card aspect-square animate-pulse" />)}</div>
      : !data?.length ? (
        <div className="empty-state"><Heart className="w-12 h-12 text-gray-300 mb-3" /><p className="font-semibold text-gray-700 mb-1">Your wishlist is empty</p><Link to="/" className="btn-primary btn-sm mt-2">Browse Products</Link></div>
      ) : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{data.map(p => <ProductCard key={p._id} product={p} onWishlistChange={refetch} />)}</div>}
    </div>
  );
}
export { WishlistPage as default_wishlist };

// SubscriptionsPage
export function SubscriptionsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['my-subs'], queryFn: () => api.get('/subscriptions/my').then(r => r.data.data) });
  const subs = data || [];
  return (
    <div className="page-container py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold">My Subscriptions</h1><Link to="/" className="btn-primary btn-sm"><Plus className="w-4 h-4" /> New</Link></div>
      {isLoading ? <div className="space-y-3">{[1,2].map(i=><div key={i} className="card h-20 animate-pulse" />)}</div>
      : subs.length === 0 ? <div className="empty-state"><RefreshCw className="w-12 h-12 text-gray-300 mb-3" /><p className="font-semibold text-gray-700 mb-1">No active subscriptions</p><p className="text-sm text-gray-500 mb-4">Subscribe for daily milk, vegetables & more!</p><Link to="/" className="btn-primary btn-sm">Browse</Link></div>
      : subs.map(s => (
        <div key={s._id} className="card card-body mb-4">
          <div className="flex justify-between mb-2"><span className={`badge ${s.status==='active'?'badge-green':s.status==='paused'?'badge-yellow':'badge-red'}`}>{s.status}</span><span className="text-xs text-gray-500 capitalize">{s.frequency?.replace(/_/g,' ')}</span></div>
          {s.items?.map(i=><div key={i._id} className="text-sm text-gray-700">{i.product?.name} × {i.quantity}</div>)}
          <p className="text-xs text-gray-400 mt-2">Next: {s.nextDeliveryDate ? format(new Date(s.nextDeliveryDate),'dd MMM'):'—'}</p>
        </div>
      ))}
    </div>
  );
}

// CustomerProfile
export function CustomerProfile() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'' });
  const [saving, setSaving] = useState(false);
  return (
    <div className="page-container py-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-primary-800 mb-6">My Profile</h1>
      <div className="card card-body space-y-4">
        <div className="flex items-center gap-4 pb-2 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-700">{user?.name?.[0]?.toUpperCase()}</div>
          <div><p className="font-bold text-lg">{user?.name}</p><p className="text-sm text-gray-500">{user?.email}</p><span className="badge-green text-[11px] mt-1 capitalize">{user?.role}</span></div>
        </div>
        {[['name','Full Name','text'],['phone','Phone','tel']].map(([k,l,t]) => (
          <div key={k} className="form-group"><label className="label">{l}</label><input type={t} className="input" value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} /></div>
        ))}
        <button onClick={async()=>{setSaving(true);try{const{data}=await api.patch('/users/profile',form);updateUser(data.data);toast.success('Saved!')}catch{toast.error('Failed')}finally{setSaving(false)}}} disabled={saving} className="btn-primary w-full">{saving?'Saving...':'Save Changes'}</button>
      </div>
    </div>
  );
}

// PublicFarmerProfile
export function PublicFarmerProfile() {
  const { id } = useParams();
  const { data: farmer } = useQuery({ queryKey: ['farmer-public', id], queryFn: () => api.get(`/farmers/${id}`).then(r => r.data.data) });
  const { data: products } = useQuery({ queryKey: ['farmer-products-public', id], queryFn: () => api.get('/products', { params: { farmer: id } }).then(r => r.data.data) });
  if (!farmer) return <div className="page-container py-16 text-center text-gray-400">Loading farmer profile...</div>;
  return (
    <div className="page-container py-8 max-w-6xl mx-auto space-y-8">
      <div className="card card-body">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-700 flex-shrink-0">{farmer.name?.[0]?.toUpperCase()}</div>
          <div>
            <h1 className="text-2xl font-bold text-primary-800">{farmer.farmerProfile?.farmName || farmer.name}</h1>
            <p className="text-gray-500 mt-1">{farmer.farmerProfile?.farmLocation}</p>
            <div className="flex items-center gap-3 mt-2">
              {farmer.farmerProfile?.rating > 0 && <span className="flex items-center gap-1 text-sm"><Star className="w-4 h-4 fill-amber-400 text-amber-400" />{farmer.farmerProfile.rating?.toFixed(1)} ({farmer.farmerProfile.reviewCount} reviews)</span>}
              {farmer.farmerProfile?.isOrganic && <span className="badge-green">Organic</span>}
            </div>
          </div>
        </div>
      </div>
      {products?.products?.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-primary-800 mb-4">Products by {farmer.name?.split(' ')[0]}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
