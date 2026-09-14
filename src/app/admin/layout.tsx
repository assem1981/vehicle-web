'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { Shield, Activity, Lock } from 'lucide-react';
import { authService } from '@/services/authService';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const user = authService.getUserFromStorage();
    if (!user) {
      router.push('/unauthorized?required=ADMIN');
      return;
    }

    const hasAdminAccess = authService.hasRole(user, 'ADMIN');
    if (!hasAdminAccess) {
      router.push('/unauthorized?required=ADMIN');
      return;
    }

    setIsAuthorized(true);
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="max-w-7xl mx-auto p-12 text-center text-slate-400 font-semibold animate-pulse">
        Verifying Master Executive Admin Credentials & Gate Security...
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
      
      {/* Top System Status Banner */}
      <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-[#0B1F35] to-slate-900 border border-amber-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-[#F5B301] border border-amber-500/30 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                SYSTEM HEALTH 100%
              </span>
              <span className="text-xs text-slate-400">• MyMotionLux Executive Suite</span>
            </div>
            <h1 className="text-xl font-black text-white">Platform Administration Console</h1>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>API Gateway: 45ms</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <Lock className="w-3.5 h-3.5 text-[#F5B301]" />
            <span>Master Key Signed</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <AdminSidebar />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
