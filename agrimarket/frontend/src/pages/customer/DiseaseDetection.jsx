import { useState } from 'react';
import { 
  Upload, Shield, Zap, CheckCircle, ExternalLink, 
  ShoppingBag, AlertCircle, ArrowRight, Activity, Camera 
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import useCartStore from '../../store/cartStore';
import { useNavigate } from 'react-router-dom';

export default function DiseaseDetection() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addItem } = useCartStore();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleDiagnose = async () => {
    if (!image) return toast.error('Please upload a leaf image first');
    
    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);

    try {
      const { data } = await api.post('/predict-disease', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (data.success) {
        setResult(data.data);
        toast.success('Diagnosis complete!');
      }
    } catch (error) {
      console.error('Diagnosis Error:', error);
      toast.error(error.response?.data?.message || 'AI service unreachable');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = (medicine) => {
    // Adapter to match cart item structure
    const cartItem = {
      _id: medicine._id,
      name: medicine.name,
      price: medicine.price,
      image: medicine.image,
      farmer: medicine.brand, // Using brand as sub-identifier
      category: 'medicine'
    };
    addItem(cartItem);
    toast.success('Medicine added to cart');
    navigate('/cart');
  };

  const [activeView, setActiveView] = useState('original'); // 'original' or 'heatmap'

  return (
    <div className="min-h-screen bg-gradient-soft py-12 md:py-20 animate-in fade-in duration-700">
      <div className="page-container max-w-6xl mx-auto space-y-16">
        
        {/* Header section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-black uppercase tracking-[0.25em] border border-emerald-100 shadow-sm animate-bounce">
            <Zap className="w-3.5 h-3.5" /> AI Diagnostic Suite
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-primary-800 tracking-tighter leading-[0.9]">
            Instant Crop <span className="text-primary-600">Disease Detection</span>
          </h1>
          <p className="text-gray-400 font-light text-base md:text-lg uppercase tracking-widest leading-relaxed opacity-80">
            Upload a clear image of the affected leaf to get a professional diagnosis and targeted medicine recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Left: Upload Zone */}
          <div className="group card p-8 bg-white shadow-soft rounded-[2.5rem] border border-gray-100 flex flex-col transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
            <div className="flex-1 flex flex-col space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Scan Leaf Image</h3>
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              </div>

              <div className={`relative flex-1 min-h-[350px] rounded-[2rem] border-2 border-dashed transition-all duration-500 overflow-hidden
                ${preview ? 'border-primary-500/30' : 'border-gray-100 hover:border-primary-400 bg-gray-50/50'}`}>
                
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />

                {preview ? (
                  <div className="absolute inset-0 group/frame">
                    <img 
                      src={activeView === 'heatmap' && result?.heatmap_b64 ? `data:image/jpeg;base64,${result.heatmap_b64}` : preview} 
                      alt="Leaf Analysis" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/frame:scale-105" 
                    />
                    
                    {result?.heatmap_b64 && (
                      <div className="absolute top-6 right-6 flex bg-white/90 backdrop-blur-md rounded-full p-1 shadow-2xl border border-white/50 z-20">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveView('original'); }}
                          className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'original' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-500 hover:text-primary-800'}`}
                        >
                          Original
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveView('heatmap'); }}
                          className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'heatmap' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-primary-800'}`}
                        >
                          Heatmap
                        </button>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/frame:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <div className="px-8 py-3 bg-white text-primary-800 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl flex items-center gap-2">
                        <Camera className="w-4 h-4" /> Change Image
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 space-y-6">
                    <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-soft group-hover:rotate-6 transition-all duration-500 border border-gray-100">
                      <Camera className="w-10 h-10 text-primary-600" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-bold text-primary-800">Drag & Drop Image</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">or click to browse local files</p>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={handleDiagnose}
                disabled={loading || !image}
                className={`w-full py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.25em] transition-all duration-500 flex items-center justify-center gap-3 relative overflow-hidden active:scale-[0.97] shadow-xl text-white
                  ${loading ? 'bg-primary-400 cursor-wait' : 'bg-primary-600 hover:bg-primary-700 hover:shadow-primary-600/40'}
                  ${!image && 'opacity-50 grayscale cursor-not-allowed shadow-none'}`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Analyzing Specimen...
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5" /> Analyze Leaf
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Results Section */}
          <div className="flex flex-col">
            {!result ? (
              <div className="flex-1 card p-8 bg-white/40 shadow-soft rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center text-center space-y-6 border-dashed border-2">
                <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-soft opacity-50">
                  <Shield className="w-10 h-10 text-gray-300" strokeWidth={1} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Diagnostic Idle</p>
                  <p className="text-xs text-gray-400 max-w-[200px] font-bold uppercase tracking-tighter opacity-60">Upload an image to trigger the AI inference engine.</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 space-y-6 animate-in slide-in-from-right-8 duration-700">
                {/* Result Overview */}
                <div className="card p-8 bg-white shadow-soft rounded-[2.5rem] border border-gray-100 relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary-50 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />
                  
                  <div className="flex justify-between items-center mb-6">
                    <span className="px-4 py-1.5 bg-primary-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-600/20">
                      {result.top_3?.[0].confidence || result.confidence} Confidence
                    </span>
                    {result.status.includes('Uncertain') && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Low Quality</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 mb-8">
                    <h2 className="text-4xl font-black text-primary-800 tracking-tighter">{result.disease}</h2>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-lg uppercase tracking-widest">{result.scientific_name}</span>
                      <span className="text-xs font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-lg uppercase tracking-widest border border-gray-100">{result.pathogen}</span>
                    </div>
                  </div>

                  {/* Indicators */}
                  {result.top_3 && (
                    <div className="space-y-4 mb-8 p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Confidence Score</p>
                      {result.top_3.map((item, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-[11px] font-black text-gray-700 uppercase tracking-tight">
                            <span>{item.label}</span>
                            <span>{item.confidence}</span>
                          </div>
                          <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-gray-100 shadow-inner">
                            <div 
                              className={`h-full transition-all duration-1000 ${i === 0 ? 'bg-primary-600' : 'bg-gray-400'}`}
                              style={{ width: item.confidence }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4 pt-6 mt-auto border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-primary-800">Recommended Cure</h4>
                    </div>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed bg-primary-100/10 p-4 rounded-2xl">
                      {result.treatment || "Use systemic fungicides targeting fungal pathogens."}
                    </p>
                  </div>
                </div>

                {/* Medicine Recommendations */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.25em] text-gray-400">Targeted Pharmacy</h3>
                    <span className="text-[10px] font-black text-white bg-primary-600 px-3 py-1 rounded-full">{result.recommendedMedicines?.length} Products</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {result.recommendedMedicines?.map((med, idx) => (
                      <div key={idx} className="group card p-5 bg-white shadow-soft rounded-3xl border border-gray-50 flex items-center gap-6 hover:shadow-xl transition-all duration-300">
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500">
                          <img src={med.image} alt={med.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-black text-primary-600 uppercase tracking-widest mb-1">{med.brand}</p>
                          <h5 className="text-base font-black text-primary-800 truncate tracking-tight">{med.name}</h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-black text-primary-800">₹{med.price.selling}</span>
                            <span className="text-[10px] text-gray-400 font-bold line-through">₹{med.price.mrp}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleBuyNow(med)}
                          className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-600/20 hover:bg-primary-700 active:scale-90 transition-all"
                        >
                          <ShoppingBag className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
