import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, BarChart2, User,
  Users, CheckSquare, Settings, Menu, X, Leaf, Bell, LogOut,
  Shield, Truck, ListTodo, ThermometerSun, Activity
} from 'lucide-react';
import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import Dropdown from './Dropdown';

const FARMER_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',   path: '/farmer/dashboard' },
  { icon: Package,         label: 'My Products', path: '/farmer/products' },
  { icon: ShoppingBag,     label: 'Orders',      path: '/farmer/orders' },
  { icon: ThermometerSun,  label: 'Soil Analysis', path: '/farmer/soil-analysis' },
  { icon: Activity,        label: 'Disease Diagnosis', path: '/farmer/diagnose' },
  { icon: BarChart2,       label: 'Analytics',   path: '/farmer/analytics' },
  { icon: User,            label: 'Profile',     path: '/farmer/profile' },
];

const ADMIN_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users,           label: 'Users',     path: '/admin/users' },
  { icon: Shield,          label: 'Farmers',   path: '/admin/farmers' },
  { icon: CheckSquare,     label: 'Products',  path: '/admin/products' },
  { icon: Truck,           label: 'Orders',    path: '/admin/orders' },
  { icon: ListTodo,        label: 'Tasks',     path: '/admin/tasks' },
];

export default function DashboardLayout({ role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = role === 'admin' ? ADMIN_NAV : FARMER_NAV;

  // Close sidebar on route change on mobile
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out');
      navigate('/');
    } catch (error) {
      toast.error('Sign out failed');
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`sidebar ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} shadow-2xl lg:shadow-none`}>
        <div className="h-16 px-6 border-b border-gray-50 flex items-center justify-between shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg shadow-primary-600/20">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl text-primary-800 tracking-tighter">AgriMarket</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-50 active:scale-90 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 no-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group
                  ${isActive 
                    ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20 active:scale-[0.98]' 
                    : 'text-gray-500 hover:bg-primary-50 hover:text-primary-700'
                  }
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-600'}`} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1 h-4 rounded-full bg-white/40" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-50 space-y-4">
          <div className="p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100 flex items-center gap-3 group cursor-default">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary-600 font-black text-xs shadow-sm border border-gray-100 group-hover:rotate-6 transition-transform">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-xs font-black text-primary-800 truncate tracking-tight">{user?.name || 'User'}</p>
               <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-0.5">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 border-2 border-transparent hover:border-rose-100 transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Access</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main h-screen flex flex-col overflow-hidden">
        {/* Responsive Header */}
        <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 z-30 shrink-0">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-11 h-11 rounded-2xl flex items-center justify-center bg-gray-50 text-gray-500 hover:bg-gray-100 active:scale-90 transition-all border border-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 sm:gap-5 ml-auto">
            
            <button className="relative w-11 h-11 rounded-2xl flex items-center justify-center bg-gray-50 bg-white dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-90 transition-all border border-gray-100 dark:border-gray-700 group">
              <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
            </button>
            
            <div className="w-px h-8 bg-gray-100 hidden sm:block" />
            
            <Dropdown
              trigger={
                <button className="flex items-center gap-3 p-1 rounded-2xl hover:bg-gray-50 transition-all active:scale-95 group border border-transparent hover:border-gray-100">
                  <div className="text-right hidden sm:block pl-2">
                    <p className="text-sm font-black text-primary-800 leading-none mb-1.5 tracking-tight">{user?.name}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] opacity-70">Verified {user?.role}</p>
                  </div>
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-primary-700 font-black text-xs lg:text-sm border-2 border-white shadow-sm group-hover:shadow-lg transition-all group-hover:-translate-y-0.5">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                </button>
              }
            >
              <div className="w-64 p-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 mb-3 bg-gray-50 rounded-[1.25rem] border border-gray-100">
                  <p className="text-sm font-black text-primary-800 tracking-tight">{user?.name}</p>
                  <p className="text-[11px] text-gray-400 font-medium truncate mt-1 opacity-80">{user?.email}</p>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  <button 
                    onClick={() => navigate(`/${user?.role}/profile`)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-all active:scale-[0.98]"
                  >
                    <User className="w-4 h-4" /> My Profile
                  </button>
                  <button 
                    onClick={() => navigate(`/${user?.role}/analytics`)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-all active:scale-[0.98]"
                  >
                    <BarChart2 className="w-4 h-4" /> Analytics Feed
                  </button>
                </div>
                <div className="my-3 border-t border-gray-50" />
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 transition-all active:scale-[0.98]"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </Dropdown>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth bg-gray-50/50">
          <div className="p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
