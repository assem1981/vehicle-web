'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, Users, Car, AlertCircle, ArrowUpRight, TrendingUp, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { adminService, AdminMetrics } from '@/services/adminService';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await adminService.getMetrics();
        setMetrics(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading || !metrics) {
    return <div className="p-8 text-center text-slate-400">Loading Executive Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 border border-white/10 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400">Gross Marketplace Volume</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-[#F5B301]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">${(metrics?.totalGmvUSD ?? 0).toLocaleString()}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
            <TrendingUp className="w-3 h-3" /> Gross Marketplace Volume
          </div>
        </div>

        <div className="glass-card p-5 border border-white/10">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400">Platform Net Earnings</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">${(metrics?.platformFeesUSD ?? 0).toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">Platform Commission</div>
        </div>

        <div className="glass-card p-5 border border-white/10">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400">Registered Accounts</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{metrics?.activeUsersCount ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">{metrics?.activeHostsCount ?? 0} Verified Hosts</div>
        </div>

        <div className="glass-card p-5 border border-white/10">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400">Pending Approvals</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400">{metrics?.pendingApprovalsCount ?? 0} Items</div>
          <div className="text-[11px] text-amber-400 font-semibold mt-1">Action Required Queue</div>
        </div>

      </div>

      {/* Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Car className="w-4 h-4 text-[#F5B301]" /> Vehicle Listings Awaiting Approval
            </h3>
            <p className="text-xs text-amber-200">Review submitted vehicle specifications and VIN documents.</p>
          </div>
          <Link href="/admin/vehicles" className="btn-primary text-xs py-2 px-4 shrink-0">
            Review Queue
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" /> Host Verification Requests
            </h3>
            <p className="text-xs text-blue-200">Inspect submitted Driver Licenses and Tax IDs.</p>
          </div>
          <Link href="/admin/host-approvals" className="btn-secondary text-xs py-2 px-4 shrink-0">
            Inspect IDs
          </Link>
        </div>

      </div>

    </div>
  );
}
