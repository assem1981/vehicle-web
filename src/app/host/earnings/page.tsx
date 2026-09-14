'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, ArrowDownRight, CheckCircle2, Download, Building } from 'lucide-react';
import { hostService, HostEarningsSummary } from '@/services/hostService';

export default function HostEarningsPage() {
  const [data, setData] = useState<HostEarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEarnings = async () => {
      try {
        const res = await hostService.getEarningsSummary();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadEarnings();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading Host Financial Analytics...</div>;
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p className="text-sm font-bold text-white mb-2">Earnings data unavailable</p>
        <p className="text-xs">Host earnings will appear here once the API is available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Earnings Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="glass-card p-6 border border-white/10">
          <span className="text-xs font-bold text-slate-400 block mb-1">Lifetime Gross Revenue</span>
          <div className="text-3xl font-black text-white">${data.totalEarningsUSD.toLocaleString()}</div>
          <p className="text-[11px] text-emerald-400 font-semibold mt-1">Across {data.completedBookingsCount} completed trips</p>
        </div>

        <div className="glass-card p-6 border border-white/10">
          <span className="text-xs font-bold text-slate-400 block mb-1">This Month&apos;s Net Payout</span>
          <div className="text-3xl font-black text-[#F5B301]">${data.monthlyEarningsUSD.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400 mt-1">90% Host payout rate after platform fee</p>
        </div>

        <div className="glass-card p-6 border border-white/10">
          <span className="text-xs font-bold text-slate-400 block mb-1">Pending Balance</span>
          <div className="text-3xl font-black text-white">${data.pendingPayoutUSD}</div>
          <p className="text-[11px] text-amber-400 font-semibold mt-1">Next Payout Pending</p>
        </div>

      </div>

      {/* Payout Bank Account Setup */}
      <div className="glass-card p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#F5B301] flex items-center justify-center font-bold">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Direct Deposit Payout Account</h3>
            <p className="text-xs text-slate-400">Bank account details will appear here once configured.</p>
          </div>
        </div>

        <button className="btn-secondary text-xs py-2 px-4">
          Update Bank Details
        </button>
      </div>

      {/* Payout History Table */}
      <div className="glass-card p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Payout History</h3>
          <button className="text-xs font-semibold text-[#F5B301] hover:underline flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> Export Statements (CSV)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3">Payout ID</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Bank Destination</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {data.payoutHistory.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-all">
                  <td className="py-3 font-mono font-bold text-white">{p.id}</td>
                  <td className="py-3">{p.date}</td>
                  <td className="py-3">{p.bankAccount}</td>
                  <td className="py-3 font-extrabold text-emerald-400">${p.amountUSD}</td>
                  <td className="py-3">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
