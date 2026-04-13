import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Search, Menu, X, Leaf, User, Heart,
  ChevronDown, LogOut, Package, Bell, Home, LayoutGrid, Zap
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import CartDrawer from './CartDrawer';
import ProductComparison from '../customer/ProductComparison';
import toast from 'react-hot-toast';
import WhatsAppButton from './WhatsAppButton';

const NAV_LINKS = [
  { label: 'Shop All', path: '/?category=all' },
  { label: 'Vegetables', path: '/?category=vegetables' },
  { label: 'Fruits', path: '/?category=fruits' },
  { label: 'Dairy & Eggs', path: '/?category=dairy' },
  { label: 'Medicines', path: '/?category=medicine' },
  { label: 'Organic', path: '/?isOrganic=true' },
];

export default function CustomerLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { count, openCart } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef();
  const userMenuRef = useRef();

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const totalCartItems = count;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Top Bar ── */}
      <div className="bg-primary-50 text-primary-700 text-xs py-1.5 text-center hidden md:block font-medium">
        🌿 Free delivery on orders above ₹500 &nbsp;|&nbsp; Fresh from farm to your doorstep
      </div>

      {/* ── Main Navbar ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="page-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-600/20">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-primary-800 text-lg leading-tight block">AgriMarket</span>
                <span className="text-[10px] text-primary-600 font-medium -mt-1 block">Farm Fresh</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="w-px h-4 bg-gray-200 mx-2" />
              <Link
                to="/my/diagnose"
                className="flex items-center gap-2 px-4 py-2 text-sm font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all shadow-sm border border-emerald-100 animate-pulse-subtle"
              >
                <Zap className="w-4 h-4" strokeWidth={3} />
                AI Doctor
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5">
              
              {/* Search */}
              <button onClick={() => setSearchOpen(!searchOpen)} className="btn-icon">
                <Search className="w-5 h-5" />
              </button>

              {/* Cart */}
              <button
                onClick={openCart}
                className="btn-icon relative"
                aria-label={`Cart (${totalCartItems} items)`}
              >
                <ShoppingCart className="w-5 h-5" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce-gentle">
                    {totalCartItems > 9 ? '9+' : totalCartItems}
                  </span>
                )}
              </button>

              {/* Wishlist */}
              {isAuthenticated && user?.role === 'customer' && (
                <Link to="/my/wishlist" className="btn-icon hidden sm:flex">
                  <Heart className="w-5 h-5" />
                </Link>
              )}

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
                      </div>
                    )}
                    <span className="hidden sm:block max-w-[100px] truncate">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-elevated border border-gray-100 py-2 animate-fade-in">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="font-semibold text-sm text-primary-800 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      {user?.role === 'customer' && (
                        <>
                          <Link to="/my/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Home className="w-4 h-4 text-gray-400" /> My Dashboard
                          </Link>
                          <Link to="/my/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Package className="w-4 h-4 text-gray-400" /> My Orders
                          </Link>
                          <Link to="/my/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <User className="w-4 h-4 text-gray-400" /> Profile
                          </Link>
                          <Link to="/my/diagnose" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-emerald-700 font-bold hover:bg-emerald-50">
                            <Zap className="w-4 h-4 text-emerald-500" /> AI Diagnosis
                          </Link>
                        </>
                      )}
                      {user?.role === 'farmer' && (
                        <Link to="/farmer/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <LayoutGrid className="w-4 h-4 text-gray-400" /> Farmer Dashboard
                        </Link>
                      )}
                      {user?.role === 'admin' && (
                        <Link to="/admin/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <LayoutGrid className="w-4 h-4 text-gray-400" /> Admin Panel
                        </Link>
                      )}
                      <hr className="my-1 border-gray-100" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/auth/login" className="btn-secondary btn-sm hidden sm:inline-flex">Sign In</Link>
                  <Link to="/auth/register" className="btn-primary btn-sm">Join Free</Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className="btn-icon lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="pb-4 animate-slide-up">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  ref={searchRef}
                  autoFocus
                  type="text"
                  placeholder="Search for fresh vegetables, fruits, dairy..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input flex-1"
                />
                <button type="submit" className="btn-primary">Search</button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white animate-slide-up">
            <div className="page-container py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-primary-700 hover:bg-primary-50 rounded-xl"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 page-enter">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-top border-[#e5e7eb] mt-16 font-['Poppins',_sans-serif]">
        <div className="page-container py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center sm:text-left">
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-[#22c55e] rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-[#22c55e] text-xl tracking-tight">AgriMarket</span>
              </div>
              <p className="text-[15px] font-normal text-[#374151] leading-relaxed max-w-xs">
                Connecting farmers directly with customers for the freshest produce at fair prices.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-[#22c55e] font-semibold uppercase text-sm tracking-wider">Shop</h4>
              <ul className="space-y-2.5">
                {['Vegetables', 'Fruits', 'Dairy & Eggs', 'Organic Produce', 'Grains & Pulses'].map(c => (
                  <li key={c}>
                    <Link 
                      to={`/?category=${c.toLowerCase()}`} 
                      className="text-[15px] font-normal text-[#374151] hover:text-[#22c55e] transition-colors duration-300"
                    >
                      {c}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-[#22c55e] font-semibold uppercase text-sm tracking-wider">Farmers</h4>
              <ul className="space-y-2.5">
                {['Sell on AgriMarket', 'Farmer Dashboard', 'Analytics', 'Join as Farmer'].map(c => (
                  <li key={c}>
                    <Link 
                      to="/auth/register" 
                      className="text-[15px] font-normal text-[#374151] hover:text-[#22c55e] transition-colors duration-300"
                    >
                      {c}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-[#22c55e] font-semibold uppercase text-sm tracking-wider">Support</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'About Us', path: '/about' },
                  { label: 'Contact', path: '/contact' },
                  { label: 'Privacy Policy', path: '/privacy' },
                  { label: 'Terms of Service', path: '/terms' },
                  { label: 'FAQ', path: '/faq' }
                ].map(link => (
                  <li key={link.label}>
                    <Link 
                      to={link.path} 
                      className="text-[15px] font-normal text-[#374151] hover:text-[#22c55e] transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-[#e5e7eb] mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#6b7280]">
            <p className="font-normal">© 2024 AgriMarket. All rights reserved.</p>
            <p className="font-normal flex items-center gap-1.5">
              Made with 🌿 for <span className="text-[#22c55e] font-semibold">farmers</span> and <span className="text-[#22c55e] font-semibold">food lovers</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Global Overlays */}
      <CartDrawer />
      <ProductComparison />
      <WhatsAppButton />
    </div>
  );
}
