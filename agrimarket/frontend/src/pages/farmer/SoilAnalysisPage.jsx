import { useState, useEffect } from 'react';
import { 
  ThermometerSun, Droplets, Wind, Sprout, 
  FlaskConical, Info, History, ArrowRight,
  TrendingUp, AlertTriangle, CheckCircle2, ChevronRight,
  Star, Calendar
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function SoilAnalysisPage() {
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    N: 90, P: 42, K: 43, pH: 6.5,
    temperature: 25, humidity: 80, rainfall: 200
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/analysis/history');
      setHistory(res.data.data);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/analysis/analyze', formData);
      setResult(res.data.data);
      toast.success('Analysis Complete!');
      fetchHistory();
    } catch (error) {
      const message = error.response?.data?.message || 'Analysis failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  function detectWeather() {
    // Mock weather detection logic
    setFormData(prev => ({
      ...prev,
      N: Math.floor(Math.random() * 50) + 50,
      P: Math.floor(Math.random() * 30) + 30,
      K: Math.floor(Math.random() * 30) + 30,
      pH: parseFloat((Math.random() * (7.5 - 5.5) + 5.5).toFixed(1)),
      temperature: Math.floor(Math.random() * 15) + 20,
      humidity: Math.floor(Math.random() * 40) + 50,
      rainfall: Math.floor(Math.random() * 150) + 100
    }));
    toast.success('Environment data detected!');
  }

  const radarData = [
    { subject: 'Nitrogen', A: formData.N, fullMark: 140 },
    { subject: 'Phosphorus', A: formData.P, fullMark: 140 },
    { subject: 'Potassium', A: formData.K, fullMark: 140 },
    { subject: 'pH', A: formData.pH * 10, fullMark: 140 }, // Scaled for viz
    { subject: 'Humidity', A: formData.humidity, fullMark: 140 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-primary-800 tracking-tight flex items-center gap-3">
            <FlaskConical className="w-10 h-10 text-primary-600" />
            Soil Intelligence
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Real-time fertility analysis & crop prediction engine</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
           <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
             <TrendingUp className="w-5 h-5" />
           </div>
           <div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Status</p>
             <p className="text-sm font-bold text-gray-700">AI Engine Online</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Input Control Panel */}
        <div className="xl:col-span-2 space-y-8">
          <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-elevated overflow-hidden">
            <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <h2 className="font-black text-primary-800 flex items-center gap-2">
                <ThermometerSun className="text-primary-600" />
                Input Soil Parameters
              </h2>
              <button 
                type="button"
                onClick={detectWeather}
                className="text-xs font-black text-primary-600 bg-white px-4 py-2 rounded-xl border border-primary-100 shadow-sm hover:bg-primary-50 transition-all flex items-center gap-2 active:scale-95"
              >
                <Wind className="w-3.5 h-3.5 animate-pulse" />
                Detect Real-time Environment
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Nutrients */}
                <div className="space-y-4">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Secondary Nutrients (NPK)</p>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-gray-700">Nitrogen (N)</label>
                        <span className="text-sm font-black text-primary-600">{formData.N} mg/kg</span>
                      </div>
                      <input type="range" name="N" min="0" max="140" value={formData.N} onChange={handleInputChange} className="w-full accent-primary-600" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-gray-700">Phosphorus (P)</label>
                        <span className="text-sm font-black text-primary-600">{formData.P} mg/kg</span>
                      </div>
                      <input type="range" name="P" min="0" max="140" value={formData.P} onChange={handleInputChange} className="w-full accent-primary-600" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-gray-700">Potassium (K)</label>
                        <span className="text-sm font-black text-primary-600">{formData.K} mg/kg</span>
                      </div>
                      <input type="range" name="K" min="0" max="140" value={formData.K} onChange={handleInputChange} className="w-full accent-primary-600" />
                    </div>
                  </div>
                </div>

                {/* Climatic Factors */}
                <div className="space-y-4">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Environment</p>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-gray-700">Temperature</label>
                        <span className="text-sm font-black text-primary-600">{formData.temperature}°C</span>
                      </div>
                      <input type="range" name="temperature" min="0" max="50" value={formData.temperature} onChange={handleInputChange} className="w-full accent-primary-600" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-gray-700">Humidity</label>
                        <span className="text-sm font-black text-primary-600">{formData.humidity}%</span>
                      </div>
                      <input type="range" name="humidity" min="0" max="100" value={formData.humidity} onChange={handleInputChange} className="w-full accent-primary-600" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-gray-700">Rainfall</label>
                        <span className="text-sm font-black text-primary-600">{formData.rainfall}mm</span>
                      </div>
                      <input type="range" name="rainfall" min="0" max="300" value={formData.rainfall} onChange={handleInputChange} className="w-full accent-primary-600" />
                    </div>
                  </div>
                </div>

                {/* Soil Health */}
                <div className="space-y-4">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Soil Chemistry</p>
                  <div className="p-6 bg-primary-50/50 rounded-3xl border border-primary-100 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-24 bg-white rounded-2xl mb-4 border-2 border-primary-200 flex flex-col items-center pb-2 relative overflow-hidden">
                       <div className="bg-primary-600 w-full h-1/2 absolute bottom-0 transition-all duration-1000" style={{ height: `${(formData.pH/14)*100}%` }}></div>
                       <span className="mt-auto z-10 font-black text-primary-800 text-xl">{formData.pH}</span>
                    </div>
                    <label className="text-sm font-black text-primary-800 mb-2">pH Level</label>
                    <input type="number" step="0.1" name="pH" min="0" max="14" value={formData.pH} onChange={handleInputChange} className="w-20 p-2 text-center font-bold text-primary-600 bg-white border border-primary-200 rounded-xl" />
                    <p className="text-[10px] text-primary-600 mt-4 opacity-70">Optimal range: 5.5 - 7.5</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary px-10 py-4 text-lg group relative overflow-hidden"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing AI...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                       Run Diagnostic Analysis
                       <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Results Display */}
          {result && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up">
               {/* Main Prediction */}
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="relative">
                   <div className="flex justify-between items-start mb-6">
                     <p className="text-primary-100 font-black uppercase tracking-[0.2em] text-xs">Top Predicted Crop</p>
                     <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-2 border border-white/20 ${
                       result.yield_prediction === 'Gold' ? 'bg-amber-400 text-amber-900 border-amber-300' : 
                       result.yield_prediction === 'Silver' ? 'bg-slate-200 text-slate-700' : 'bg-orange-300 text-orange-900'
                     }`}>
                        <Star className="w-3 h-3 fill-current" />
                        Yield: {result.yield_prediction} Grade
                     </div>
                   </div>
                   
                   <div className="flex items-center gap-6 mb-8">
                     <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30 shadow-inner">
                        <Sprout className="w-10 h-10 text-white" />
                     </div>
                     <div>
                        <h3 className="text-5xl font-black mb-1">{result.predicted_crop}</h3>
                        <div className="flex items-center gap-2 text-primary-100 font-bold">
                           <CheckCircle2 className="w-4 h-4" />
                           {result.confidence || 0}% Match Probability
                        </div>
                     </div>
                   </div>

                   {/* Sowing Guide Timeline */}
                   <div className="mb-8 p-4 bg-white/10 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-black uppercase text-primary-200 mb-3 tracking-widest flex items-center gap-2">
                         <Calendar className="w-3.5 h-3.5" /> Smart Sowing Guide
                      </p>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar">
                         {result.sowing_guide?.map((s, i) => (
                            <div key={i} className="px-3 py-2 bg-white/10 rounded-xl border border-white/10 flex-shrink-0 min-w-[80px]">
                               <p className="text-[10px] font-bold text-white">{s.month}</p>
                               <p className={`text-[8px] font-black uppercase mt-0.5 ${s.rating === 'Optimal' ? 'text-emerald-300' : 'text-amber-300'}`}>{s.rating}</p>
                            </div>
                         ))}
                      </div>
                   </div>

                   <p className="text-sm text-primary-50/80 leading-relaxed mb-8">
                     Based on your soil data, {result.predicted_crop} has the highest success yield potential. 
                     The nutrient profile matches optimal growth requirements.
                   </p>

                   <div className="mt-auto flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-white/10">
                      <div>
                         <p className="text-[10px] font-black uppercase text-primary-200 opacity-60">Fertility Score</p>
                         <p className="text-2xl font-black">{result.fertility_score || 0}/100</p>
                      </div>
                      <div className="text-right">
                         <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${(result.fertility_score || 0) > 70 ? 'bg-emerald-500/30 text-emerald-200' : 'bg-amber-500/30 text-amber-200'}`}>
                           {(result.fertility_score || 0) > 70 ? 'High Fertility' : 'Medium Health'}
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Suggestions Chart */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-elevated">
                 <h3 className="text-xl font-black text-primary-800 mb-6 flex items-center gap-2">
                    <TrendingUp className="text-primary-600" />
                    Competitor Crops
                 </h3>
                 <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={70} data={(result.top_suggestions || []).map(s => ({ subject: s.crop, A: s.score, fullMark: 100 }))}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#374151' }} />
                        <Radar name="Compatibility" dataKey="A" stroke="#16a34a" fill="#16a34a" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="space-y-3">
                   {(result.top_suggestions || []).map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm font-black text-gray-700">{s.crop}</span>
                        <div className="flex items-center gap-2">
                           <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-primary-600" style={{ width: `${s.score || 0}%` }}></div>
                           </div>
                           <span className="text-xs font-black text-primary-700">{s.score || 0}%</span>
                        </div>
                      </div>
                   ))}
                 </div>
              </div>

              {/* AI Insights Card */}
              <div className="md:col-span-2 bg-emerald-50/50 rounded-[2.5rem] p-8 border border-emerald-100/50">
                 <h3 className="text-xl font-black text-emerald-800 mb-6 flex items-center gap-2">
                    <Info className="text-emerald-600" />
                    AI Actionable Insights
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(result.insights || []).map((insight, idx) => (
                      <div key={idx} className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-emerald-100">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                           <AlertTriangle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <p className="text-sm text-emerald-800 font-medium leading-relaxed">{insight}</p>
                      </div>
                    ))}
                    {(!result.insights || result.insights.length === 0) && (
                      <div className="md:col-span-2 text-center py-4 bg-white rounded-2xl border border-primary-100">
                         <p className="text-emerald-700 font-bold">Soil is perfectly balanced! No immediate corrections needed.</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* History & Sidebar */}
        <div className="space-y-8">
           {/* Visual Summary Card */}
           <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-elevated">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Current Soil Profile</h3>
              <div className="h-64 mb-6">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius="70%" data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 700 }} />
                      <Radar name="Soil" dataKey="A" stroke="#16a34a" fill="#16a34a" fillOpacity={0.1} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase">Avg Yield Prof</p>
                    <p className="text-lg font-black text-primary-700">High</p>
                 </div>
                 <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase">Resilience</p>
                    <p className="text-lg font-black text-primary-700">82%</p>
                 </div>
              </div>
           </div>

           {/* Analysis History */}
           <section className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-elevated">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-primary-800 flex items-center gap-2">
                  <History className="w-5 h-5 text-primary-600" />
                  Recent Tests
                </h3>
              </div>
              
              <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
                {historyLoading ? (
                   [1,2,3].map(i => <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse"></div>)
                ) : history.length === 0 ? (
                  <div className="text-center py-10 opacity-50">
                    <History className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm font-bold">No history available</p>
                  </div>
                ) : (
                  history.map((h) => (
                    <div key={h._id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary-200 transition-all group cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-black text-primary-700 bg-primary-100 px-2 py-0.5 rounded-lg">{h.predictedCrop || h.predicted_crop}</span>
                        <span className="text-[10px] font-bold text-gray-400">
                          {h.timestamp || h.createdAt ? (function() {
                            try { return format(new Date(h.timestamp || h.createdAt), 'MMM d, h:mm a'); }
                            catch (e) { return 'Recently'; }
                          })() : 'Recently'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-[10px] font-bold text-gray-500">
                          N:{h.parameters?.N || 0} P:{h.parameters?.P || 0} K:{h.parameters?.K || 0}
                        </div>
                        <div className="ml-auto w-6 h-6 rounded-full bg-white flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                           <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}
