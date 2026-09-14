'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookmarkCheck, Calendar, MapPin, Key, LogOut as CheckOutIcon, MessageSquare, Star, ArrowRight } from 'lucide-react';
import { bookingService, Booking } from '@/services/bookingService';

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'CONFIRMED' | 'COMPLETED'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await bookingService.getMyBookings();
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load bookings:', err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, []);

  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const filtered = safeBookings.filter(b => activeTab === 'ALL' || b.status === activeTab);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">My Trips & Bookings</h1>
          <p className="text-xs text-slate-400 mt-1">Manage your active reservations, check-ins, and past trips</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl">
          {(['ALL', 'CONFIRMED', 'COMPLETED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab 
                  ? 'bg-[#F5B301] text-slate-950 font-bold shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'ALL' ? 'All Trips' : tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(n => <div key={n} className="h-32 glass-card animate-pulse"></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400 space-y-3">
          <BookmarkCheck className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-white">No trips found</h3>
          <p className="text-xs">Explore cars and book your next road trip!</p>
          <Link href="/search" className="btn-primary inline-block text-xs py-2 px-4 mt-2">
            Explore Cars
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div key={b.id} className="glass-card p-6 border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-[#F5B301] text-lg border border-amber-500/20">
                  #{b.id}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-white">Trip Booking #{b.id}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      b.status === 'CONFIRMED'
                        ? 'bg-amber-500/20 text-[#F5B301] border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#F5B301]" /> {b.startDate} to {b.endDate}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> Vehicle #{b.vehicleId} • Total: ${b.totalPrice}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/trips/${b.id}/check-in`} className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" /> Check-in
                </Link>
                <Link href={`/trips/${b.id}/check-out`} className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5">
                  <CheckOutIcon className="w-3.5 h-3.5" /> Check-out
                </Link>
                <Link href="/messages" className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Chat
                </Link>
                <Link href="/reviews" className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Review
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
