import { Heart, ShoppingCart, Star, Leaf, Eye, ArrowRightLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import useCompareStore from '../../store/compareStore';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function ProductCard({ product, onWishlistChange, onQuickView }) {
  const { addItem, openCart } = useCartStore();
  const { addItem: addToCompare, items: compareItems } = useCompareStore();
  const { isAuthenticated, user } = useAuthStore();
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  const discount = product.price?.mrp && product.price?.mrp > product.price?.selling
    ? Math.round(((product.price.mrp - product.price.selling) / product.price.mrp) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingToCart(true);
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
    });
    setTimeout(() => setAddingToCart(false), 600);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please sign in to save wishlist');
      return;
    }
    try {
      await api.post(`/users/wishlist/${product._id}`);
      setWishlisted(!wishlisted);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
      onWishlistChange?.();
    } catch (e) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const success = addToCompare(product);
    if (!success) {
      if (compareItems.find(i => i._id === product._id)) {
        toast.error('Already in comparison');
      } else {
        toast.error('Maximum 3 items for comparison');
      }
    } else {
      toast.success('Added to comparison');
    }
  };

  return (
    <Link to={`/products/${product._id}`} className="product-card block">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-100 aspect-square">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="product-card-img"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Leaf className="w-12 h-12 text-gray-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isOrganic && (
            <span className="badge-green text-[10px] px-2 py-0.5 font-bold">🌿 Organic</span>
          )}
          {discount > 0 && (
            <span className="badge bg-red-500 text-white text-[10px] px-2 py-0.5 font-bold">{discount}% OFF</span>
          )}
          {product.stock?.quantity <= 5 && product.stock?.quantity > 0 && (
            <span className="badge-orange text-[10px] px-2 py-0.5">Only {product.stock.quantity} left!</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm hover:bg-white"
        >
          <Heart className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
        </button>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex flex-col items-center justify-center gap-2">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 flex flex-col gap-2">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onQuickView) onQuickView();
              }}
              className="flex items-center gap-1.5 bg-white/95 bg-white dark:bg-gray-800/95 backdrop-blur-sm px-2 py-1.5 rounded-full shadow hover:bg-white dark:hover:bg-gray-700 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
              <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">Quick view</span>
            </button>
            <button 
              onClick={handleCompare}
              className="flex items-center gap-1.5 bg-white/95 bg-white dark:bg-gray-800/95 backdrop-blur-sm px-2 py-1.5 rounded-full shadow hover:bg-white hover:text-white transition-all transform hover:scale-105"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold dark:text-gray-200 uppercase tracking-tight">Compare</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        {/* Farmer */}
        {product.farmer && (
          <p className="text-[11px] text-gray-400 font-medium mb-1 truncate">
            {product.farmer?.farmerProfile?.farmName || product.farmer?.name}
          </p>
        )}

        {/* Name */}
        <h3 className="font-semibold text-sm text-primary-800 leading-snug line-clamp-2 mb-1.5">
          {product.name}
        </h3>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-gray-700">{product.rating?.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({product.reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto mb-2.5">
          <span className="text-base font-bold text-primary-700 dark:text-primary-400">
            ₹{product.price?.selling}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">/{product.price?.unit}</span>
          {discount > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-600 line-through">₹{product.price?.mrp}</span>
          )}
        </div>

        {/* Add to Cart */}
        {product.stock?.quantity > 0 ? (
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="btn-primary w-full btn-sm"
          >
            {addingToCart ? (
              <span className="spinner w-4 h-4 border-white/40 border-t-white" />
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                Add to Cart
              </>
            )}
          </button>
        ) : (
          <button disabled className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-gray-100 text-gray-400 cursor-not-allowed">
            Out of Stock
          </button>
        )}
      </div>
    </Link>
  );
}
