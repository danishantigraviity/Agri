import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight, Leaf } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const delivery = subtotal >= 500 ? 0 : 50;
  const total = subtotal + delivery;

  const handleCheckout = () => {
    closeCart();
    if (!isAuthenticated || user?.role !== 'customer') {
      navigate('/auth/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="overlay" onClick={closeCart} />
      )}

      {/* Drawer */}
      <div className={`cart-drawer ${isOpen ? 'open' : 'closed'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary-600" />
            <h2 className="font-bold text-primary-800">Your Cart</h2>
            {items.length > 0 && (
              <span className="badge-green ml-1">{items.length} items</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-700 font-medium">
                Clear all
              </button>
            )}
            <button onClick={closeCart} className="btn-icon">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="empty-state px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-semibold text-gray-700 mb-1">Your cart is empty</p>
              <p className="text-sm text-gray-500 mb-5">Add some fresh produce to get started!</p>
              <button onClick={closeCart} className="btn-primary btn-sm">
                <Leaf className="w-4 h-4" /> Browse Products
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Leaf className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-primary-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">₹{item.price}/{item.unit}</p>
                    <p className="text-xs text-primary-700 font-semibold mt-1">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>

                    {/* Quantity Control */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 self-start"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary + Checkout */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-5 bg-white">
            {/* Delivery note */}
            {subtotal < 500 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                <p className="text-xs text-amber-700 font-medium">
                  🚚 Add ₹{(500 - subtotal).toFixed(0)} more for free delivery!
                </p>
                <div className="w-full bg-amber-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min((subtotal / 500) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
            {subtotal >= 500 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                <p className="text-xs text-green-700 font-medium">✓ You've unlocked free delivery!</p>
              </div>
            )}

            {/* Price breakdown */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span className={delivery === 0 ? 'text-green-600 font-medium' : ''}>
                  {delivery === 0 ? 'FREE' : `₹${delivery}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-primary-800 border-t border-gray-100 pt-2 mt-2">
                <span>Total</span>
                <span className="text-primary-700">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={handleCheckout} className="btn-primary w-full btn-lg">
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={closeCart} className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-3 py-1">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
