import { useState } from 'react';
import { User, Phone, Home, MapPin, ShieldCheck, Timer, BadgeCheck, Mail, Save } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

export default function FarmerProfile() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ 
    name: user?.name || '', 
    phone: user?.phone || '', 
    'farmerProfile.farmName': user?.farmerProfile?.farmName || '', 
    'farmerProfile.farmLocation': user?.farmerProfile?.farmLocation || '' 
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/farmers/profile', {
        name: form.name,
        phone: form.phone,
        farmerProfile: {
          farmName: form['farmerProfile.farmName'],
          farmLocation: form['farmerProfile.farmLocation']
        }
      });
      updateUser(data.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const isApproved = user?.farmerProfile?.isApproved;

  return (
    <div className="min-h-screen bg-gradient-soft py-10 md:py-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="page-container max-w-3xl mx-auto space-y-6">

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
          <div>
            <h1 className="text-3xl font-black text-primary-800 tracking-tighter">Farmer Profile</h1>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-[0.2em] mt-1">Manage your agricultural identity</p>
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest
            ${isApproved 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
            {isApproved ? <ShieldCheck className="w-4 h-4" /> : <Timer className="w-4 h-4" />}
            {isApproved ? 'Verified Merchant' : 'Verification Pending'}
          </div>
        </div>

        {/* Profile Identity Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
          {/* Compact banner strip */}
          <div className={`h-24 ${isApproved 
            ? 'bg-gradient-to-r from-emerald-600 via-primary-500 to-teal-400' 
            : 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300'}`} />

          {/* Avatar + Info */}
          <div className="flex flex-col items-center text-center px-8 pb-8 -mt-12">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center text-3xl font-black text-primary-600 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.[0]?.toUpperCase()
                )}
              </div>
              {isApproved && (
                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md border-2 border-white">
                  <BadgeCheck className="w-5 h-5 text-emerald-500" />
                </div>
              )}
            </div>

            <h2 className="text-2xl font-black text-primary-800 tracking-tight">{user?.name}</h2>
            <p className="text-sm text-gray-400 font-medium flex items-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5 text-primary-500" /> {user?.email}
            </p>
            {user?.farmerProfile?.farmName && (
              <p className="text-xs text-primary-600 font-bold flex items-center gap-1.5 mt-1">
                <Home className="w-3 h-3" /> {user.farmerProfile.farmName}
              </p>
            )}

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-8 mt-6 pt-6 border-t border-gray-100 w-full">
              <div className="text-center">
                <p className="text-xl font-black text-primary-800">{user?.farmerProfile?.rating || '5.0'}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Merchant Rating</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1.5 justify-center">
                  <ShieldCheck className={`w-4 h-4 ${isApproved ? 'text-emerald-500' : 'text-amber-500'}`} />
                  <p className="text-xl font-black text-primary-800">{isApproved ? 'Active' : 'Pending'}</p>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Storefront Status</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-primary-800">Full</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Market Access</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-7">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="text-sm font-black text-primary-800 uppercase tracking-[0.15em]">Profile Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 block">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                <input
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-primary-800 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 block">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                <input
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-primary-800 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 block">Farm Name</label>
              <div className="relative group">
                <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                <input
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-primary-800 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all"
                  value={form['farmerProfile.farmName']}
                  onChange={e => setForm(f => ({ ...f, 'farmerProfile.farmName': e.target.value }))}
                  placeholder="Enter farm name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 block">Farm Location</label>
              <div className="relative group">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                <input
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-primary-800 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all"
                  value={form['farmerProfile.farmLocation']}
                  onChange={e => setForm(f => ({ ...f, 'farmerProfile.farmLocation': e.target.value }))}
                  placeholder="Enter farm location"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="sm:w-auto px-8 py-3 bg-primary-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 hover:shadow-lg hover:shadow-primary-400/30 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Save Professional Details
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

