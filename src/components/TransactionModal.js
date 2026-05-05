import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, TrendingUp, TrendingDown, Smartphone, Banknote, CreditCard, Building2, HelpCircle, ChevronDown, Tag, FileText, Hash, Calendar } from 'lucide-react';
import { addRequest } from '../store/slices/transactionSlice';
import toast from 'react-hot-toast';

const EXPENSE_CATEGORIES = ['Food & Dining','Transport','Shopping','Entertainment','Health','Bills & Utilities','Education','Travel','Groceries','Loan','Borrowed','Interest Amount','Other'];
const EARNING_CATEGORIES = ['Salary','Freelance','Business','Investment','Gift','Rental','UPI Received','Bonus','Other'];
const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'upi', label: 'UPI', icon: Smartphone },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'bank', label: 'Bank', icon: Building2 },
  { value: 'other', label: 'Other', icon: HelpCircle },
];

export default function TransactionModal({ type: initialType, onClose }) {
  const dispatch = useDispatch();
  const { submitting } = useSelector(s => s.transactions);
  const [type, setType] = useState(initialType);
  const isExpense = type === 'expense';
  const amountRef = useRef();

  const [form, setForm] = useState({
    category: '', reason: '', amount: '', date: new Date().toISOString().split('T')[0],
    itemCount: 1, sourceDetails: '', paymentMode: 'cash',
    upiId: '', upiTransactionId: '', notes: '', tags: ''
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setTimeout(() => amountRef.current?.focus(), 100);
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // reset category on type switch
  useEffect(() => { set('category', ''); }, [type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) return toast.error('Enter a valid amount');
    if (!form.category) return toast.error('Select a category');
    if (!form.reason.trim()) return toast.error('Enter a reason');
    const payload = {
      ...form, type, amount: Number(form.amount), itemCount: Number(form.itemCount),
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      upiDirection: form.paymentMode === 'upi' ? (isExpense ? 'sent' : 'received') : 'na'
    };
    dispatch(addRequest(payload));
    toast.success(`${isExpense ? 'Expense' : 'Earning'} added!`);
    onClose();
  };

  const inputCls = "w-full bg-slate-800/60 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all";
  const labelCls = "flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className={`bg-slate-900 w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl border border-slate-700/60 shadow-2xl overflow-hidden transition-all
        max-h-[92vh] sm:max-h-[90vh] flex flex-col`}
        style={{ boxShadow: isExpense ? '0 0 60px rgba(239,68,68,0.08)' : '0 0 60px rgba(34,197,94,0.08)' }}>

        {/* ── Type Toggle Header ── */}
        <div className="flex-shrink-0 p-1.5 bg-slate-800/50 border-b border-slate-700/50">
          <div className="flex rounded-xl overflow-hidden bg-slate-800 p-1 gap-1">
            <button type="button" onClick={() => setType('earning')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                ${!isExpense ? 'bg-green-600 text-white shadow-lg shadow-green-500/20' : 'text-slate-400 hover:text-slate-300'}`}>
              <TrendingUp size={15} /> Earning
            </button>
            <button type="button" onClick={() => setType('expense')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                ${isExpense ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'text-slate-400 hover:text-slate-300'}`}>
              <TrendingDown size={15} /> Expense
            </button>
          </div>
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-slate-700/60 hover:bg-slate-600 text-slate-400 hover:text-white transition-all">
            <X size={15} />
          </button>
        </div>

        {/* ── Amount Hero ── */}
        <div className={`flex-shrink-0 px-6 py-5 text-center border-b border-slate-800/80 relative overflow-hidden
          ${isExpense ? 'bg-gradient-to-b from-red-500/5 to-transparent' : 'bg-gradient-to-b from-green-500/5 to-transparent'}`}>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-2">
            {isExpense ? 'Amount Spent' : 'Amount Earned'}
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className={`text-3xl font-black ${isExpense ? 'text-red-400' : 'text-green-400'}`}>₹</span>
            <input
              ref={amountRef}
              type="number"
              placeholder="0.00"
              min="0.01" step="0.01"
              value={form.amount}
              onChange={e => set('amount', e.target.value)}
              className={`bg-transparent text-4xl font-black w-48 text-center outline-none placeholder-slate-700 transition-colors
                ${isExpense ? 'text-red-400' : 'text-green-400'}`}
            />
          </div>
          {form.amount && (
            <p className="text-slate-500 text-xs mt-1">
              {isExpense ? '−' : '+'} ₹{Number(form.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {/* ── Form Fields ── */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">

            {/* Category */}
            <div>
              <label className={labelCls}><Tag size={12} /> Category *</label>
              <div className="relative">
                <select value={form.category} onChange={e => set('category', e.target.value)} className={`${inputCls} appearance-none pr-9 cursor-pointer`} required>
                  <option value="">Select category...</option>
                  {(isExpense ? EXPENSE_CATEGORIES : EARNING_CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className={labelCls}><FileText size={12} /> {isExpense ? 'What did you spend on?' : 'Source of Income'} *</label>
              <input type="text"
                placeholder={isExpense ? 'e.g. Groceries for the week' : 'e.g. Monthly salary'}
                value={form.reason} onChange={e => set('reason', e.target.value)}
                className={inputCls} required />
            </div>

            {/* Date + Item count row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}><Calendar size={12} /> Date *</label>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} required />
              </div>
              {isExpense ? (
                <div>
                  <label className={labelCls}><Hash size={12} /> Items</label>
                  <input type="number" min="1" value={form.itemCount} onChange={e => set('itemCount', e.target.value)} className={inputCls} />
                </div>
              ) : (
                <div>
                  <label className={labelCls}><FileText size={12} /> From / Client</label>
                  <input type="text" placeholder="Company or client" value={form.sourceDetails} onChange={e => set('sourceDetails', e.target.value)} className={inputCls} />
                </div>
              )}
            </div>

            {/* Payment Mode */}
            <div>
              <label className={labelCls}>Payment Mode</label>
              <div className="grid grid-cols-5 gap-2">
                {PAYMENT_MODES.map(({ value, label, icon: Icon }) => (
                  <button key={value} type="button" onClick={() => set('paymentMode', value)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all
                      ${form.paymentMode === value
                        ? `${isExpense ? 'bg-red-600 border-red-500 shadow-lg shadow-red-500/20' : 'bg-green-600 border-green-500 shadow-lg shadow-green-500/20'} text-white`
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'}`}>
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* UPI fields */}
            {form.paymentMode === 'upi' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                <div>
                  <label className={labelCls}>UPI ID</label>
                  <input type="text" placeholder="user@upi" value={form.upiId} onChange={e => set('upiId', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Transaction ID</label>
                  <input type="text" placeholder="TXN123..." value={form.upiTransactionId} onChange={e => set('upiTransactionId', e.target.value)} className={inputCls} />
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className={labelCls}><FileText size={12} /> Notes</label>
              <textarea rows={2} placeholder="Any additional notes..." value={form.notes} onChange={e => set('notes', e.target.value)} className={`${inputCls} resize-none`} />
            </div>

            {/* Tags */}
            <div>
              <label className={labelCls}><Tag size={12} /> Tags (comma separated)</label>
              <input type="text" placeholder="e.g. work, personal, urgent" value={form.tags} onChange={e => set('tags', e.target.value)} className={inputCls} />
              {form.tags && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.tags.split(',').map(t => t.trim()).filter(Boolean).map((tag, i) => (
                    <span key={i} className="px-2.5 py-0.5 bg-slate-700/60 border border-slate-600/50 text-slate-300 text-xs rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Submit ── */}
          <div className="flex-shrink-0 p-5 pt-0 border-t border-slate-800/50">
            <button type="submit" disabled={submitting}
              className={`w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all flex items-center justify-center gap-2
                ${isExpense
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-500/20'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-500/20'}
                disabled:opacity-50 disabled:cursor-not-allowed`}>
              {submitting
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                : <>{isExpense ? <TrendingDown size={16} /> : <TrendingUp size={16} />} Save {isExpense ? 'Expense' : 'Earning'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
