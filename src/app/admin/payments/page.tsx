'use client';

import React, { useState } from 'react';
import { CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';

export default function AdminPaymentsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">

      <div className="glass-card p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Global Payments & Transactions</h2>
          <p className="text-xs text-slate-400">Payment gateway processing, gross transaction volumes, and host payout releases</p>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-12 border border-white/10 text-center text-slate-400">Loading payments...</div>
      ) : payments.length === 0 ? (
        <div className="glass-card p-12 border border-white/10 text-center text-slate-400">
          <p className="text-sm font-bold text-white mb-2">No transactions found</p>
          <p className="text-xs">Payment transaction data will appear here once the ledger API is available.</p>
        </div>
      ) : (
        <div className="glass-card p-6 border border-white/10 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3">Transaction ID</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Gross Amount</th>
                <th className="pb-3">Gateway Processing Fee</th>
                <th className="pb-3">Platform Net Share</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-all">
                  <td className="py-3 font-mono font-bold text-white">{p.id}</td>
                  <td className="py-3 font-semibold text-[#F5B301]">{p.type.replace('_', ' ')}</td>
                  <td className="py-3 font-black text-white">${p.amount}</td>
                  <td className="py-3 text-slate-400">${p.gatewayFee}</td>
                  <td className="py-3 font-bold text-emerald-400">${p.netPlatform}</td>
                  <td className="py-3">{p.date}</td>
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
      )}

    </div>
  );
}
