import { useState } from 'react';
import { User, Mail, Phone, Lock, BadgeCheck, Save, KeyRound, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function CustomerProfile() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/users/profile', form);
      updateUser(data.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      return toast.error('Please fill in both password fields');
    }
    setSavingPw(true);
    try {
      await api.patch('/users/change-password', pwForm);
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft py-10 md:py-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="page-container max-w-3xl mx-auto space-y-6">

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
          <div>
            <h1 className="text-3xl font-black text-primary-800 tracking-tighter">Account Settings</h1>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-[0.2em] mt-1">Personalize your marketplace experience</p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-2xl border border-primary-100">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-[10px] font-black text-primary-700 uppercase tracking-widest">Active Customer</span>
          </div>
        </div>

        {/* Profile Identity Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
          {/* Banner strip */}
          <div className="h-24 bg-gradient-to-r from-primary-600 via-emerald-500 to-teal-400" />
          
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
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md border-2 border-white">
                <BadgeCheck className="w-5 h-5 text-primary-500" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-primary-800 tracking-tight">{user?.name}</h2>
            <p className="text-sm text-gray-400 font-medium flex items-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5 text-primary-500" /> {user?.email}
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-8 mt-6 pt-6 border-t border-gray-100 w-full">
              <div className="text-center">
                <p className="text-xl font-black text-primary-800">12</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Verified Purchases</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1.5 justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <p className="text-xl font-black text-primary-800">Elite</p>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Member Status</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-primary-800">Premium</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Pricing Tier</p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Info Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-7">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="text-sm font-black text-primary-800 uppercase tracking-[0.15em]">Basic Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 block">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                <input
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-primary-800 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
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
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUpdateProfile}
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
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </>
              )}
            </button>
            <button
              onClick={() => setForm({ name: user?.name || '', phone: user?.phone || '' })}
              className="sm:w-auto px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 active:scale-95 transition-all"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-7">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-rose-500" />
            </div>
            <h3 className="text-sm font-black text-primary-800 uppercase tracking-[0.15em]">Security Access</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 block">Current Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-rose-500 transition-colors" />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-primary-800 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 transition-all"
                  value={pwForm.currentPassword}
                  onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 block">New Password</label>
              <div className="relative group">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-primary-800 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all"
                  value={pwForm.newPassword}
                  onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  placeholder="••••••••"
                  minLength={8}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleChangePassword}
              disabled={savingPw}
              className="sm:w-auto px-8 py-3 bg-primary-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black hover:shadow-lg hover:shadow-gray-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
            >
              {savingPw ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" /> Update Password
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

