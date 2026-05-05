import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Lock, Eye, EyeOff, Wallet, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { resetPasswordRequest, clearMessages } from '../store/slices/authSlice';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();
  const { loading, error, message } = useSelector(s => s.auth);
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearMessages()); }
    if (message) { setDone(true); dispatch(clearMessages()); setTimeout(() => navigate('/login'), 2500); }
  }, [error, message, dispatch, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    dispatch(resetPasswordRequest({ token, password: form.password }));
  };

  const inputCls = "w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all";

  if (done) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-5">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-400" />
        </div>
        <h2 className="text-white text-xl font-bold mb-2">Password Reset!</h2>
        <p className="text-slate-400 text-sm">Your password has been reset successfully. Redirecting to login...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
            <Wallet size={20} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl">ExpenseTracker</span>
        </div>
        <h2 className="text-white text-2xl sm:text-3xl font-bold mb-1">Reset password</h2>
        <p className="text-slate-400 text-sm mb-8">Enter your new password below.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {['password','confirmPassword'].map((key) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{key === 'password' ? 'New Password' : 'Confirm Password'}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={showPwd ? 'text' : 'password'} placeholder={key === 'password' ? 'Min. 6 characters' : 'Re-enter password'} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className={`${inputCls} pl-10 pr-10`} required />
                {key === 'password' && (
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50">
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Resetting...</> : 'Reset Password'}
          </button>
        </form>
        <div className="text-center mt-6">
          <Link to="/login" className="flex items-center justify-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"><ArrowLeft size={15} /> Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
