import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Plus, Minus, Smartphone, Banknote, CreditCard, Building2, HelpCircle } from 'lucide-react';
import { addRequest } from '../store/slices/transactionSlice';
import toast from 'react-hot-toast';

const EXPENSE_CATEGORIES = ['Food & Dining', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Bills & Utilities', 'Education', 'Travel', 'Groceries','Loan','Borrowed','Interest Amount','Other'];
const EARNING_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Rental', 'UPI Received', 'Bonus', 'Other'];
const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'upi', label: 'UPI', icon: Smartphone },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'bank', label: 'Bank', icon: Building2 },
  { value: 'other', label: 'Other', icon: HelpCircle },
];

export default function TransactionModal({ type, onClose }) {
  const dispatch = useDispatch();
  const { submitting } = useSelector(s => s.transactions);
  const isExpense = type === 'expense';

  const [form, setForm] = useState({
    type, category: '', reason: '', amount: '', date: new Date().toISOString().split('T')[0],
    itemCount: 1, source: '', sourceDetails: '', paymentMode: 'cash',
    upiId: '', upiTransactionId: '', upiDirection: 'na', notes: '', tags: ''
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) return toast.error('Enter a valid amount');
    if (!form.category) return toast.error('Select a category');
    if (!form.reason.trim()) return toast.error('Enter a reason');

    const payload = {
      ...form, amount: Number(form.amount), itemCount: Number(form.itemCount),
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      upiDirection: form.paymentMode === 'upi' ? (isExpense ? 'sent' : 'received') : 'na'
    };
    dispatch(addRequest(payload));
    toast.success(`${isExpense ? 'Expense' : 'Earning'} added!`);
    onClose();
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const inputCls = "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all";
  const labelCls = "block text-xs font-medium text-slate-400 mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b border-slate-800 ${isExpense ? 'bg-red-500/5' : 'bg-green-500/5'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isExpense ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
              {isExpense ? <Minus size={18} className="text-red-400" /> : <Plus size={18} className="text-green-400" />}
            </div>
            <div>
              <h2 className="text-white font-bold text-base">{isExpense ? 'Add Expense' : 'Add Earning'}</h2>
              <p className="text-slate-400 text-xs">{isExpense ? 'Track your spending' : 'Record your income'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-all"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Amount */}
          <div>
            <label className={labelCls}>Amount (₹) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input type="number" placeholder="0.00" min="0.01" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)}
                className={`${inputCls} pl-8 text-xl font-bold ${isExpense ? 'text-red-400 focus:border-red-500 focus:ring-red-500' : 'text-green-400 focus:border-green-500 focus:ring-green-500'}`} required />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={labelCls}>Category *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls} required>
              <option value="">Select category</option>
              {(isExpense ? EXPENSE_CATEGORIES : EARNING_CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className={labelCls}>{isExpense ? 'Reason / What did you buy?' : 'Source of Income'} *</label>
            <input type="text" placeholder={isExpense ? "e.g. Bought groceries for the week" : "e.g. Monthly salary from company"} value={form.reason} onChange={e => set('reason', e.target.value)} className={inputCls} required />
          </div>

          {/* Expense specific: item count */}
          {isExpense && (
            <div>
              <label className={labelCls}>Number of Items</label>
              <input type="number" min="1" value={form.itemCount} onChange={e => set('itemCount', e.target.value)} className={inputCls} />
            </div>
          )}

          {/* Earning specific: source details */}
          {!isExpense && (
            <div>
              <label className={labelCls}>From / Source Details</label>
              <input type="text" placeholder="e.g. Company name, Client name, Platform" value={form.sourceDetails} onChange={e => set('sourceDetails', e.target.value)} className={inputCls} />
            </div>
          )}

          {/* Date */}
          <div>
            <label className={labelCls}>Date *</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} required />
          </div>

          {/* Payment Mode */}
          <div>
            <label className={labelCls}>Payment Mode</label>
            <div className="grid grid-cols-5 gap-2">
              {PAYMENT_MODES.map(({ value, label, icon: Icon }) => (
                <button key={value} type="button" onClick={() => set('paymentMode', value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-all ${form.paymentMode === value ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* UPI fields */}
          {form.paymentMode === 'upi' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
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
            <label className={labelCls}>Notes (optional)</label>
            <textarea rows={2} placeholder="Any additional notes..." value={form.notes} onChange={e => set('notes', e.target.value)} className={`${inputCls} resize-none`} />
          </div>

          {/* Tags */}
          <div>
            <label className={labelCls}>Tags (comma separated)</label>
            <input type="text" placeholder="e.g. work, personal, urgent" value={form.tags} onChange={e => set('tags', e.target.value)} className={inputCls} />
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting}
            className={`w-full py-3 rounded-xl font-bold text-white text-sm transition-all ${isExpense ? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/20' : 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-500/20'} disabled:opacity-50 disabled:cursor-not-allowed`}>
            {submitting ? 'Saving...' : `Save ${isExpense ? 'Expense' : 'Earning'}`}
          </button>
        </form>
      </div>
    </div>
  );
}
