'use client';

import React from 'react';
import { BarChart3, Download, TrendingUp, Calendar, FileText } from 'lucide-react';

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      
      <div className="glass-card p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Financial & Operational Reports</h2>
          <p className="text-xs text-slate-400">Generate executive revenue analytics, host payout ledgers, and tax statements</p>
        </div>

        <button className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
          <Download className="w-4 h-4" /> Export Master Statement (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <div className="glass-card p-5 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5B301]">
            <FileText className="w-4 h-4" /> Q3 Monthly Financial Ledger
          </div>
          <p className="text-xs text-slate-400">Complete gross rental volume, platform commission, and tax breakdown for Q3 2026.</p>
          <button className="btn-secondary w-full text-xs py-2">Download PDF Report</button>
        </div>

        <div className="glass-card p-5 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <BarChart3 className="w-4 h-4" /> Host Earnings & Tax 1099
          </div>
          <p className="text-xs text-slate-400">Annual host payout distributions and tax compliance summary for partner hosts.</p>
          <button className="btn-secondary w-full text-xs py-2">Download CSV Data</button>
        </div>

        <div className="glass-card p-5 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
            <TrendingUp className="w-4 h-4" /> Marketplace Fleet Utilization
          </div>
          <p className="text-xs text-slate-400">Vehicle booking frequency, average daily rate trends, and category popularity metrics.</p>
          <button className="btn-secondary w-full text-xs py-2">Download Analytics</button>
        </div>

      </div>

    </div>
  );
}
