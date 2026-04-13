import { X, ArrowRightLeft, Trash2, ExternalLink } from 'lucide-react';
import useCompareStore from '../../store/compareStore';
import { Link } from 'react-router-dom';

export default function ProductComparison() {
  const { items, removeItem, clearCompare } = useCompareStore();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-4xl">
      <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-gray-200 shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden animate-in slide-in-from-bottom-10 lg:animate-in lg:fade-in duration-500">
        <div className="p-5 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
              <ArrowRightLeft className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-primary-800 uppercase tracking-tight">Compare Products</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{items.length} of 3 Selected</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={clearCompare}
              className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear All
            </button>
            <button className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95 shadow-md">
              Start Full Comparison
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-3 gap-4 sm:gap-6">
          {items.map((product) => (
            <div key={product._id} className="relative group bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:border-primary-200 transition-all">
              <button 
                onClick={() => removeItem(product._id)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:scale-110 transition-all z-10 shadow-sm"
              >
                <X className="w-3 h-3" strokeWidth={3} />
              </button>
              
              <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-gray-50">
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-primary-800 truncate">{product.name}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">₹{product.price.selling}</span>
                  <Link to={`/products/${product._id}`} className="text-gray-400 hover:text-primary-600 transition-colors">
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {/* Empty slots */}
          {[...Array(3 - items.length)].map((_, i) => (
            <div key={`empty-${i}`} className="border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center p-3 text-center">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                <Plus className="w-4 h-4 text-gray-300" />
              </div>
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Add Product</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Plus({ className, ...props }) {
  return (
    <svg 
      {...props}
      className={className}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
