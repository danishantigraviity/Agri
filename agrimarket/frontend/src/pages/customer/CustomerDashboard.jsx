// CustomerDashboard.jsx
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Check, Clock, Package, ArrowRight, RefreshCw, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const { data } = useQuery({ queryKey: ['my-orders-dash'], queryFn: () => api.get('/orders/my?limit=100').then(r => r.data.data) });
  const orders = data?.orders || [];
  const totalSpent = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.pricing.total, 0);
  const stats = [
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Delivered', value: orders.filter(o => o.orderStatus === 'delivered').length, icon: Check, bg: 'bg-green-50', color: 'text-green-600' },
    { label: 'In Progress', value: orders.filter(o => !['delivered','cancelled'].includes(o.orderStatus)).length, icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
    { label: 'Total Spent', value: `₹${totalSpent.toFixed(0)}`, icon: Package, bg: 'bg-purple-50', color: 'text-purple-600' },
  ];
  return (
    <div className="page-container py-8 space-y-8">
      <div><h1 className="text-2xl font-bold text-primary-800">My Dashboard</h1><p className="text-gray-500">Welcome back, {user?.name?.split(' ')[0]}!</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="card p-5 flex items-center gap-3"><div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${color}`} /></div><div><p className="text-xs text-gray-500">{label}</p><p className="text-xl font-bold text-primary-800">{value}</p></div></div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-primary-800">Recent Orders</h2><Link to="/my/orders" className="text-sm text-primary-600 font-medium flex items-center gap-1">All <ArrowRight className="w-3 h-3" /></Link></div>
        <div className="card overflow-hidden">
          {orders.slice(0, 4).map(o => (
            <Link key={o._id} to={`/my/orders/${o._id}`} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
              <div><p className="font-semibold text-sm">{o.orderNumber}</p><p className="text-xs text-gray-500">{o.items?.length} items · {format(new Date(o.createdAt), 'dd MMM')}</p></div>
              <div className="text-right"><p className="font-bold text-primary-700">₹{o.pricing?.total}</p><span className={`status-${o.orderStatus} text-[10px] mt-0.5`}>{o.orderStatus?.replace(/_/g,' ')}</span></div>
            </Link>
          ))}
          {orders.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No orders yet. <Link to="/" className="text-primary-600 font-medium">Start shopping!</Link></div>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[{to:'/my/orders',icon:ShoppingBag,color:'bg-blue-50 text-blue-600',label:'My Orders',desc:'Track & manage'},{to:'/my/wishlist',icon:Heart,color:'bg-red-50 text-red-500',label:'Wishlist',desc:'Saved items'},{to:'/my/subscriptions',icon:RefreshCw,color:'bg-green-50 text-green-600',label:'Subscriptions',desc:'Daily deliveries'}].map(({to,icon:Icon,color,label,desc}) => (
          <Link key={to} to={to} className="card p-5 flex items-center gap-3 hover:shadow-card-hover transition-all"><div className={`w-10 h-10 rounded-xl ${color.split(' ')[0]} flex items-center justify-center`}><Icon className={`w-5 h-5 ${color.split(' ')[1]}`} /></div><div><p className="font-semibold text-sm">{label}</p><p className="text-xs text-gray-500">{desc}</p></div></Link>
        ))}
      </div>
    </div>
  );
}
