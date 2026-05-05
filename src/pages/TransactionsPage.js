import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Filter, Trash2, TrendingUp, TrendingDown, Smartphone, Banknote, CreditCard, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchRequest, deleteRequest } from '../store/slices/transactionSlice';
import TransactionModal from '../components/TransactionModal';
import toast from 'react-hot-toast';

const modeIcon = { upi: Smartphone, cash: Banknote, card: CreditCard, bank: Building2 };

export default function TransactionsPage() {
  const dispatch = useDispatch();
  const { list, total, loading } = useSelector(s => s.transactions);
  const [modal, setModal] = useState(null);
  const [filters, setFilters] = useState({ type: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), search: '' });
  const [page, setPage] = useState(1);
  const limit = 15;

  useEffect(() => {
    dispatch(fetchRequest({ type: filters.type, month: filters.month, year: filters.year, page, limit }));
  }, [dispatch, filters.type, filters.month, filters.year, page]);

  const filtered = list.filter(t => !filters.search || t.reason.toLowerCase().includes(filters.search.toLowerCase()) || t.category.toLowerCase().includes(filters.search.toLowerCase()));

  const handleDelete = (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    dispatch(deleteRequest(id));
    toast.success('Deleted');
  };

  const fmt = (n) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const years = [2023, 2024, 2025, 2026];

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-white text-2xl font-bold">Transactions</h1>
          <p className="text-slate-400 text-sm">{total} total transactions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModal('earning')} className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-green-500/20">
            <TrendingUp size={15} /> Add Earning
          </button>
          <button onClick={() => setModal('expense')} className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-red-500/20">
            <TrendingDown size={15} /> Add Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search transactions..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-slate-400" />
          <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500">
            <option value="">All Types</option>
            <option value="earning">Earnings</option>
            <option value="expense">Expenses</option>
          </select>
          <select value={filters.month} onChange={e => setFilters(f => ({ ...f, month: e.target.value }))} className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500">
            {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select value={filters.year} onChange={e => setFilters(f => ({ ...f, year: e.target.value }))} className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Earnings', val: filtered.filter(t=>t.type==='earning').reduce((s,t)=>s+t.amount,0), color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Expenses', val: filtered.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0), color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Balance', val: filtered.filter(t=>t.type==='earning').reduce((s,t)=>s+t.amount,0) - filtered.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0), color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        ].map(({ label, val, color, bg }) => (
          <div key={label} className={`${bg} border border-slate-800 rounded-xl p-3 text-center`}>
            <p className="text-slate-400 text-xs">{label}</p>
            <p className={`${color} font-bold text-sm mt-0.5`}>{fmt(val)}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-slate-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">Date</th>
                <th className="text-left text-slate-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">Type</th>
                <th className="text-left text-slate-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">Category</th>
                <th className="text-left text-slate-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">Reason</th>
                <th className="text-left text-slate-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">Mode</th>
                <th className="text-right text-slate-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-slate-800 rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-slate-500 py-16">No transactions found</td></tr>
              ) : filtered.map(tx => {
                const ModeIcon = modeIcon[tx.paymentMode] || Banknote;
                return (
                  <tr key={tx._id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{new Date(tx.date).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${tx.type === 'earning' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                        {tx.type === 'earning' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{tx.category}</td>
                    <td className="px-4 py-3 text-white text-xs max-w-[180px] truncate">{tx.reason}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-slate-400 text-xs">
                        <ModeIcon size={12} />{tx.paymentMode}
                        {tx.upiDirection === 'sent' && <span className="text-red-400 text-xs">↑sent</span>}
                        {tx.upiDirection === 'received' && <span className="text-green-400 text-xs">↓recv</span>}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-bold whitespace-nowrap ${tx.type === 'earning' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'earning' ? '+' : '-'}{fmt(tx.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(tx._id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all p-1 rounded-lg hover:bg-red-400/10">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <p className="text-slate-500 text-xs">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {modal && <TransactionModal type={modal} onClose={() => { setModal(null); dispatch(fetchRequest({ type: filters.type, month: filters.month, year: filters.year, page, limit })); }} />}
    </div>
  );
}
