import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { User, Mail, Lock, Eye, EyeOff, Wallet, ArrowRight, ShieldCheck, RotateCcw, CheckCircle2 } from 'lucide-react';
import { registerRequest, clearMessages } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import api from '../services/api';

// ─── OTP Input ───────────────────────────────────────────────────────────────
function OTPInput({ value, onChange }) {
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const digits = (value + '      ').slice(0, 6).split('');

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      const next = value.slice(0, i) + value.slice(i + 1);
      onChange(next);
      if (i > 0) refs[i - 1].current.focus();
    } else if (/^\d$/.test(e.key)) {
      const next = value.slice(0, i) + e.key + value.slice(i + 1);
      onChange(next.slice(0, 6).replace(/\s/g, ''));
      if (i < 5) refs[i + 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    if (pasted.length === 6) refs[5].current.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          onChange={() => {}}
          className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all outline-none bg-slate-800/80
            ${d.trim() ? 'border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'border-slate-700 text-slate-500'}
            focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20`}
        />
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, message } = useSelector(s => s.auth);

  const [step, setStep] = useState(1); // 1 = form, 2 = otp
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearMessages()); }
    if (message && step === 1) {
      dispatch(clearMessages());
      setStep(2);
      startCooldown();
    }
  }, [error, message]);

  const startCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => setResendCooldown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    dispatch(registerRequest({ name: form.name, email: form.email, password: form.password }));
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.replace(/\s/g, '').length !== 6) return toast.error('Enter the 6-digit OTP');
    setOtpLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email: form.email, otp: otp.replace(/\s/g, '') });
      if (res.data.success) {
        toast.success('Account verified! Welcome 🎉');
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        navigate('/login');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await api.post('/auth/resend-otp', { email: form.email });
      toast.success('New OTP sent!');
      setOtp('');
      startCooldown();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const pwdStrength = () => {
    const l = form.password.length;
    if (l === 0) return { level: 0, label: '', color: '' };
    if (l < 6) return { level: 1, label: 'Too short', color: 'bg-red-500' };
    if (l < 9) return { level: 2, label: 'Weak', color: 'bg-orange-500' };
    if (l < 12) return { level: 3, label: 'Good', color: 'bg-yellow-500' };
    return { level: 4, label: 'Strong', color: 'bg-green-500' };
  };
  const strength = pwdStrength();

  const inputCls = "w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all";

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-5 sm:p-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Wallet size={20} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">ExpenseTracker</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map(s => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 transition-all ${step >= s ? 'text-indigo-400' : 'text-slate-600'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                  ${step > s ? 'bg-indigo-500 border-indigo-500 text-white' : step === s ? 'border-indigo-500 text-indigo-400' : 'border-slate-700 text-slate-600'}`}>
                  {step > s ? <CheckCircle2 size={14} /> : s}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s === 1 ? 'Your Details' : 'Verify OTP'}</span>
              </div>
              {s < 2 && <div className={`flex-1 h-px transition-all ${step > s ? 'bg-indigo-500' : 'bg-slate-800'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* ── STEP 1: Registration Form ── */}
        {step === 1 && (
          <>
            <h2 className="text-white text-2xl sm:text-3xl font-bold mb-1">Create account</h2>
            <p className="text-slate-400 text-sm mb-8">Start tracking your finances today</p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" placeholder="Your full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={`${inputCls} pl-10`} required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={`${inputCls} pl-10`} required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type={showPwd ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={`${inputCls} pl-10 pr-10`} required />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength.level >= i ? strength.color : 'bg-slate-800'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">{strength.label} password</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} className={`${inputCls} pl-10`} required />
                  {form.confirmPassword && (
                    <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${form.password === form.confirmPassword ? 'bg-green-400' : 'bg-red-400'}`} />
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending OTP...</>
                  : <>Continue <ArrowRight size={15} /></>}
              </button>
            </form>

            <p className="text-center text-slate-400 text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</Link>
            </p>
          </>
        )}

        {/* ── STEP 2: OTP Verification ── */}
        {step === 2 && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-5">
              <ShieldCheck size={30} className="text-indigo-400" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Check your inbox</h2>
            <p className="text-slate-400 text-sm mb-1">We sent a 6-digit OTP to</p>
            <p className="text-indigo-400 font-semibold text-sm mb-8">{form.email}</p>

            <form onSubmit={handleVerifyOTP} className="space-y-6 text-left">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-4 text-center">Enter OTP</label>
                <OTPInput value={otp} onChange={setOtp} />
              </div>

              <button type="submit" disabled={otpLoading || otp.replace(/\s/g, '').length !== 6}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                {otpLoading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
                  : <><CheckCircle2 size={15} /> Verify & Create Account</>}
              </button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-3">
              <button onClick={handleResend} disabled={resendCooldown > 0}
                className={`flex items-center gap-2 text-sm font-medium transition-all ${resendCooldown > 0 ? 'text-slate-600 cursor-not-allowed' : 'text-indigo-400 hover:text-indigo-300'}`}>
                <RotateCcw size={13} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
              </button>
              <button onClick={() => { setStep(1); setOtp(''); }} className="text-slate-500 hover:text-slate-400 text-xs transition-colors">
                ← Change email address
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
