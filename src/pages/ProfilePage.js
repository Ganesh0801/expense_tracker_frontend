import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Mail, Smartphone, Lock, Save, Eye, EyeOff, Shield, Settings, KeyRound } from 'lucide-react';
import { updateUserProfile } from '../store/slices/authSlice';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);

  const [profile, setProfile] = useState({ name: user?.name || '', upiId: user?.upiId || '', currency: user?.currency || '₹' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await userAPI.updateProfile(profile);
      dispatch(updateUserProfile(profile));
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSavingProfile(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('New passwords do not match');
    if (passwords.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPassword(true);
    try {
      await userAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPassword(false); }
  };

  const inputCls = "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all";
  const labelCls = "block text-xs font-medium text-slate-400 mb-1.5";

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6 pb-6 max-w-2xl mx-auto">
      {/* Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-indigo-500/30 flex-shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">{user?.name}</h2>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <span className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 bg-green-500/15 text-green-400 rounded-full text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Verified Account
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-2xl p-1.5">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}>
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2"><User size={16} className="text-indigo-400" /> Personal Information</h3>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className={labelCls}>Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className={`${inputCls} pl-9`} placeholder="Your name" required />
              </div>
            </div>
            <div>
              <label className={labelCls}>Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" value={user?.email} disabled className={`${inputCls} pl-9 opacity-50 cursor-not-allowed`} />
              </div>
              <p className="text-slate-500 text-xs mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className={labelCls}>UPI ID</label>
              <div className="relative">
                <Smartphone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" value={profile.upiId} onChange={e => setProfile(p => ({ ...p, upiId: e.target.value }))} className={`${inputCls} pl-9`} placeholder="yourname@upi" />
              </div>
              <p className="text-slate-500 text-xs mt-1">Used for UPI transactions tracking</p>
            </div>
            <button type="submit" disabled={savingProfile} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20">
              <Save size={15} /> {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2"><KeyRound size={16} className="text-indigo-400" /> Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              { key: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
              { key: 'newPassword', label: 'New Password', placeholder: 'Enter new password (min 6 chars)' },
              { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Confirm your new password' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPwd[key.replace('Password', '').replace('current','current').replace('new','new').replace('confirm','confirm')] ? 'text' : 'password'}
                    value={passwords[key]}
                    onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                    className={`${inputCls} pl-9 pr-10`} placeholder={placeholder} required
                  />
                  <button type="button" onClick={() => {
                    const k = key === 'currentPassword' ? 'current' : key === 'newPassword' ? 'new' : 'confirm';
                    setShowPwd(p => ({ ...p, [k]: !p[k] }));
                  }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPwd[key === 'currentPassword' ? 'current' : key === 'newPassword' ? 'new' : 'confirm'] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" disabled={savingPassword} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20">
              <Shield size={15} /> {savingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2"><Settings size={16} className="text-indigo-400" /> Preferences</h3>
          <div>
            <label className={labelCls}>Currency Symbol</label>
            <select value={profile.currency} onChange={e => setProfile(p => ({ ...p, currency: e.target.value }))} className={inputCls}>
              <option value="₹">₹ Indian Rupee (INR)</option>
              <option value="$">$ US Dollar (USD)</option>
              <option value="€">€ Euro (EUR)</option>
              <option value="£">£ British Pound (GBP)</option>
            </select>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-3">
            <p className="text-white text-xs font-semibold">Account Info</p>
            {[['Member Since', new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN')], ['Account Status', 'Verified ✓'], ['Email Reports', 'Monthly PDF on last day']].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-slate-400">{k}</span>
                <span className="text-slate-200 font-medium">{v}</span>
              </div>
            ))}
          </div>
          <button onClick={handleSaveProfile} disabled={savingProfile} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50">
            <Save size={15} /> {savingProfile ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  );
}
