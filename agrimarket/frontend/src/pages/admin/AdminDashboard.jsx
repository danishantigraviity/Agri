import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users, Package, ShoppingBag, DollarSign, Clock,
  TrendingUp, CheckCircle, AlertTriangle, ArrowRight, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { 
  Plus, UserPlus, ShoppingCart, Tag, Info, History
} from 'lucide-react';
import api from '../../services/api';
import { format } from 'date-fns';
import CustomDatePicker from '../../components/common/CustomDatePicker';

const StatCard = ({ icon: Icon, label, value, sub, gradient, to }) => (
  <Link 
    to={to || '#'} 
    className="group relative flex flex-col p-5 bg-white dark:bg-gray-900 rounded-[1.5rem] border border-gray-100/50 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden"
  >
    {/* Subtle Background Glow */}
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-[0.03] transition-all duration-700 group-hover:scale-150 bg-gradient-to-br ${gradient}`} />

    <div className="flex items-center justify-between mb-6 relative z-10">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-lg shadow-current/20 group-hover:rotate-6 transition-all duration-500`}>
        <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
      </div>
      {sub && (
        <span className="text-[9px] font-black tracking-widest text-gray-400 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 uppercase group-hover:border-gray-200 transition-colors">
          {sub}
        </span>
      )}
    </div>
    
    <div className="relative z-10">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className="text-3xl leading-none font-black text-primary-800 tracking-tight group-hover:text-primary-700 transition-colors">{value}</p>
    </div>
    
    {/* Bottom Accent Line */}
    <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${gradient} transition-all duration-500 w-0 group-hover:w-full`} />
  </Link>
);

const STATUS_COLORS = {
  placed: '#3b82f6', confirmed: '#f59e0b', processing: '#8b5cf6',
  shipped: '#06b6d4', delivered: '#22c55e', cancelled: '#ef4444',
};

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-dashboard', dateRange],
    queryFn: () => api.get('/admin/dashboard', { params: {
      startDate: dateRange.start,
      endDate: dateRange.end
    }}).then(r => r.data.data),
    refetchInterval: 60000, // refresh every minute
  });
  
  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['admin-activity'],
    queryFn: () => api.get('/admin/activity').then(r => r.data.data),
    refetchInterval: 30000,
  });

  if (isError) {
    const msg = error.response?.data?.message || error.message || 'Failed to fetch dashboard data';
    return (
      <div className="card p-10 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4"><Shield /></div>
        <h3 className="text-lg font-bold text-primary-800">Dashboard Error</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-xs">{msg}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold">Reload Page</button>
      </div>
    );
  }

  const stats = data?.stats || {};
  const monthlyRevenue = data?.monthlyRevenue || [];
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-800 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Platform overview and management</p>
        </div>
        
        <div className="w-64">
          <CustomDatePicker
            startDate={dateRange.start}
            endDate={dateRange.end}
            setDateRange={setDateRange}
          />
        </div>
      </div>

      {/* Alerts */}
      {(stats.pendingFarmers > 0 || stats.pendingProducts > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stats.pendingFarmers > 0 && (
            <Link to="/admin/farmers" className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-800 text-sm">{stats.pendingFarmers} farmers awaiting approval</p>
                <p className="text-xs text-amber-600">Review and approve farmer accounts</p>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600 ml-auto" />
            </Link>
          )}
          {stats.pendingProducts > 0 && (
            <Link to="/admin/products" className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors">
              <Package className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-800 text-sm">{stats.pendingProducts} products pending review</p>
                <p className="text-xs text-blue-600">Approve or reject product listings</p>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-600 ml-auto" />
            </Link>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard icon={Users}        label="Total Users"      value={stats.totalUsers || 0}     sub={`${stats.totalCustomers} customers`} gradient="from-blue-400 to-indigo-600"   to="/admin/users" />
        <StatCard icon={Shield}       label="Total Farmers"    value={stats.totalFarmers || 0}   sub={`${stats.pendingFarmers} pending`}   gradient="from-fuchsia-400 to-purple-600" to="/admin/farmers" />
        <StatCard icon={Package}      label="Live Products"    value={stats.totalProducts || 0}  sub={`${stats.pendingProducts} pending`}  gradient="from-emerald-400 to-green-600"  to="/admin/products" />
        <StatCard icon={DollarSign}   label="Total Revenue"    value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} sub={`${stats.completedOrders} orders`} gradient="from-amber-400 to-orange-500" to="/admin/orders" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Revenue */}
        <div className="card card-body lg:col-span-2 bg-white dark:bg-gray-900 dark:border-gray-800">
          <h3 className="font-bold text-primary-800 dark:text-white mb-4">Revenue Stream</h3>
          {monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius:'12px', border:'1px solid #e5e7eb', fontSize:'12px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* User Breakdown */}
        <div className="card card-body bg-white dark:bg-gray-900 dark:border-gray-800">
          <h3 className="font-bold text-primary-800 dark:text-white mb-4">User Breakdown</h3>
          <div className="flex justify-center">
            <PieChart width={160} height={160}>
              <Pie
                data={[
                  { name: 'Customers', value: stats.totalCustomers || 1 },
                  { name: 'Farmers',   value: stats.totalFarmers   || 1 },
                ]}
                cx={80} cy={80} innerRadius={45} outerRadius={70}
                dataKey="value" paddingAngle={3}
              >
                <Cell fill="#16a34a" />
                <Cell fill="#7c3aed" />
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-2 mt-2">
            {[
              { label: 'Customers', value: stats.totalCustomers || 0, color: 'bg-green-500' },
              { label: 'Farmers',   value: stats.totalFarmers   || 0, color: 'bg-purple-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                </div>
                <span className="font-bold text-sm dark:text-gray-200">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Activity Feed */}
        <div className="card card-body bg-white dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-primary-800 dark:text-white">Platform Activity</h3>
            <History className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-4 max-h-[280px] overflow-y-auto no-scrollbar pr-2">
            {activityLoading ? (
               [...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-50 animate-pulse rounded-xl" />)
            ) : activity?.length > 0 ? (
              activity.map((item, idx) => (
                <div key={idx} className="flex gap-3 relative pb-4 last:pb-0">
                  {idx !== activity.length - 1 && <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-100" />}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                    item.type === 'order' ? 'bg-blue-50 text-blue-600' :
                    item.type === 'product' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-purple-50 text-purple-600'
                  }`}>
                    {item.type === 'order' ? <ShoppingCart className="w-4 h-4" /> :
                     item.type === 'product' ? <Tag className="w-4 h-4" /> :
                     <UserPlus className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-primary-800 truncate">
                      {item.type === 'order' ? `Order ${item.data.orderNumber}` :
                       item.type === 'product' ? `New Product: ${item.data.name}` :
                       `New User: ${item.data.name}`}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-400 font-medium">
                        {format(new Date(item.createdAt), 'hh:mm a')}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400 opacity-50">•</span>
                      <span className="text-[10px] text-primary-600 font-bold uppercase tracking-widest truncate">
                        {item.type === 'product' ? item.data.farmer?.name : item.data.role || 'System'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-xs text-gray-400">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card overflow-hidden bg-white dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h3 className="font-bold text-primary-800 dark:text-white text-lg">Recent Orders</h3>
          <Link to="/admin/orders" className="text-sm text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 bg-white dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order #</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800 bg-white dark:bg-gray-900">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-20 px-4 bg-white dark:bg-gray-900">
                      <div className="w-16 h-16 bg-gray-50 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <ShoppingBag className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-lg font-bold text-primary-800 dark:text-white mb-1">No orders yet</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm text-center">When customers place their first orders, they will appear right here on your dashboard.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-primary-50/50 transition-colors duration-200 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-gray-500 group-hover:text-primary-600 transition-colors">{o.orderNumber}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-primary-800">{o.customer?.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-black text-primary-700 text-base">₹{o.pricing?.total?.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest
                        ${o.orderStatus === 'delivered' ? 'bg-green-100 text-green-700 border border-green-200' : 
                          o.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700 border border-red-200' :
                          'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                        {o.orderStatus?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      {format(new Date(o.createdAt), 'dd MMM yyyy')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
