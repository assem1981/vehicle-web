'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminService } from '@/services/adminService';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Car, 
  FileText, 
  MapPin, 
  CalendarDays, 
  ShieldAlert, 
  MessageSquareWarning, 
  Star, 
  CreditCard, 
  RotateCcw, 
  Percent, 
  Tag, 
  BarChart3, 
  History, 
  Sliders,
  ChevronRight,
  Shield
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [pendingVehiclesCount, setPendingVehiclesCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const pendingList = await adminService.getPendingVehicles();
        setPendingVehiclesCount(pendingList.length);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPending();

    window.addEventListener('vehicleModerationUpdated', fetchPending);
    return () => window.removeEventListener('vehicleModerationUpdated', fetchPending);
  }, []);

  const navGroups = [
    {
      groupTitle: 'Overview',
      items: [
        { label: 'Executive Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      groupTitle: 'Identity & Accounts',
      items: [
        { label: 'User Directory', href: '/admin/users', icon: Users },
        { label: 'Host Directory', href: '/admin/hosts', icon: UserCheck },
        { label: 'Host Approvals', href: '/admin/host-approvals', icon: ShieldCheck, badge: 'Pending' },
        { label: 'Identity Verification', href: '/admin/verification', icon: ShieldCheck },
      ]
    },
    {
      groupTitle: 'Fleet & Coverage',
      items: [
        { 
          label: 'Vehicles Moderation', 
          href: '/admin/vehicles', 
          icon: Car, 
          badge: pendingVehiclesCount !== null ? `${pendingVehiclesCount} Pending` : 'Pending' 
        },
        { label: 'Document Review', href: '/admin/documents', icon: FileText },
        { label: 'Locations & Cities', href: '/admin/locations', icon: MapPin },
      ]
    },
    {
      groupTitle: 'Operations & Support',
      items: [
        { label: 'Bookings Ledger', href: '/admin/bookings', icon: CalendarDays },
        { label: 'Damage Claims', href: '/admin/claims', icon: ShieldAlert },
        { label: 'Complaints & Support', href: '/admin/complaints', icon: MessageSquareWarning },
        { label: 'Reviews Moderation', href: '/admin/reviews', icon: Star },
      ]
    },
    {
      groupTitle: 'Financials & Revenue',
      items: [
        { label: 'Payments & Transactions', href: '/admin/payments', icon: CreditCard },
        { label: 'Refunds Requests', href: '/admin/refunds', icon: RotateCcw },
        { label: 'Pricing & Commission', href: '/admin/pricing', icon: Percent },
        { label: 'Promotions & Coupons', href: '/admin/promotions', icon: Tag },
        { label: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
      ]
    },
    {
      groupTitle: 'Governance & System',
      items: [
        { label: 'Audit Logs', href: '/admin/audit-logs', icon: History },
        { label: 'System Configuration', href: '/admin/system-config', icon: Sliders },
      ]
    }
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-4">
      
      {/* Admin Badge Panel */}
      <div className="glass-card p-4 border border-white/10 relative overflow-hidden bg-slate-950/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-[#F5B301] to-amber-600 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-amber-500/20">
            <Shield className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Super Admin Console</h3>
            <p className="text-[10px] text-amber-400 font-semibold">Master Governance Mode</p>
          </div>
        </div>
      </div>

      {/* Grouped Links */}
      <div className="glass-card p-3 border border-white/10 space-y-4 max-h-[750px] overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.groupTitle} className="space-y-1">
            <div className="px-3 text-[9px] font-extrabold tracking-widest text-slate-500 uppercase">
              {group.groupTitle}
            </div>

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#F5B301]/25 to-amber-500/10 text-[#F5B301] border border-amber-500/30 shadow-md font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#F5B301]' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-[#F5B301] border border-amber-500/30 shrink-0">
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform shrink-0 ${isActive ? 'text-[#F5B301] translate-x-0.5' : 'text-slate-700'}`} />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

    </aside>
  );
}
