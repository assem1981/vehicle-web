'use client';

import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Car, 
  User, 
  DollarSign, 
  Ban, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Filter
} from 'lucide-react';
import { adminService } from '@/services/adminService';

interface BookingRecord {
  id: number;
  vehicleId: number;
  userId: number;
  vehicleName?: string;
  renterName?: string;
  hostName?: string;
  dates?: string;
  startDate?: string;
  endDate?: string;
  totalPrice?: number;
  status: string;
  promoCode?: string;
  createdAt?: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load admin bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    const confirmMsg = newStatus === 'CANCELLED' 
      ? 'Are you sure you want to FORCE CANCEL this trip?' 
      : `Change status of booking #${id} to ${newStatus}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await adminService.updateBookingStatus(id, newStatus);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    } catch (err) {
      console.error('Failed to update booking status:', err);
      // Fallback local state update
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    }
  };

  // Filtered bookings
  const filteredBookings = bookings.filter(b => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      b.id.toString().includes(query) ||
      (b.vehicleName && b.vehicleName.toLowerCase().includes(query)) ||
      (b.renterName && b.renterName.toLowerCase().includes(query)) ||
      (b.hostName && b.hostName.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  // Summary Metrics
  const totalBookingsCount = bookings.length;
  const activeBookingsCount = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'ACTIVE' || b.status === 'IN_PROGRESS').length;
  const completedBookingsCount = bookings.filter(b => b.status === 'COMPLETED').length;
  const cancelledBookingsCount = bookings.filter(b => b.status === 'CANCELLED' || b.status === 'CANCELLED_BY_ADMIN').length;

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="glass-card p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[#F5B301] border border-amber-500/30">
              Live Reservation Ledger
            </span>
            <span className="text-xs text-slate-400">• Real-Time Administrative Monitor</span>
          </div>
          <h1 className="text-2xl font-black text-white">Global Platform Bookings</h1>
          <p className="text-xs text-slate-400 mt-0.5">Monitor, inspect, and manage all user and host reservations across the network</p>
        </div>
        <button 
          onClick={fetchBookings}
          className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#F5B301]' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Reservations</span>
            <CalendarDays className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalBookingsCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">Platform Total</div>
        </div>

        <div className="glass-card p-4 border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Active & Confirmed</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{activeBookingsCount}</div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">Ongoing / Upcoming</div>
        </div>

        <div className="glass-card p-4 border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Completed Trips</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{completedBookingsCount}</div>
          <div className="text-[10px] text-blue-400 font-semibold mt-1">Successful Deliveries</div>
        </div>

        <div className="glass-card p-4 border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Cancelled Trips</span>
            <Ban className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{cancelledBookingsCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">Cancelled / Voided</div>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="glass-card p-4 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Vehicle, Renter, Host, or Trip ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['ALL', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {st === 'ALL' ? 'All Reservations' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Monitoring Table */}
      {loading ? (
        <div className="glass-card p-12 border border-white/10 text-center text-slate-400 animate-pulse">
          Loading Global Reservations Ledger...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="glass-card p-12 border border-white/10 text-center text-slate-400 space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-500/50 mx-auto" />
          <p className="text-sm font-bold text-white">No matching reservations found</p>
          <p className="text-xs text-slate-400">
            {searchQuery || statusFilter !== 'ALL' 
              ? 'Try adjusting your search criteria or status filters.' 
              : 'When users book vehicles on the platform, reservations will appear here in real time.'}
          </p>
        </div>
      ) : (
        <div className="glass-card p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Reservation Records ({filteredBookings.length})</h2>
            <span className="text-xs text-slate-400">Real-time system updates</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">Trip ID</th>
                  <th className="pb-3">Vehicle Details</th>
                  <th className="pb-3">Renter & Host</th>
                  <th className="pb-3">Rental Window</th>
                  <th className="pb-3">Total GMV</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Admin Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-all">
                    <td className="py-4 font-mono font-bold text-white">#{b.id}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <span className="font-bold text-white block">{b.vehicleName || `Vehicle #${b.vehicleId}`}</span>
                          <span className="text-[10px] text-slate-400">ID: {b.vehicleId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-white font-medium block flex items-center gap-1">
                        <User className="w-3 h-3 text-blue-400" /> Renter: {b.renterName || `User #${b.userId}`}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Host: {b.hostName || 'Fleet Host'}
                      </span>
                    </td>
                    <td className="py-4 font-medium text-slate-200">
                      {b.dates || `${b.startDate ?? ''} to ${b.endDate ?? ''}`}
                    </td>
                    <td className="py-4 font-extrabold text-[#F5B301]">
                      ${b.totalPrice != null ? Number(b.totalPrice).toLocaleString() : '0.00'}
                    </td>
                    <td className="py-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                        b.status === 'CONFIRMED' || b.status === 'ACTIVE' || b.status === 'IN_PROGRESS'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : b.status === 'COMPLETED'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}>
                        {b.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {b.status !== 'CANCELLED' && b.status !== 'CANCELLED_BY_ADMIN' && b.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all text-[11px] font-bold"
                          >
                            Force Cancel
                          </button>
                        )}
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all text-[11px] font-bold"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
