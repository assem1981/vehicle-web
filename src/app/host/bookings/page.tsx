'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Car,
  Calendar,
  User,
  Check,
  X,
  MessageSquare,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { bookingService, Booking } from '@/services/bookingService';

interface HostBookingItem {
  id: number;
  vehicleName: string;
  renterName: string;
  renterAvatar: string;
  renterRating: number;
  startDate: string;
  endDate: string;
  totalPayoutUSD: number;
  status: 'PENDING_APPROVAL' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'REJECTED';
  location: string;
}

export default function HostBookingsPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await bookingService.getHostBookings();
        setBookings(res);
      } catch (err) {
        console.error('Failed to load host bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, []);

  const handleAction = async (id: number, newStatus: 'CONFIRMED' | 'REJECTED') => {
    await bookingService.updateBookingStatus(id, newStatus);
    setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'PENDING') return b.status === 'PENDING_APPROVAL';
    if (activeTab === 'ACTIVE') return b.status === 'ACTIVE' || b.status === 'CONFIRMED';
    if (activeTab === 'COMPLETED') return b.status === 'COMPLETED';
    return true;
  });

  if (loading) return <div className="p-8 text-center text-slate-400">Loading bookings...</div>;

  return (
    <div className="space-y-6">

      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 border border-white/10">
        <div>
          <h2 className="text-xl font-black text-white">Host Booking Management</h2>
          <p className="text-xs text-slate-400">Review guest reservation requests and active trips</p>
        </div>

        <div className="flex gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl">
          {(['ALL', 'PENDING', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-[#F5B301] text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="glass-card p-12 border border-white/10 text-center text-slate-400">
          <p className="text-sm font-bold text-white mb-2">No bookings found</p>
          <p className="text-xs">Bookings will appear here once guests make reservations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div key={b.id} className="glass-card p-6 border border-white/10 space-y-4">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-amber-500/30 text-[#F5B301] font-bold text-xs">
                    #{b.vehicleId}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      Trip #{b.id}
                    </h3>
                    <p className="text-xs text-slate-400">Vehicle #{b.vehicleId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                    b.status === 'PENDING_APPROVAL'
                      ? 'bg-amber-500/20 text-[#F5B301] border-amber-500/30 animate-pulse'
                      : b.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : b.status === 'CONFIRMED'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : 'bg-slate-800 text-slate-400 border-white/10'
                  }`}>
                    {b.status.replace('_', ' ')}
                  </span>
                  <span className="text-lg font-black text-white">${b.totalPrice}</span>
                </div>
              </div>

              {/* Trip Info Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#F5B301]" />
                  <span>{b.startDate} to {b.endDate}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                {b.status === 'PENDING_APPROVAL' && (
                  <>
                    <button
                      onClick={() => handleAction(b.id, 'CONFIRMED')}
                      className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> Accept Booking
                    </button>
                    <button
                      onClick={() => handleAction(b.id, 'REJECTED')}
                      className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 text-rose-400 hover:text-rose-300"
                    >
                      <X className="w-4 h-4" /> Decline
                    </button>
                  </>
                )}

                <Link href="/host/messages" className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Message Guest
                </Link>
                <Link href={`/trips/${b.id}/check-in`} className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Check Inspection
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
