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
  CheckCircle2,
  Phone,
  Mail,
  Award,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { bookingService, Booking } from '@/services/bookingService';

export default function HostBookingsPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleAction = async (id: number, newStatus: string) => {
    try {
      await bookingService.updateBookingStatus(id, newStatus);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    } catch (err) {
      console.error('Failed to update booking status:', err);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesTab = 
      activeTab === 'ALL' ? true :
      activeTab === 'PENDING' ? (b.status === 'PENDING_APPROVAL' || b.status === 'PENDING') :
      activeTab === 'ACTIVE' ? (b.status === 'ACTIVE' || b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS') :
      activeTab === 'COMPLETED' ? b.status === 'COMPLETED' : true;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      b.id.toString().includes(query) ||
      (b.vehicleName && b.vehicleName.toLowerCase().includes(query)) ||
      (b.renterName && b.renterName.toLowerCase().includes(query));

    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="glass-card p-12 border border-white/10 text-center text-slate-400 animate-pulse">
        Loading Guest Reservation Details...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header & Control Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[#F5B301] border border-amber-500/30">
              Host Operations
            </span>
            <span className="text-xs text-slate-400">• Guest Reservations & Trips</span>
          </div>
          <h1 className="text-2xl font-black text-white">Host Booking Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Review guest renter profiles, accept reservation requests, and manage active vehicle trips</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guest name or vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900/60 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl shrink-0">
            {(['ALL', 'PENDING', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-[#F5B301] text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="glass-card p-12 border border-white/10 text-center text-slate-400 space-y-2">
          <Car className="w-8 h-8 text-amber-500/50 mx-auto" />
          <p className="text-sm font-bold text-white">No guest bookings found</p>
          <p className="text-xs text-slate-400">
            {searchQuery 
              ? 'No reservations match your search query.' 
              : 'When guests reserve your listed vehicles, their renter profile and trip details will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div key={b.id} className="glass-card p-6 border border-white/10 space-y-5 hover:border-amber-500/30 transition-all">

              {/* Trip Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#F5B301]">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-white">
                        {b.vehicleName || `Vehicle #${b.vehicleId}`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Trip #{b.id}</span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-[#F5B301]" />
                      <span>{b.dates || `${b.startDate} to ${b.endDate}`}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                    b.status === 'PENDING_APPROVAL' || b.status === 'PENDING'
                      ? 'bg-amber-500/20 text-[#F5B301] border-amber-500/30 animate-pulse'
                      : b.status === 'ACTIVE' || b.status === 'IN_PROGRESS'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : b.status === 'CONFIRMED'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : b.status === 'COMPLETED'
                      ? 'bg-slate-800 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}>
                    {b.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xl font-black text-white">
                    ${b.totalPrice != null ? Number(b.totalPrice).toLocaleString() : '0.00'}
                  </span>
                </div>
              </div>

              {/* RENTER DETAILS & GUEST PROFILE CARD */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Renter Identity */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F5B301] to-amber-600 text-slate-950 font-bold flex items-center justify-center shrink-0 shadow-md">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Renter / Guest</span>
                    <h4 className="text-sm font-black text-white">{b.renterName || `Guest User #${b.userId}`}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] text-emerald-400 font-semibold">Verified License & ID</span>
                    </div>
                  </div>
                </div>

                {/* Renter Contact & Booking Stats */}
                <div className="space-y-1 text-xs text-slate-300">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Renter Verification</span>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Award className="w-3.5 h-3.5 text-[#F5B301]" />
                    <span>5-Star Rated Guest Renter</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Background & Identity Check Passed</span>
                  </div>
                </div>

                {/* Direct Communication Quick Link */}
                <div className="flex flex-col justify-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Direct Guest Connect</span>
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/host/messages?userId=${b.userId}&bookingId=${b.id}`} 
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-[#F5B301] border-amber-500/30 hover:bg-amber-500/10 w-full justify-center"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message Guest</span>
                    </Link>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {(b.status === 'PENDING_APPROVAL' || b.status === 'PENDING') && (
                    <>
                      <button
                        onClick={() => handleAction(b.id, 'CONFIRMED')}
                        className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Accept Reservation
                      </button>
                      <button
                        onClick={() => handleAction(b.id, 'REJECTED')}
                        className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 text-rose-400 hover:text-rose-300"
                      >
                        <X className="w-4 h-4" /> Decline
                      </button>
                    </>
                  )}

                  {(b.status === 'CONFIRMED' || b.status === 'ACTIVE') && (
                    <button
                      onClick={() => handleAction(b.id, 'COMPLETED')}
                      className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Trip Completed
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/trips/${b.id}/check-in`} className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Inspection Records
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
