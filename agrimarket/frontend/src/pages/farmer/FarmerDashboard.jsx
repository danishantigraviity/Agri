import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, TrendingDown, Package, ShoppingBag, DollarSign,
  Star, AlertCircle, Plus, ArrowRight, Clock, Users,
  CheckCircle2, AlertTriangle, ExternalLink, BarChart2, ShieldCheck, Timer, History, Calendar,
  Zap, FlaskConical, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import CustomDatePicker from '../../components/common/CustomDatePicker';

const StatCard = ({ icon: Icon, label, value, sub, trend, gradient }) => (
  <div className="group relative flex flex-col justify-between p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-[0.03] transition-all duration-700 group-hover:scale-150 bg-gradient-to-br ${gradient}`} />
    
    <div className="flex items-start justify-between">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-lg shadow-current/10 group-hover:rotate-6 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>

    <div className="mt-6 relative z-10">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-1">{label}</p>
      <h3 className="text-2xl font-black text-primary-800 tracking-tighter leading-none">{value}</h3>
      {sub && <p className="text-[11px] text-gray-400 font-bold mt-2 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-gray-200" /> {sub}</p>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 border border-gray-100 shadow-2xl rounded-2xl animate-in fade-in zoom-in duration-300">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
        <p className="text-lg font-black text-primary-700 tracking-tight">
          ₹{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function FarmerDashboard() {
  const { user } = useAuthStore();

  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['farmer-analytics', dateRange],
    queryFn: () => api.get('/orders/farmer-analytics', { params: { 
      startDate: dateRange.start, 
      endDate: dateRange.end 
    } }).then(r => r.data.data),
  });

  const { data: myProducts } = useQuery({
    queryKey: ['my-products-recent'],
    queryFn: () => api.get('/products/my-products', { params: { limit: 5 } }).then(r => r.data.data),
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['farmer-recent-orders'],
    queryFn: () => api.get('/orders/farmer-orders', { params: { limit: 5 } }).then(r => r.data.data),
  });

  const isApproved = user?.farmerProfile?.isApproved;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 animate-in fade-in duration-700">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary-50 border-t-primary-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-primary-100 rounded-full animate-pulse" />
          </div>
        </div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">Establishing Secure Stream...</p>
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="card p-12 text-center relative overflow-hidden shadow-2xl shadow-amber-900/10 border-amber-100">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500" />
          <div className="w-24 h-24 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner group hover:rotate-6 transition-all duration-500">
            <Timer className="w-12 h-12 text-amber-600" />
          </div>
          <h2 className="text-3xl font-black text-primary-800 mb-4 tracking-tighter">Farm Verification in Progress</h2>
          <p className="text-gray-500 text-base leading-relaxed max-w-md mx-auto font-medium">
            We are currently reviewing your farm details to ensure the highest quality for our customers. This usually takes 24-48 hours.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-12 text-left">
            {[
              { icon: CheckCircle2, text: 'Application Sent', done: true },
              { icon: ShieldCheck, text: 'Security Audit', done: false },
              { icon: Package, text: 'Store Active', done: false }
            ].map((step, i) => (
              <div key={i} className={`p-5 rounded-3xl border-2 transition-all duration-500 ${step.done ? 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm' : 'bg-gray-50/50 border-gray-100 text-gray-400 grayscale'}`}>
                <step.icon className={`w-6 h-6 mb-3 ${step.done ? 'text-emerald-600' : 'text-gray-300'}`} />
                <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{step.text}</p>
              </div>
            ))}
          </div>

          <Link to="/farmer/profile" className="w-full sm:w-auto mt-10 inline-flex items-center justify-center gap-2 px-10 py-4 bg-amber-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-700 hover:shadow-xl hover:shadow-amber-900/20 active:scale-95 transition-all">
            Update Profile <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12 animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-md">Farm Verified</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-primary-800 tracking-tighter">
            Glad to see you, {user?.name?.split(' ')[0]}! 🚜
          </h1>
          <p className="text-gray-500 font-bold mt-1 uppercase text-[11px] tracking-widest opacity-80">Real-time Performance Metrics</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex z-50">
            <CustomDatePicker 
              startDate={dateRange.start} 
              endDate={dateRange.end} 
              setDateRange={setDateRange} 
            />
          </div>
          <button className="flex items-center gap-2.5 px-5 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md active:scale-95 transition-all">
            <BarChart2 className="w-4 h-4 text-primary-600" /> Business Insights
          </button>
          <Link to="/farmer/products/add" className="flex items-center gap-2.5 px-6 py-3 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 hover:shadow-xl hover:shadow-primary-600/30 active:scale-95 transition-all">
            <Plus className="w-4 h-4" strokeWidth={3} /> List Product
          </Link>
        </div>
      </div>

      {/* AI Hub Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative group overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 rounded-[2.5rem] p-8 text-white shadow-2xl transition-all duration-500 hover:shadow-primary-600/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/20 transition-all duration-700" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="max-w-[70%]">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                <Zap className="w-3.5 h-3.5" /> High Performance AI
              </div>
              <h3 className="text-3xl font-black tracking-tighter mb-2">Soil Fertility Lab</h3>
              <p className="text-primary-100/80 text-sm font-medium leading-relaxed mb-6">Analyze NPK levels and get real-time crop predictions optimized for your land.</p>
              <Link to="/farmer/soil-analysis" className="inline-flex items-center gap-2.5 px-6 py-3 bg-white text-primary-700 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:translate-x-1 transition-all">
                Launch Analysis <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="hidden sm:flex w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl items-center justify-center border border-white/20 shadow-inner group-hover:rotate-12 transition-all">
              <FlaskConical className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        <div className="relative group overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-2xl transition-all duration-500 hover:shadow-indigo-600/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/20 transition-all duration-700" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="max-w-[70%]">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                <ShieldCheck className="w-3.5 h-3.5" /> Biosecurity Level 4
              </div>
              <h3 className="text-3xl font-black tracking-tighter mb-2">Crop Diagnosis</h3>
              <p className="text-indigo-100/80 text-sm font-medium leading-relaxed mb-6">Instant leaf scanning for disease detection and immediate cure recommendations.</p>
              <Link to="/farmer/diagnose" className="inline-flex items-center gap-2.5 px-6 py-3 bg-white text-indigo-700 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:translate-x-1 transition-all">
                Start Diagnosis <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="hidden sm:flex w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl items-center justify-center border border-white/20 shadow-inner group-hover:-rotate-12 transition-all">
              <Activity className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign} label="Gross Revenue"
          value={`₹${(analytics?.overview?.totalRevenue || 0).toLocaleString()}`}
          sub="Earnings since start"
          trend={analytics?.trends?.revenueGrowth}
          gradient="from-emerald-400 to-teal-600"
        />
        <StatCard
          icon={ShoppingBag} label="Total Volume"
          value={analytics?.overview?.totalOrders || 0}
          sub="Package fulfillments"
          trend={analytics?.trends?.orderGrowth}
          gradient="from-blue-400 to-indigo-600"
        />
        <StatCard
          icon={Package} label="Catalog Size"
          value={myProducts?.total || 0}
          sub="Verified listings"
          gradient="from-fuchsia-400 to-purple-600"
        />
        <StatCard
          icon={Users} label="Reach Index"
          value={analytics?.customerInsights?.totalUnique || 0}
          sub={`${analytics?.customerInsights?.repeatCount || 0} repeat customers`}
          gradient="from-amber-400 to-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card p-10 hover:shadow-2xl hover:shadow-gray-900/5 transition-all duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
            <div>
              <h3 className="text-xl font-black text-primary-800 tracking-tighter">Market Penetration</h3>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">7-Day Revenue Velocity</p>
            </div>
            <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-[1.25rem] self-start border border-gray-100">
              {['7D', '30D', '90D'].map(v => (
                <button key={v} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${v==='7D'?'bg-white text-primary-700 shadow-sm':'text-gray-400 hover:text-gray-600'}`}>{v}</button>
              ))}
            </div>
          </div>
          
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.dailyRevenue || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="8 8" stroke="#f8fafc" vertical={false} />
                <XAxis 
                  dataKey="_id" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
                  tickFormatter={d => d?.slice(5)}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
                  tickFormatter={v => `₹${v>=1000?v/1000+'k':v}`}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#059669', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#059669" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#revGrad)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Heatmap */}
        <div className="card p-10 bg-white dark:bg-gray-900 border-none">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-primary-800 dark:text-white tracking-tighter">Sales Velocity</h3>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">180-Day Market Activity</p>
            </div>
            <History className="w-5 h-5 text-gray-300" />
          </div>
          
          <div className="flex flex-wrap gap-1.5 justify-center">
            {analytics?.heatmap?.length > 0 ? (
              analytics.heatmap.map((day, i) => (
                <div 
                  key={i} 
                  title={`${day._id}: ${day.value} sales`}
                  className={`w-3.5 h-3.5 rounded-sm transition-all hover:scale-125 cursor-pointer shadow-sm
                    ${day.value === 0 ? 'bg-gray-50 bg-white dark:bg-gray-800' : 
                      day.value < 5 ? 'bg-primary-200' :
                      day.value < 10 ? 'bg-primary-400' :
                      'bg-white'}
                  `}
                />
              ))
            ) : (
              <div className="flex items-center justify-center p-12 w-full border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2rem]">
                <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Generating Activity Map...</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Low</span>
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 bg-primary-100 rounded-sm" />
              <div className="w-2.5 h-2.5 bg-primary-300 rounded-sm" />
              <div className="w-2.5 h-2.5 bg-primary-500 rounded-sm" />
              <div className="w-2.5 h-2.5 bg-gray-50 rounded-sm" />
            </div>
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">High</span>
          </div>
        </div>

        <div className="card p-10 flex flex-col hover:shadow-2xl hover:shadow-gray-900/5 transition-all duration-500">
          <h3 className="text-xl font-black text-primary-800 tracking-tighter mb-10">Status Flux</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.statusBreakdown || []} layout="vertical" barSize={12} margin={{ left: -20 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="_id" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'black' }}
                  width={100}
                  tickFormatter={d => d?.replace(/_/g, ' ')?.toUpperCase()}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} animationDuration={1500}>
                  {analytics?.statusBreakdown?.map((_, index) => (
                    <Cell 
                      key={`cl-${index}`} 
                      fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][index % 4]} 
                      fillOpacity={0.9}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-8 pt-8 border-t border-gray-50 text-center">
            <div>
              <p className="text-lg font-black text-primary-800 leading-none">{analytics?.overview?.totalOrders || 0}</p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5">Stream</p>
            </div>
            <div>
              <p className="text-lg font-black text-emerald-600 leading-none">
                {analytics?.statusBreakdown?.find(s => s._id === 'delivered')?.count || 0}
              </p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5">Success</p>
            </div>
            <div>
              <p className="text-lg font-black text-amber-600 leading-none">
                {analytics?.statusBreakdown?.filter(s => ['placed', 'confirmed', 'processing'].includes(s._id)).reduce((a, b) => a + b.count, 0)}
              </p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5">Queue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-10 hover:shadow-2xl hover:shadow-gray-900/5 transition-all duration-500">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-primary-800 tracking-tighter">Performance Leaders</h3>
            <Link to="/farmer/products" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 hover:text-primary-700 bg-primary-50 px-5 py-2.5 rounded-2xl transition-all">
              Full Catalog
            </Link>
          </div>
          <div className="space-y-6">
            {analytics?.topProducts?.slice(0, 5).map((product, idx) => (
              <div key={idx} className="flex items-center gap-6 p-1 rounded-[1.5rem] hover:translate-x-2 transition-transform duration-300">
                <div className="text-sm font-black text-gray-200 tabular-nums">0{idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-primary-800 truncate tracking-tight uppercase group-hover:text-primary-600">{product.name}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {product.totalSold} Verified Sales
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-primary-700 tabular-nums">₹{product.revenue?.toLocaleString()}</p>
                  <div className="w-20 h-1 bg-gray-50 rounded-full mt-2.5 overflow-hidden">
                    <div className="bg-primary-500 h-full rounded-full" style={{ width: `${Math.min(100, (product.revenue / (analytics?.topProducts?.[0]?.revenue || 1)) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-10 hover:shadow-2xl hover:shadow-gray-900/5 transition-all duration-500">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-primary-800 tracking-tighter">Live Order Stream</h3>
            <Link to="/farmer/orders" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 hover:text-primary-700 bg-primary-50 px-5 py-2.5 rounded-2xl transition-all">
              Live Feed
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders?.orders?.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-5 bg-gray-50/50 rounded-[1.75rem] border border-transparent hover:border-primary-100 hover:bg-white hover:shadow-xl hover:shadow-primary-900/5 transition-all cursor-pointer group">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-primary-600 shadow-sm group-hover:translate-x-1 group-hover:-translate-y-1 transition-all">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">ORD-{order.orderNumber?.slice(-6)}</p>
                    <p className="text-sm font-black text-primary-800 tracking-tight capitalize">{order.customer?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-primary-800 tabular-nums tracking-tighter">₹{order.pricing?.total?.toLocaleString()}</p>
                  <span className={`inline-block text-[8px] font-black uppercase tracking-widest mt-1.5 px-3 py-1 rounded-full border 
                    ${order.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      order.orderStatus === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                      'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    {order.orderStatus?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
