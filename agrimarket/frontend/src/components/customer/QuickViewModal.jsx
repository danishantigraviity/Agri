import { useState, useEffect } from 'react';
import { X, ShoppingCart, Star, Heart, ArrowRightLeft, ShieldCheck, ChevronRight, ChevronLeft } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import useCompareStore from '../../store/compareStore';
import toast from 'react-hot-toast';

export default function QuickViewModal({ product, onClose, isOpen }) {
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const { addItem: addToCompare } = useCompareStore();

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${product.name} added!`);
    onClose();
  };

  const discount = product.price?.mrp && product.price?.mrp > product.price?.selling
    ? Math.round(((product.price.mrp - product.price.selling) / product.price.mrp) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl h-[min(800px,90vh)] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/80 bg-white dark:bg-gray-800/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-gray-500 hover:text-primary-800 dark:hover:text-white transition-all shadow-lg active:scale-95"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Left: Images Side */}
        <div className="w-full md:w-1/2 bg-gray-50 bg-white dark:bg-gray-800/50 p-8 flex flex-col items-center justify-center gap-6 relative">
          <div className="relative group w-full aspect-square rounded-[2.5rem] overflow-hidden bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700">
            <img 
              src={product.images[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {product.images.length > 1 && (
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setActiveImage((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))}
                  className="w-10 h-10 bg-white/90 bg-white dark:bg-gray-800/90 rounded-xl flex items-center justify-center shadow-md active:scale-90"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <button 
                  onClick={() => setActiveImage((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))}
                  className="w-10 h-10 bg-white/90 bg-white dark:bg-gray-800/90 rounded-xl flex items-center justify-center shadow-md active:scale-90"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            )}
          </div>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
            {product.images.map((img, i) => (
              <button 
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0
                  ${activeImage === i ? 'border-primary-600 shadow-md ring-4 ring-primary-500/10' : 'border-transparent opacity-60 hover:opacity-100'}
                `}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Content Side */}
        <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto no-scrollbar flex flex-col bg-white dark:bg-gray-900">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-primary-100 bg-white dark:bg-gray-900/30 text-primary-700 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                Verified Fresh
              </span>
              {product.isOrganic && (
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                  100% Organic
                </span>
              )}
            </div>
            
            <h2 className="text-4xl font-black text-primary-800 dark:text-white tracking-tighter mb-4 leading-none">
              {product.name}
            </h2>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 text-amber-500">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-base font-black text-primary-800 dark:text-gray-200">{product.rating || '4.8'}</span>
                <span className="text-xs font-bold text-gray-400">({product.reviewCount || 0} Reviews)</span>
              </div>
              <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" /> Policy Protected
              </p>
            </div>
          </div>

          <div className="mb-8 p-6 bg-gray-50 bg-white dark:bg-gray-800/30 rounded-[2rem] border border-gray-100 dark:border-gray-800">
             <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-black text-primary-600 dark:text-primary-400 tracking-tighter">₹{product.price.selling}</span>
                <span className="text-sm font-bold text-gray-400">/ {product.price.unit}</span>
                {discount > 0 && (
                  <span className="text-lg font-black text-gray-300 dark:text-gray-600 line-through tracking-tighter">₹{product.price.mrp}</span>
                )}
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Inclusive of all taxes & doorstep delivery</p>
          </div>

          <div className="space-y-6 mb-12">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Product Description</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                {product.description || "Freshly harvested from local sustainable farms. Guaranteed quality and nutrients preserve via cold-chain distribution."}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 bg-white dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Standard Unit</p>
                <p className="text-xs font-bold text-primary-800 dark:text-white uppercase tracking-tighter">{product.price.unit}</p>
              </div>
              <div className="p-4 bg-gray-50 bg-white dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Origin Farm</p>
                <p className="text-xs font-bold text-primary-800 dark:text-white truncate uppercase tracking-tighter">{product.farmer?.name || "Local Collective"}</p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-gray-50 dark:border-gray-800 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center bg-gray-100 bg-white dark:bg-gray-800 rounded-2xl p-1.5 h-16 w-full sm:w-auto">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q-1))}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-500 hover:bg-white dark:hover:bg-gray-700 transition-all active:scale-90"
              >
                <ChevronLeft />
              </button>
              <span className="w-12 text-center font-black text-lg text-primary-800 dark:text-white tabular-nums">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q+1)}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-500 hover:bg-white dark:hover:bg-gray-700 transition-all active:scale-90"
              >
                <ChevronRight />
              </button>
            </div>

            <button 
              onClick={handleAddToCart}
              className="flex-1 w-full h-16 bg-white hover:bg-gray-50 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Basket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
