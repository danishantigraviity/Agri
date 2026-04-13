import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Leaf, Lock, Mail, User, Phone, AlertCircle, Check } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'customer', label: 'Customer', emoji: '🛒', desc: 'Buy fresh produce directly from farmers' },
  { value: 'farmer',   label: 'Farmer',   emoji: '🌾', desc: 'Sell your produce to thousands of customers' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'customer' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = () => {
    const p = form.password;
    let strength = 0;
    if (p.length >= 8) strength++;
    if (/[A-Z]/.test(p)) strength++;
    if (/[a-z]/.test(p)) strength++;
    if (/\d/.test(p)) strength++;
    return strength;
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    try {
      const result = await register(form);
      toast.success('Account created! Welcome to AgriMarket 🌿');
      const roleMap = { farmer: '/farmer/dashboard', customer: '/' };
      navigate(roleMap[result.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  const ps = passwordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-earth-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="card p-8">
          {/* Logo */}
          <div className="text-center mb-7">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-600/20">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-primary-800">AgriMarket</span>
            </Link>
            <h1 className="text-2xl font-bold text-primary-800 mb-1">Create your account</h1>
            <p className="text-gray-500 text-sm">Join thousands of farmers and customers</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ROLES.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, role: role.value }))}
                className={`p-3.5 rounded-xl border-2 text-left transition-all
                  ${form.role === role.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
              >
                <span className="text-xl mb-1 block">{role.emoji}</span>
                <p className="font-semibold text-sm text-primary-800">{role.label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{role.desc}</p>
                {form.role === role.value && (
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center mt-1.5">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name"
                  required
                  className="input pl-10"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  required
                  className="input pl-10"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="10-digit mobile number"
                  pattern="[6-9][0-9]{9}"
                  className="input pl-10"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className="input pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength indicator */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div key={level} className={`flex-1 h-1.5 rounded-full transition-colors ${ps >= level ? strengthColor[ps] : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs ${ps <= 1 ? 'text-red-500' : ps === 2 ? 'text-yellow-600' : ps === 3 ? 'text-blue-600' : 'text-green-600'}`}>
                    {strengthLabel[ps]} password
                  </p>
                </div>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full btn-lg mt-2">
              {isLoading ? (
                <><span className="spinner border-white/40 border-t-white" /> Creating account...</>
              ) : (
                `Create ${form.role === 'farmer' ? 'Farmer' : 'Customer'} Account`
              )}
            </button>
          </form>

          {form.role === 'farmer' && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
              ⏳ Farmer accounts require admin approval before listing products. You'll be notified once approved.
            </p>
          )}

          <p className="text-center text-sm text-gray-600 mt-5">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-primary-600 hover:text-primary-700 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
