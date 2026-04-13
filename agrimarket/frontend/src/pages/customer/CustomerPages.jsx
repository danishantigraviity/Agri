// This file creates stub exports for all remaining pages
// Each would be fully built in production; here they render a usable placeholder

import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Package, Star, ShoppingBag, Heart, Plus, Edit2,
  Trash2, Check, X, Eye, Search, Filter, RefreshCw,
  MapPin, Phone, Mail, Camera, Save, AlertTriangle,
  ArrowRight, Clock, Truck, BarChart2, Users, Shield
} from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import OrderTimeline from '../components/common/OrderTimeline';
import ProductCard from '../components/common/ProductCard';
import { format } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import toast from 'react-hot-toast';

// ── Customer Dashboard ──────────────────────────────────────────
export function CustomerDashboard() {
  const { user } = useAuthStore();
  const { data } = useQuery({ queryKey: ['my-orders-count'], queryFn: () => api.get('/orders/my?limit=100').then(r => r.data.data) });
  const orders = data?.orders || [];
  const totalSpent = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.pricing.total, 0);
  const delivered = orders.filter(o => o.orderStatus === 'delivered').length;
  const pending = orders.filter(o => !['delivered','cancelled'].includes(o.orderStatus)).length;
  const stats = [
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Delivered', value: delivered, icon: Check, bg: 'bg-green-50', color: 'text-green-600' },
    { label: 'In Progress', value: pending, icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
    { label: 'Total Spent', value: `₹${totalSpent.toFixed(0)}`, icon: Package, bg: 'bg-purple-50', color: 'text-purple-600' },
  ];
  return (
    <div className="page-container py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary-800">My Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.name?.split(' ')[0]}!</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="card p-5 flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${color}`} /></div>
            <div><p className="text-xs text-gray-500">{label}</p><p className="text-xl font-bold text-primary-800">{value}</p></div>
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-primary-800">Recent Orders</h2>
          <Link to="/my/orders" className="text-sm text-primary-600 font-medium flex items-center gap-1">All orders <ArrowRight className="w-3 h-3" /></Link>
        </div>
        <div className="card overflow-hidden">
          {orders.slice(0, 3).map(o => (
            <Link key={o._id} to={`/my/orders/${o._id}`} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
              <div><p className="font-semibold text-sm">{o.orderNumber}</p><p className="text-xs text-gray-500">{o.items?.length} items</p></div>
              <div className="text-right"><p className="font-bold text-primary-700">₹{o.pricing?.total}</p><span className={`status-${o.orderStatus} text-[10px]`}>{o.orderStatus?.replace(/_/g,' ')}</span></div>
            </Link>
          ))}
          {orders.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No orders yet. <Link to="/" className="text-primary-600">Start shopping!</Link></div>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/my/orders" className="card p-5 flex items-center gap-3 hover:shadow-card-hover transition-all">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-blue-600" /></div>
          <div><p className="font-semibold text-sm">My Orders</p><p className="text-xs text-gray-500">Track & manage</p></div>
        </Link>
        <Link to="/my/wishlist" className="card p-5 flex items-center gap-3 hover:shadow-card-hover transition-all">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center"><Heart className="w-5 h-5 text-red-500" /></div>
          <div><p className="font-semibold text-sm">Wishlist</p><p className="text-xs text-gray-500">Saved items</p></div>
        </Link>
        <Link to="/my/subscriptions" className="card p-5 flex items-center gap-3 hover:shadow-card-hover transition-all">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><RefreshCw className="w-5 h-5 text-green-600" /></div>
          <div><p className="font-semibold text-sm">Subscriptions</p><p className="text-xs text-gray-500">Daily deliveries</p></div>
        </Link>
      </div>
    </div>
  );
}

// ── Customer Orders ─────────────────────────────────────────────
export function CustomerOrders() {
  const [status, setStatus] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', status],
    queryFn: () => api.get('/orders/my', { params: { status: status || undefined } }).then(r => r.data.data),
  });
  const STATUS_TABS = ['', 'placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  return (
    <div className="page-container py-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-primary-800">My Orders</h1>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => setStatus(s)} className={`px-4 py-2 rounded-xl text-sm font-medium flex-shrink-0 transition-all ${status === s ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
            {s ? s.replace(/_/g, ' ') : 'All Orders'}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-5 h-20 animate-pulse bg-gray-100" />)}</div>
      ) : data?.orders?.length === 0 ? (
        <div className="empty-state"><ShoppingBag className="w-12 h-12 text-gray-300 mb-3" /><p className="font-semibold text-gray-600">No orders found</p><Link to="/" className="btn-primary btn-sm mt-3">Start Shopping</Link></div>
      ) : (
        <div className="space-y-4">
          {data?.orders?.map(o => (
            <Link key={o._id} to={`/my/orders/${o._id}`} className="card p-5 block hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-bold text-primary-800">{o.orderNumber}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{format(new Date(o.createdAt), 'dd MMM yyyy')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-700">₹{o.pricing?.total}</p>
                  <span className={`status-${o.orderStatus} text-[10px] mt-1`}>{o.orderStatus?.replace(/_/g, ' ')}</span>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {o.items?.slice(0, 3).map(item => (
                  <div key={item._id} className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-gray-400" /></div>}
                  </div>
                ))}
                {o.items?.length > 3 && <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">+{o.items.length - 3}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Order Detail ────────────────────────────────────────────────
export function OrderDetailPage() {
  const { id } = window.__currentParams || {};
  // hooks need real router; this is handled by parent route via useParams
  const params = new URLSearchParams(window.location.pathname.split('/').pop());
  return <OrderDetailContent />;
}

export function OrderDetailContent() {
  // Use location to get ID
  const pathParts = window.location.pathname.split('/');
  const orderId = pathParts[pathParts.length - 1];
  const { data, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => api.get(`/orders/${orderId}`).then(r => r.data.data),
    enabled: !!orderId && orderId !== 'orders',
  });
  const qc = useQueryClient();
  const cancel = useMutation({
    mutationFn: ({ reason }) => api.patch(`/orders/${orderId}/cancel`, { reason }),
    onSuccess: () => { toast.success('Order cancelled'); qc.invalidateQueries(['order', orderId]); },
  });
  const order = data;
  if (isLoading) return <div className="page-container py-8"><div className="card p-8 animate-pulse h-64" /></div>;
  if (!order) return <div className="page-container py-8 text-center"><p className="text-gray-500">Order not found.</p></div>;
  return (
    <div className="page-container py-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-primary-800">{order.orderNumber}</h1><p className="text-sm text-gray-500">{format(new Date(order.createdAt), 'dd MMMM yyyy, hh:mm a')}</p></div>
        <span className={`status-${order.orderStatus} text-sm`}>{order.orderStatus?.replace(/_/g, ' ')}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card card-body">
            <h3 className="font-bold text-primary-800 mb-4">Order Items</h3>
            <div className="divide-y divide-gray-100">
              {order.items?.map(item => (
                <div key={item._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-gray-400 m-auto mt-4" />}
                  </div>
                  <div className="flex-1"><p className="font-semibold text-sm">{item.name}</p><p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}</p></div>
                  <p className="font-bold text-primary-700">₹{item.subtotal}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.pricing?.subtotal}</span></div>
              <div className="flex justify-between text-gray-600"><span>Delivery</span><span>{order.pricing?.deliveryCharge === 0 ? 'FREE' : `₹${order.pricing?.deliveryCharge}`}</span></div>
              <div className="flex justify-between text-gray-600"><span>Tax (GST 5%)</span><span>₹{order.pricing?.tax}</span></div>
              <div className="flex justify-between font-bold text-primary-800 border-t border-gray-100 pt-2 mt-2"><span>Total</span><span className="text-primary-700">₹{order.pricing?.total}</span></div>
            </div>
          </div>
          <div className="card card-body">
            <h3 className="font-bold text-primary-800 mb-4">Delivery Address</h3>
            <div className="flex items-start gap-2.5"><MapPin className="w-4 h-4 text-gray-400 mt-0.5" /><div><p className="font-semibold text-sm">{order.shippingAddress?.name}</p><p className="text-sm text-gray-600">{order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p><p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {order.shippingAddress?.phone}</p></div></div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="card card-body">
            <h3 className="font-bold text-primary-800 mb-4">Order Tracking</h3>
            <OrderTimeline order={order} />
          </div>
          {['placed','confirmed'].includes(order.orderStatus) && (
            <button onClick={() => { if (window.confirm('Cancel this order?')) cancel.mutate({ reason: 'Customer request' }); }} className="btn-danger w-full btn-sm">
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Checkout ─────────────────────────────────────────────────────
export function CheckoutPage() {
  const { items } = (await import('../store/cartStore')).default.getState ? (await import('../store/cartStore')).default.getState() : { items: [] };
  return <CheckoutContent />;
}
export function CheckoutContent() {
  const [useCartStore_] = useState(() => require('../store/cartStore').default);
  const cartState = useCartStore_.getState();
  const { items, clearCart } = cartState;
  const [address, setAddress] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '' });
  const [payMethod, setPayMethod] = useState('cod');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = (typeof window !== 'undefined') ? window.__navigate : null;
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery = subtotal >= 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + tax;
  const handleOrder = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: address,
        paymentMethod: payMethod,
      });
      clearCart();
      toast.success('Order placed successfully! 🎉');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };
  return (
    <div className="page-container py-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-primary-800 mb-6">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card card-body">
            <h3 className="font-bold text-primary-800 mb-4">Delivery Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[['name','Full Name'],['phone','Phone'],['street','Street Address'],['city','City'],['state','State'],['pincode','Pincode']].map(([key,label]) => (
                <div key={key} className={`form-group ${key === 'street' ? 'sm:col-span-2' : ''}`}>
                  <label className="label">{label}</label>
                  <input className="input" value={address[key]} onChange={e => setAddress(a => ({ ...a, [key]: e.target.value }))} placeholder={label} />
                </div>
              ))}
            </div>
          </div>
          <div className="card card-body">
            <h3 className="font-bold text-primary-800 mb-4">Payment Method</h3>
            <div className="space-y-3">
              {[['cod','Cash on Delivery','💵','Pay when your order arrives'],['online','Pay Online','💳','UPI, Card, Net Banking via Razorpay']].map(([val,label,emoji,desc]) => (
                <button key={val} onClick={() => setPayMethod(val)} className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${payMethod === val ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <span className="text-2xl">{emoji}</span>
                  <div><p className="font-semibold text-sm">{label}</p><p className="text-xs text-gray-500">{desc}</p></div>
                  {payMethod === val && <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center ml-auto"><Check className="w-3 h-3 text-white" /></div>}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="card card-body sticky top-20">
            <h3 className="font-bold text-primary-800 mb-4">Order Summary</h3>
            <div className="space-y-2.5 mb-4">
              {items.map(i => (
                <div key={i.productId} className="flex justify-between text-sm"><span className="text-gray-600 truncate max-w-[170px]">{i.name} ×{i.quantity}</span><span className="font-medium">₹{(i.price*i.quantity).toFixed(0)}</span></div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Delivery</span><span className={delivery === 0 ? 'text-green-600' : ''}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span></div>
              <div className="flex justify-between text-gray-600"><span>Tax (5%)</span><span>₹{tax}</span></div>
              <div className="flex justify-between font-bold text-primary-800 text-base border-t border-gray-100 pt-2"><span>Total</span><span className="text-primary-700">₹{total}</span></div>
            </div>
            <button onClick={handleOrder} disabled={loading || items.length === 0} className="btn-primary w-full btn-lg mt-4">
              {loading ? <><span className="spinner border-white/40 border-t-white" /> Placing Order...</> : `Place Order • ₹${total}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Wishlist ──────────────────────────────────────────────────
export function WishlistPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/auth/me').then(r => r.data.user?.wishlist || []),
  });
  return (
    <div className="page-container py-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-primary-800 mb-6">My Wishlist</h1>
      {isLoading ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i=><div key={i} className="card aspect-square animate-pulse" />)}</div> :
       !data?.length ? (
        <div className="empty-state"><Heart className="w-12 h-12 text-gray-300 mb-3" /><p className="font-semibold text-gray-700 mb-1">Your wishlist is empty</p><Link to="/" className="btn-primary btn-sm">Browse Products</Link></div>
       ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map(p => <ProductCard key={p._id} product={p} onWishlistChange={refetch} />)}
        </div>
       )}
    </div>
  );
}

// ── Subscriptions ────────────────────────────────────────────
export function SubscriptionsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['my-subs'], queryFn: () => api.get('/subscriptions/my').then(r => r.data.data) });
  const subs = data || [];
  return (
    <div className="page-container py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary-800">My Subscriptions</h1>
        <Link to="/?subscriptionAvailable=true" className="btn-primary btn-sm"><Plus className="w-4 h-4" /> New Subscription</Link>
      </div>
      {isLoading ? <div className="space-y-3">{[1,2].map(i=><div key={i} className="card h-24 animate-pulse" />)}</div>:
       subs.length === 0 ? (
        <div className="empty-state"><RefreshCw className="w-12 h-12 text-gray-300 mb-3" /><p className="font-semibold text-gray-700 mb-1">No active subscriptions</p><p className="text-sm text-gray-500 mb-4">Subscribe to get daily milk, vegetables & more!</p><Link to="/" className="btn-primary btn-sm">Browse Products</Link></div>
       ) : subs.map(s => (
        <div key={s._id} className="card card-body mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`badge ${s.status === 'active' ? 'badge-green' : s.status === 'paused' ? 'badge-yellow' : 'badge-red'}`}>{s.status}</span>
            <span className="text-xs text-gray-500 capitalize">{s.frequency?.replace(/_/g,' ')}</span>
          </div>
          <div className="space-y-1">
            {s.items?.map(item => <div key={item._id} className="text-sm text-gray-700">{item.product?.name} × {item.quantity}</div>)}
          </div>
          <p className="text-xs text-gray-500 mt-2">Next delivery: {s.nextDeliveryDate ? format(new Date(s.nextDeliveryDate), 'dd MMM') : '—'}</p>
        </div>
       ))}
    </div>
  );
}

// ── Customer Profile ─────────────────────────────────────────
export function CustomerProfile() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/users/profile', form);
      updateUser(data.data);
      toast.success('Profile updated!');
    } catch (e) { toast.error('Update failed'); } finally { setSaving(false); }
  };
  return (
    <div className="page-container py-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-primary-800 mb-6">My Profile</h1>
      <div className="card card-body space-y-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-700">{user?.name?.[0]?.toUpperCase()}</div>
          <div><p className="font-bold text-lg text-primary-800">{user?.name}</p><p className="text-sm text-gray-500">{user?.email}</p></div>
        </div>
        {[['name','Full Name','text'],['phone','Phone','tel']].map(([key,label,type]) => (
          <div key={key} className="form-group"><label className="label">{label}</label><input type={type} className="input" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} /></div>
        ))}
        <button onClick={save} disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save Changes'}</button>
      </div>
    </div>
  );
}
