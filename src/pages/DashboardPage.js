import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TrendingUp, TrendingDown, Wallet, Plus, Download, RefreshCw, AlertCircle, X } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { dashboardRequest } from '../store/slices/dashboardSlice';
import { reportAPI } from '../services/api';
import TransactionModal from '../components/TransactionModal';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const chartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 }, usePointStyle: true } }, tooltip: { backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: '#334155', borderWidth: 1 } },
  scales: { x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#1e293b' } }, y: { ticks: { color: '#64748b', font: { size: 10 }, callback: v => `₹${(v / 1000).toFixed(0)}k` }, grid: { color: '#1e293b' } } }
};

// ── Floating Action Button ──────────────────────────────────────────────────
function FAB({ onClick }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Sub-buttons */}
      <div className={`flex flex-col items-end gap-2.5 transition-all duration-300 ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button onClick={() => { setOpen(false); onClick('earning'); }}
          className="flex items-center gap-3 bg-slate-900 border border-green-500/40 text-white pl-4 pr-4 py-2.5 rounded-2xl shadow-xl shadow-black/30 hover:border-green-400/60 hover:bg-slate-800 transition-all group">
          <span className="text-sm font-semibold text-slate-300 group-hover:text-white">Add Earning</span>
          <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 flex-shrink-0">
            <TrendingUp size={15} className="text-white" />
          </div>
        </button>
        <button onClick={() => { setOpen(false); onClick('expense'); }}
          className="flex items-center gap-3 bg-slate-900 border border-red-500/40 text-white pl-4 pr-4 py-2.5 rounded-2xl shadow-xl shadow-black/30 hover:border-red-400/60 hover:bg-slate-800 transition-all group">
          <span className="text-sm font-semibold text-slate-300 group-hover:text-white">Add Expense</span>
          <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 flex-shrink-0">
            <TrendingDown size={15} className="text-white" />
          </div>
        </button>
      </div>

      {/* Backdrop */}
      {open && <div className="fixed inset-0 -z-10" onClick={() => setOpen(false)} />}

      {/* Main FAB */}
      <button onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 
          ${open
            ? 'bg-slate-700 shadow-black/40 rotate-45'
            : 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/40 hover:scale-110 hover:shadow-indigo-500/50'}`}>
        {open ? <X size={20} className="text-white" /> : <Plus size={22} className="text-white" />}
      </button>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────
export default function DashboardPage() {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector(s => s.dashboard);
  const [modal, setModal] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => { dispatch(dashboardRequest()); }, [dispatch]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const now = new Date();
      const res = await reportAPI.download(now.getMonth() + 1, now.getFullYear());
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url;
      a.download = `report-${now.toLocaleString('default', { month: 'long' })}-${now.getFullYear()}.pdf`;
      a.click(); window.URL.revokeObjectURL(url);
      toast.success('Report downloaded!');
    } catch { toast.error('Failed to download report'); }
    finally { setDownloading(false); }
  };

  const chartData = stats ? {
    labels: stats.sixMonthsData.map(d => d.month),
    datasets: [
      { label: 'Earnings', data: stats.sixMonthsData.map(d => d.earnings), backgroundColor: 'rgba(34,197,94,0.8)', borderRadius: 6 },
      { label: 'Expenses', data: stats.sixMonthsData.map(d => d.expenses), backgroundColor: 'rgba(239,68,68,0.8)', borderRadius: 6 },
    ]
  } : null;

  const lineData = stats ? {
    labels: stats.sixMonthsData.map(d => d.month),
    datasets: [{ label: 'Balance', data: stats.sixMonthsData.map(d => d.earnings - d.expenses), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#6366f1', pointRadius: 4 }]
  } : null;

  const fmt = n => `₹${(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const balance = (stats?.totalEarnings || 0) - (stats?.totalExpenses || 0);

  if (loading && !stats) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw size={32} className="text-indigo-400 animate-spin" />
        <p className="text-slate-400 text-sm">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-white text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} Overview</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => dispatch(dashboardRequest())} className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-sm hover:bg-slate-700 transition-all">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={handleDownloadPDF} disabled={downloading} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-500 transition-all disabled:opacity-50">
            <Download size={14} /> {downloading ? 'Generating...' : 'Download Report'}
          </button>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Earnings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-green-500/40 transition-all cursor-pointer"
          onClick={() => setModal('earning')}>
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center"><TrendingUp size={20} className="text-green-400" /></div>
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center shadow-lg shadow-green-500/20 opacity-0 group-hover:opacity-100 transition-all">
              <Plus size={16} className="text-white" />
            </div>
          </div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Earnings</p>
          <p className="text-green-400 text-2xl font-bold mt-1">{fmt(stats?.totalEarnings)}</p>
          <p className="text-slate-500 text-xs mt-2">Click to add earning</p>
        </div>

        {/* Expenses */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-red-500/40 transition-all cursor-pointer"
          onClick={() => setModal('expense')}>
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center"><TrendingDown size={20} className="text-red-400" /></div>
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/20 opacity-0 group-hover:opacity-100 transition-all">
              <Plus size={16} className="text-white" />
            </div>
          </div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Expenses</p>
          <p className="text-red-400 text-2xl font-bold mt-1">{fmt(stats?.totalExpenses)}</p>
          <p className="text-slate-500 text-xs mt-2">Click to add expense</p>
        </div>

        {/* Balance */}
        <div className={`bg-slate-900 border rounded-2xl p-5 relative overflow-hidden group transition-all ${balance >= 0 ? 'border-slate-800 hover:border-indigo-500/40' : 'border-red-900/50'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${balance >= 0 ? 'bg-indigo-500/15' : 'bg-red-500/15'}`}>
              <Wallet size={20} className={balance >= 0 ? 'text-indigo-400' : 'text-red-400'} />
            </div>
          </div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{balance >= 0 ? 'Net Savings' : 'Net Loss'}</p>
          <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-indigo-400' : 'text-red-400'}`}>{fmt(Math.abs(balance))}</p>
          <div className="flex items-center gap-1 mt-2">
            {balance >= 0
              ? <><TrendingUp size={12} className="text-green-400" /><p className="text-green-400 text-xs">Profit this month</p></>
              : <><AlertCircle size={12} className="text-red-400" /><p className="text-red-400 text-xs">Loss this month</p></>}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-1">Earnings vs Expenses</h3>
          <p className="text-slate-400 text-xs mb-4">Last 6 months comparison</p>
          <div className="h-52">{chartData && <Bar data={chartData} options={chartOptions} />}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-1">Balance Trend</h3>
          <p className="text-slate-400 text-xs mb-4">Monthly profit/loss trend</p>
          <div className="h-52">{lineData && <Line data={lineData} options={chartOptions} />}</div>
        </div>
      </div>

      {/* Categories + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Top Expense Categories</h3>
          <div className="space-y-3">
            {stats?.categoryBreakdown?.length ? stats.categoryBreakdown.slice(0, 6).map((cat, i) => {
              const max = stats.categoryBreakdown[0]?.total || 1;
              const pct = Math.round((cat.total / max) * 100);
              const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-blue-500'];
              return (
                <div key={cat._id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{cat._id}</span>
                    <span className="text-slate-400">{fmt(cat.total)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            }) : <p className="text-slate-500 text-sm text-center py-6">No expenses this month</p>}
          </div>
        </div>

        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Recent Transactions</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {stats?.recentTransactions?.length ? stats.recentTransactions.map(tx => (
              <div key={tx._id} className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl hover:bg-slate-800 transition-all">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.type === 'earning' ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
                  {tx.type === 'earning' ? <TrendingUp size={15} className="text-green-400" /> : <TrendingDown size={15} className="text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{tx.reason}</p>
                  <p className="text-slate-500 text-xs">{tx.category} · {new Date(tx.date).toLocaleDateString('en-IN')}</p>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ${tx.type === 'earning' ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.type === 'earning' ? '+' : '-'}{fmt(tx.amount)}
                </span>
              </div>
            )) : <p className="text-slate-500 text-sm text-center py-8">No transactions yet</p>}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FAB onClick={(type) => setModal(type)} />

      {/* Modal */}
      {modal && <TransactionModal type={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
