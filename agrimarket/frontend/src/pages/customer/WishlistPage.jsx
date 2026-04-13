import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, ShoppingBag, ArrowRight, Search } from 'lucide-react';
import api from '../../services/api';
import ProductCard from '../../components/common/ProductCard';

export default function WishlistPage() {
  const { data, isLoading, refetch } = useQuery({ 
    queryKey: ['wishlist'], 
    queryFn: () => api.get('/auth/me').then(r => r.data.user?.wishlist || []) 
  });

  return (
    <div className="page-container py-12 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-primary-800 tracking-tighter flex items-center gap-3">
            My Wishlist <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
          </h1>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.2em] opacity-70">
            Your curated collection of farm-fresh favorites
          </p>
        </div>
        {data?.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-rose-50 rounded-2xl border border-rose-100 shadow-sm">
            <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">{data.length} Saved Items</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="card aspect-[4/5] animate-pulse bg-gray-50 border-gray-100 rounded-3xl" />
          ))}
        </div>
      ) : !data?.length ? (
        <div className="card p-20 flex flex-col items-center justify-center text-center space-y-8 bg-gray-50/50 border-dashed border-2 border-gray-200">
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-xl group hover:rotate-12 transition-transform duration-500">
              <Heart className="w-10 h-10 text-gray-200" strokeWidth={1} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary-500 text-white p-2 rounded-full shadow-lg">
              <Search className="w-4 h-4" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-primary-800 tracking-tight">Your wishlist is empty</h3>
            <p className="text-sm text-gray-500 font-medium max-w-xs mx-auto leading-relaxed">
              Looks like you haven't saved any fresh harvest yet. Start exploring our marketplace!
            </p>
          </div>

          <Link 
            to="/" 
            className="flex items-center gap-2.5 px-8 py-4 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 hover:shadow-xl hover:shadow-primary-600/30 active:scale-95 transition-all shadow-lg"
          >
            Explore Marketplace <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {data.map(p => (
            <ProductCard key={p._id} product={p} onWishlistChange={refetch} />
          ))}
          
          {/* Add more CTA Card */}
          <Link 
            to="/" 
            className="group card border-dashed border-2 border-gray-200 p-6 flex flex-col items-center justify-center text-center space-y-4 hover:border-primary-400 hover:bg-primary-50/30 transition-all duration-500 aspect-[4/5]"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-primary-600 group-hover:rotate-90 transition-all duration-500 shadow-sm">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-primary-800 uppercase tracking-widest">Find More</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Fresh Arrivals</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
