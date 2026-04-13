import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Heart, Star, Truck, Shield, Leaf, ChevronLeft, Plus, Minus } from 'lucide-react';
import api from '../../services/api';
import useCartStore from '../../store/cartStore';
import ProductCard from '../../components/common/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem, openCart } = useCartStore();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then(r => r.data.data),
    enabled: !!id,
  });

  const product = data?.product;
  const recommendations = data?.recommendations || [];

  const handleAddToCart = () => {
    addItem(product, qty);
    toast.success(`${product.name} added to cart!`, { icon: '🛒' });
    openCart();
  };

  if (isLoading) return (
    <div className="page-container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="aspect-square rounded-2xl bg-gray-200 animate-pulse" />
        <div className="space-y-4">{[1,2,3,4,5].map(i=><div key={i} className="h-6 bg-gray-200 rounded animate-pulse" style={{width:`${[80,60,40,90,50][i-1]}%`}} />)}</div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="page-container py-16 text-center">
      <p className="text-gray-500">Product not found.</p>
      <Link to="/" className="btn-primary btn-sm mt-4">Back to Shop</Link>
    </div>
  );

  const discount = product.price?.mrp > product.price?.selling
    ? Math.round(((product.price.mrp - product.price.selling) / product.price.mrp) * 100) : 0;

  return (
    <div className="page-container py-8 max-w-6xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
            {product.images?.[activeImg] ? (
              <img src={product.images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Leaf className="w-16 h-16 text-gray-300" /></div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImg===i?'border-primary-500':'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            {product.isOrganic && <span className="badge-green">🌿 Organic</span>}
            <span className="badge-gray capitalize">{product.category}</span>
            {discount > 0 && <span className="badge bg-red-100 text-red-700">{discount}% OFF</span>}
          </div>

          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-primary-800">{product.name}</h1>
            {product.farmer && (
              <Link to={`/farmers/${product.farmer._id}`} className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-1 inline-flex items-center gap-1">
                🌾 {product.farmer.farmerProfile?.farmName || product.farmer.name}
              </Link>
            )}
          </div>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s<=Math.round(product.rating)?'fill-amber-400 text-amber-400':'text-gray-200'}`} />)}
              </div>
              <span className="text-sm font-semibold text-gray-700">{product.rating?.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary-700">₹{product.price?.selling}</span>
            <span className="text-gray-500">/{product.price?.unit}</span>
            {discount > 0 && <span className="text-lg text-gray-400 line-through">₹{product.price?.mrp}</span>}
          </div>

          {/* Stock */}
          <div className={`text-sm font-medium ${product.stock?.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock?.quantity > 0 ? `✓ ${product.stock.quantity} in stock` : '✗ Out of stock'}
          </div>

          {/* Qty + Add to cart */}
          {product.stock?.quantity > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                  <button onClick={() => setQty(q => Math.max(1, q-1))} className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm hover:shadow transition-all"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="w-8 text-center font-bold text-sm">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock.quantity, q+1))} className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm hover:shadow transition-all"><Plus className="w-3.5 h-3.5" /></button>
                </div>
                <span className="text-sm text-gray-500">= <strong className="text-primary-700">₹{(product.price.selling * qty).toFixed(2)}</strong></span>
              </div>
              <button onClick={handleAddToCart} className="btn-primary w-full btn-lg">
                <ShoppingCart className="w-5 h-5" /> Add {qty} to Cart
              </button>
            </div>
          )}

          {/* Delivery info */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { icon: Truck, text: 'Free delivery above ₹500', color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: Shield, text: 'Quality assured produce', color: 'text-green-600', bg: 'bg-green-50' },
            ].map(({ icon: Icon, text, color, bg }) => (
              <div key={text} className={`flex items-center gap-2 p-3 ${bg} rounded-xl`}>
                <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
                <span className={`text-xs font-medium ${color}`}>{text}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-bold text-primary-800 mb-2">About this product</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map(t => <span key={t} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 font-medium">{t}</span>)}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {product.reviews?.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-primary-800 mb-5">Customer Reviews ({product.reviewCount})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.reviews.slice(0, 4).map(r => (
              <div key={r._id} className="card card-body">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700">{r.user?.name?.[0]?.toUpperCase()}</div>
                  <span className="font-semibold text-sm">{r.user?.name}</span>
                  <div className="flex gap-0.5 ml-auto">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s<=r.rating?'fill-amber-400 text-amber-400':'text-gray-200'}`} />)}
                  </div>
                </div>
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-primary-800 mb-5">Similar Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {recommendations.slice(0, 6).map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
