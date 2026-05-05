import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Wallet } from 'lucide-react';
import { authAPI } from '../services/api';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    authAPI.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-5">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center">
        <div className="flex items-center gap-3 justify-center mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
            <Wallet size={20} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl">ExpenseTracker</span>
        </div>

        {status === 'loading' && (
          <>
            <div className="w-16 h-16 rounded-full bg-indigo-500/15 flex items-center justify-center mx-auto mb-4">
              <Loader size={28} className="text-indigo-400 animate-spin" />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">Verifying your email...</h2>
            <p className="text-slate-400 text-sm">Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">Email Verified!</h2>
            <p className="text-slate-400 text-sm mb-6">Your account has been verified. You can now log in.</p>
            <Link to="/login" className="block w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold text-center transition-all">Go to Login</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-400" />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">Verification Failed</h2>
            <p className="text-slate-400 text-sm mb-6">This link is invalid or has expired. Please register again.</p>
            <Link to="/register" className="block w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold text-center transition-all">Register Again</Link>
          </>
        )}
      </div>
    </div>
  );
}
