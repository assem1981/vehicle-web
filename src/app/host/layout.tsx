'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HostSidebar from '@/components/HostSidebar';
import { authService } from '@/services/authService';
import { hostService } from '@/services/hostService';
import { Vehicle } from '@/services/vehicleService';

export default function HostLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeVehiclesCount, setActiveVehiclesCount] = useState<number | null>(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState<number | null>(null);

  useEffect(() => {
    const user = authService.getUserFromStorage();
    if (!user) {
      router.push('/unauthorized?required=HOST');
      return;
    }

    const hasHostAccess = authService.hasRole(user, 'HOST') || authService.hasRole(user, 'ADMIN');
    if (!hasHostAccess) {
      router.push('/unauthorized?required=HOST');
      return;
    }

    setIsAuthorized(true);
    setChecking(false);

    // Fetch dynamic host metrics for top banner header
    const loadBannerMetrics = async () => {
      try {
        const [vList, eSummary] = await Promise.all([
          hostService.getHostVehicles().catch(() => []),
          hostService.getEarningsSummary().catch(() => null)
        ]);

        const activeCount = vList.filter(
          (v: Vehicle) => v.status === 'AVAILABLE' || v.status === 'IN_USE' || v.status === 'ACTIVE'
        ).length;

        setActiveVehiclesCount(activeCount);
        setMonthlyEarnings(eSummary?.monthlyEarningsUSD ?? 0);
      } catch (err) {
        console.error('Error fetching host banner metrics:', err);
      }
    };

    loadBannerMetrics();
  }, [router]);

  if (checking) {
    return (
      <div className="max-w-7xl mx-auto p-12 text-center text-slate-400 font-semibold animate-pulse">
        Verifying Host Credentials & Security Permissions...
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Top Banner Header */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0B1F35] to-slate-950 border border-amber-500/20 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[#F5B301] border border-amber-500/30">
              Host Command Center
            </span>
            <span className="text-xs text-slate-400">• MyMotionLux Partner</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Vehicle Owner Portal</h1>
        </div>
        <div className="flex items-center gap-6 text-xs text-slate-300">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Fleet</span>
            <span className="text-base font-extrabold text-white">
              {activeVehiclesCount !== null ? `${activeVehiclesCount} ${activeVehiclesCount === 1 ? 'Car' : 'Cars'}` : '...'}
            </span>
          </div>
          <div className="h-8 w-px bg-white/10"></div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">This Month</span>
            <span className="text-base font-extrabold text-[#F5B301]">
              {monthlyEarnings !== null ? `$${monthlyEarnings.toLocaleString()}` : '...'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <HostSidebar />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
