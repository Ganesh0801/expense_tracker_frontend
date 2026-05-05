// ForgotPasswordPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, ArrowLeft, Wallet, Send } from 'lucide-react';
import { forgotPasswordRequest, clearMessages } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

export function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector(s => s.auth);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearMessages()); }
    if (message) { setSent(true); dispatch(clearMessages()); }
  }, [error, message, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(forgotPasswordRequest(email));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Wallet size={20} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl">ExpenseTracker</span>
        </div>

        {sent ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-500/15 flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-indigo-400" />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">Check your email</h2>
            <p className="text-slate-400 text-sm mb-6">We sent a reset link to <span className="text-indigo-400 font-medium">{email}</span>. The link expires in 10 minutes.</p>
            <Link to="/login" className="flex items-center justify-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
              <ArrowLeft size={15} /> Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-white text-2xl sm:text-3xl font-bold mb-1">Forgot password?</h2>
            <p className="text-slate-400 text-sm mb-8">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" required />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50">
                {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</> : <><Send size={15} /> Send Reset Link</>}
              </button>
            </form>
            <div className="text-center mt-6">
              <Link to="/login" className="flex items-center justify-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
                <ArrowLeft size={15} /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
