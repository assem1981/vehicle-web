'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  Car, 
  Calendar, 
  TrendingUp, 
  PlusCircle, 
  Wrench, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { hostService } from '@/services/hostService';
import { bookingService, Booking } from '@/services/bookingService';
import { Vehicle } from '@/services/vehicleService';

export default function HostDashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [earnings, setEarnings] = useState<{ monthlyEarningsUSD?: number; totalEarningsUSD?: number; pendingPayoutUSD?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vList, eSummary, bList] = await Promise.all([
          hostService.getHostVehicles(),
          hostService.getEarningsSummary(),
          bookingService.getHostBookings()
        ]);
        setVehicles(vList);
        setEarnings(eSummary);
        setBookings(bList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const activeRentalsCount = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'ACTIVE' || b.status === 'IN_PROGRESS').length;
  const activeVehiclesCount = vehicles.filter(v => v.status === 'AVAILABLE' || v.status === 'IN_USE' || v.status === 'ACTIVE').length;

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading Host Control Hub...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 border border-white/10 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400">This Month Revenue</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-[#F5B301]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">${earnings?.monthlyEarningsUSD?.toLocaleString() ?? 0}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
            <TrendingUp className="w-3 h-3" /> Current Month Revenue
          </div>
        </div>

        <div className="glass-card p-5 border border-white/10">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400">Active & Reserved Trips</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{activeRentalsCount} Active</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-semibold">{bookings.length} Total Trips</div>
        </div>

        <div className="glass-card p-5 border border-white/10">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400">Active Fleet</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-[#F5B301]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{activeVehiclesCount} Active</div>
          <div className="text-[11px] text-[#F5B301] font-semibold mt-1">{vehicles.length} Total Vehicles</div>
        </div>

        <div className="glass-card p-5 border border-white/10">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400">Pending Payout</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">${earnings?.pendingPayoutUSD ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Pending Payout</div>
        </div>

      </div>

      {/* Quick Action Shortcuts */}
      <div className="glass-card p-6 border border-white/10">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
          <span>Host Operations Shortcuts</span>
          <span className="text-xs font-normal text-slate-400">Quick management tools</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link 
            href="/host/vehicles/new"
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-white/10 transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F5B301] to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white group-hover:text-[#F5B301]">Add Vehicle</span>
          </Link>

          <Link 
            href="/host/calendar"
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-white/10 transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-[#F5B301] flex items-center justify-center font-bold border border-amber-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white group-hover:text-[#F5B301]">Set Rates & Block</span>
          </Link>

          <Link 
            href="/host/maintenance"
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-white/10 transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white group-hover:text-blue-400">Log Maintenance</span>
          </Link>

          <Link 
            href="/host/damage-reports"
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-white/10 transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-rose-400 flex items-center justify-center font-bold border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white group-hover:text-rose-400">File Damage Claim</span>
          </Link>
        </div>
      </div>

      {/* Fleet Overview Table/Cards */}
      <div className="glass-card p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Your Listed Vehicles</h2>
            <p className="text-xs text-slate-400">Manage rates, availability, and documents for your cars</p>
          </div>
          <Link href="/host/vehicles/new" className="btn-primary text-xs py-2 px-3 flex items-center gap-1">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>List Another Car</span>
          </Link>
        </div>

        <div className="space-y-3">
          {vehicles.map((v) => (
            <div key={v.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-500/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                  <img src={v.imageUrl} alt={v.model} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{v.make} {v.model} ({v.year})</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span>${v.dailyRate}/day</span>
                    {v.trips != null && <span>• {v.trips} Trips completed</span>}
                    {v.rating != null && <span className="text-[#F5B301] font-medium">★ {v.rating}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  v.status === 'PENDING_APPROVAL'
                    ? 'bg-amber-500/20 text-[#F5B301] border-amber-500/30'
                    : v.status === 'AVAILABLE'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : v.status === 'DEACTIVATED'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                }`}>
                  {v.status === 'PENDING_APPROVAL' ? 'Pending Approval' : v.status === 'AVAILABLE' ? 'Active' : v.status?.replace('_', ' ') || 'Unknown'}
                </span>
                <Link href={`/vehicles/${v.id}`} className="btn-secondary text-xs py-1.5 px-3">
                  Preview
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
