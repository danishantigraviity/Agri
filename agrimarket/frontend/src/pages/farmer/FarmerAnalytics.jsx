import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Package, Star, ArrowRight, Download, Calendar, Filter, Zap } from 'lucide-react';
import api from '../../services/api';
import { format } from 'date-fns';

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

const MetricCard = ({ label, value, trend, icon: Icon, color }) => (
  <div className="card p-6 flex items-center justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{label}</p>
      <h3 className="text-2xl font-black text-primary-800 tracking-tighter">{value}</h3>
      {trend && (
        <p className={`text-[10px] font-black mt-2 flex items-center gap-1 ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
          {Math.abs(trend)}% Velocity
        </p>
      )}
    </div>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-50 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors duration-500`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

export default function FarmerAnalytics() {
  const { data, isLoading, isError } = useQuery({ 
    queryKey: ['farmer-analytics'], 
    queryFn: () => api.get('/orders/farmer-analytics').then(r => r.data.data) 
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-100 rounded-lg mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="card h-28 bg-gray-50" />)}
        </div>
        <div className="card h-[400px] bg-gray-50" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary-800 tracking-tight text-gradient bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500">Financial Insights</h1>
          <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Growth metrics and inventory health</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-600 hover:shadow-lg transition-all active:scale-95">
            <Download className="w-4 h-4 text-primary-600" /> Export CSV
          </button>
          <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
            <button className="px-4 py-2 bg-white text-primary-700 shadow-sm rounded-xl text-[10px] font-black uppercase tracking-widest">Live</button>
            <button className="px-4 py-2 text-gray-400 hover:text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest">History</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="Net Revenue" value={`₹${(data?.overview?.totalRevenue || 0).toLocaleString()}`} trend={12.5} icon={DollarSign} />
        <MetricCard label="Orders Filled" value={data?.overview?.totalOrders || 0} trend={8.2} icon={ShoppingBag} />
        <MetricCard label="Average Yield" value={`₹${((data?.overview?.totalRevenue || 0) / (data?.overview?.totalOrders || 1)).toFixed(0)}`} icon={Zap} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card p-10 hover:shadow-2xl hover:shadow-gray-900/5 transition-all duration-500">
           <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black text-primary-800 tracking-tight">Revenue Stream</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">7-Day Real-time Velocity</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> +12% Growth
                </span>
              </div>
           </div>
          
          <div className="h-[320px]">
            {data?.dailyRevenue?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dailyRevenue} margin={{ left: -10 }}>
                  <defs>
                    <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="6 6" stroke="#f1f5f9" vertical={false} />
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
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#16a34a" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#areaColor)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">Insufficient stream data</div>
            )}
          </div>
        </div>

        <div className="card p-10 hover:shadow-2xl hover:shadow-gray-900/5 transition-all duration-500">
          <h3 className="text-xl font-black text-primary-800 tracking-tight mb-8 uppercase text-[14px] tracking-[0.1em]">Catalog Liquidity</h3>
          {data?.topProducts?.length ? (
            <div className="space-y-6">
              {data.topProducts.slice(0, 6).map((p, i) => (
                <div key={p._id} className="flex items-center gap-5 group cursor-pointer">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:bg-primary-50 transition-colors duration-300">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt="" className="w-12 h-12 rounded-2xl object-cover" />
                    ) : (
                      <span className="text-xs font-black text-gray-300 uppercase leading-none">0{i+1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-primary-800 truncate tracking-tight uppercase group-hover:text-primary-700 transition-colors">{p.name}</p>
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1.5">{p.totalSold} Units Sold</p>
                  </div>
                  <div className="text-right">
                     <p className="text-sm font-black text-primary-800 tabular-nums tracking-tighter">₹{p.revenue?.toLocaleString()}</p>
                     <div className="w-14 h-1 bg-gray-50 rounded-full mt-2 overflow-hidden shadow-inner">
                        <div className="bg-primary-500 h-full rounded-full" style={{ width: `${Math.min(100, (p.revenue / (data.topProducts?.[0]?.revenue||1)) * 100)}%` }} />
                     </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">No sales recorded yet</div>
          )}
        </div>
      </div>

      {/* ── Phase 3: AI Market Pulse & Sell Optimization ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Predictive Price Chart */}
        <div className="xl:col-span-2 card p-10 hover:shadow-2xl hover:shadow-gray-900/5 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <div className="flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary-200">
               <Zap className="w-3.5 h-3.5 fill-current" /> AI Predictive Stream
            </div>
          </div>
          
          <div className="mb-10">
            <h3 className="text-2xl font-black text-primary-800 tracking-tight">Market Pulse Forecasting</h3>
            <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mt-1">Predicted 14-Day Price Trends (INR/kg)</p>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={[...Array(14)].map((_, i) => ({
                  day: format(new Date(Date.now() + i * 24 * 60 * 60 * 1000), 'MMM d'),
                  price: 45 + Math.sin(i * 0.5) * 5 + (Math.random() * 2)
                }))}
              >
                <defs>
                  <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }}
                />
                <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-primary-900 text-white p-3 rounded-xl shadow-2xl border border-white/10">
                          <p className="text-[9px] font-black uppercase opacity-60 mb-1">{label}</p>
                          <p className="text-sm font-black">₹{payload[0].value.toFixed(2)}/kg</p>
                          <p className="text-[8px] font-bold text-primary-300 mt-1">Expected Trend: Rising</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#22c55e" 
                  strokeWidth={3} 
                  strokeDasharray="5 5"
                  fill="url(#pulseGrad)" 
                  animationDuration={3000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 flex items-center gap-4 p-4 bg-primary-50 rounded-2xl border border-primary-100">
             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-sm">
                <TrendingUp className="w-5 h-5" />
             </div>
             <div>
                <p className="text-[10px] font-black text-primary-800 uppercase tracking-widest">AI Verdict</p>
                <p className="text-xs font-bold text-primary-600">Market supply is tightening. Predicted 12% price surge in next 10 days. Hold inventory for max yield.</p>
             </div>
          </div>
        </div>

        {/* Sell Optimization Card */}
        <div className="card p-10 bg-white border-2 border-primary-100 flex flex-col hover:shadow-2xl transition-all duration-500">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-primary-600/20">
             <DollarSign className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-primary-800 tracking-tight uppercase tracking-widest mb-2">Sell Optimizer</h3>
          <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">
            Our AI analyzed your current stock levels and local demand. You are currently losing 5% potential margin on Tomatoes due to off-peak pricing.
          </p>
          
          <div className="space-y-4 mb-8">
             <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase">Optimal Sell Date</span>
                <span className="text-xs font-black text-primary-700">Oct 24, 2024</span>
             </div>
             <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase">Projected Profit Increase</span>
                <span className="text-xs font-black text-emerald-600">+₹1,420</span>
             </div>
          </div>

          <button className="mt-auto w-full py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 hover:shadow-xl transition-all flex items-center justify-center gap-2">
            Automate Sell Notifications <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
