import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import api from './services/api';
import { useEffect } from 'react';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Customer Pages
import StorefrontPage from './pages/customer/StorefrontPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerOrders from './pages/customer/CustomerOrders';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import WishlistPage from './pages/customer/WishlistPage';
import SubscriptionsPage from './pages/customer/SubscriptionsPage';
import CustomerProfile from './pages/customer/CustomerProfile';
import DiseaseDetection from './pages/customer/DiseaseDetection';

// Farmer Pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerProducts from './pages/farmer/FarmerProducts';
import AddProductPage from './pages/farmer/AddProductPage';
import FarmerOrders from './pages/farmer/FarmerOrders';
import FarmerAnalytics from './pages/farmer/FarmerAnalytics';
import FarmerProfile from './pages/farmer/FarmerProfile';
import SoilAnalysisPage from './pages/farmer/SoilAnalysisPage';
import PublicFarmerProfile from './pages/customer/PublicFarmerProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminFarmers from './pages/admin/AdminFarmers';
import AdminTasks from './pages/admin/AdminTasks';
import InfoPage from './pages/common/InfoPage';

// Layout
import CustomerLayout from './components/common/CustomerLayout';
import DashboardLayout from './components/common/DashboardLayout';

// Route guards
const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    const redirectMap = { farmer: '/farmer/dashboard', admin: '/admin/dashboard', customer: '/' };
    return <Navigate to={redirectMap[user?.role] || '/'} replace />;
  }
  return children;
};

function App() {
  const { accessToken, setToken } = useAuthStore();

  // Restore auth header on mount
  useEffect(() => {
    if (accessToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }
  }, [accessToken]);

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public Auth ── */}
        <Route path="/auth/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/auth/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

        {/* ── Customer / Public Store ── */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<StorefrontPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/farmers/:id" element={<PublicFarmerProfile />} />
          <Route path="/checkout" element={<PrivateRoute roles={['customer']}><CheckoutPage /></PrivateRoute>} />
          <Route path="/my/dashboard" element={<PrivateRoute roles={['customer']}><CustomerDashboard /></PrivateRoute>} />
          <Route path="/my/orders" element={<PrivateRoute roles={['customer']}><CustomerOrders /></PrivateRoute>} />
          <Route path="/my/orders/:id" element={<PrivateRoute roles={['customer']}><OrderDetailPage /></PrivateRoute>} />
          <Route path="/my/wishlist" element={<PrivateRoute roles={['customer']}><WishlistPage /></PrivateRoute>} />
          <Route path="/my/subscriptions" element={<PrivateRoute roles={['customer']}><SubscriptionsPage /></PrivateRoute>} />
          <Route path="/my/profile" element={<PrivateRoute roles={['customer']}><CustomerProfile /></PrivateRoute>} />
          <Route path="/my/diagnose" element={<PrivateRoute roles={['customer']}><DiseaseDetection /></PrivateRoute>} />
          
          {/* Informational Pages */}
          <Route path="/about" element={<InfoPage />} />
          <Route path="/contact" element={<InfoPage />} />
          <Route path="/faq" element={<InfoPage />} />
          <Route path="/privacy" element={<InfoPage />} />
          <Route path="/terms" element={<InfoPage />} />
        </Route>

        {/* ── Farmer Dashboard ── */}
        <Route path="/farmer" element={<PrivateRoute roles={['farmer']}><DashboardLayout role="farmer" /></PrivateRoute>}>
          <Route index element={<Navigate to="/farmer/dashboard" replace />} />
          <Route path="dashboard" element={<FarmerDashboard />} />
          <Route path="products" element={<FarmerProducts />} />
          <Route path="products/add" element={<AddProductPage />} />
          <Route path="products/edit/:id" element={<AddProductPage editMode />} />
          <Route path="orders" element={<FarmerOrders />} />
          <Route path="analytics" element={<FarmerAnalytics />} />
          <Route path="soil-analysis" element={<SoilAnalysisPage />} />
          <Route path="diagnose" element={<DiseaseDetection />} />
          <Route path="profile" element={<FarmerProfile />} />
        </Route>

        {/* ── Admin Dashboard ── */}
        <Route path="/admin" element={<PrivateRoute roles={['admin']}><DashboardLayout role="admin" /></PrivateRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="farmers" element={<AdminFarmers />} />
          <Route path="tasks" element={<AdminTasks />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
