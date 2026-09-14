'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Car, 
  CalendarDays, 
  DollarSign, 
  MessageSquare, 
  Wrench, 
  ShieldAlert, 
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview Hub', href: '/host/dashboard', icon: LayoutDashboard },
  { label: 'Add New Vehicle', href: '/host/vehicles/new', icon: PlusCircle, badge: 'New' },
  { label: 'Host Bookings', href: '/host/bookings', icon: Car },
  { label: 'Rates & Calendar', href: '/host/calendar', icon: CalendarDays },
  { label: 'Earnings & Payouts', href: '/host/earnings', icon: DollarSign },
  { label: 'Guest Messages', href: '/host/messages', icon: MessageSquare },
  { label: 'Maintenance Logs', href: '/host/maintenance', icon: Wrench },
  { label: 'Damage Reports', href: '/host/damage-reports', icon: ShieldAlert },
  { label: 'Identity Verification', href: '/host/verification', icon: ShieldCheck },
];

export default function HostSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      
      {/* Host Profile Mini Header */}
      <div className="glass-card p-5 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F5B301] to-amber-600 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-amber-500/20">
            H
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Host Account
              <Sparkles className="w-3.5 h-3.5 text-[#F5B301]" />
            </h3>
            <p className="text-[11px] text-amber-400 font-medium">MyMotionLux Partner</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="glass-card p-3 border border-white/10 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Host Management
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/host/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#F5B301]/20 to-amber-500/10 text-[#F5B301] border border-amber-500/30 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F5B301]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge ? (
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  item.badge === 'Verified'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : item.badge === 'New'
                    ? 'bg-amber-500/20 text-[#F5B301] border border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {item.badge}
                </span>
              ) : (
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-[#F5B301] translate-x-0.5' : 'text-slate-600'}`} />
              )}
            </Link>
          );
        })}
      </div>

      {/* Host Performance Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 space-y-2 text-xs">
        <div className="flex justify-between items-center text-slate-300 font-semibold">
          <span>Host Performance</span>
        </div>
        <p className="text-[10px] text-slate-400">Performance metrics will appear here once analytics are available.</p>
      </div>

    </aside>
  );
}
