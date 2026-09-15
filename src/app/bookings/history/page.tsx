'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookmarkCheck, Calendar, MapPin, Key, LogOut as CheckOutIcon, MessageSquare, Star, ArrowRight } from 'lucide-react';
import { bookingService, Booking } from '@/services/bookingService';
import { authService } from '@/services/authService';

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'CONFIRMED' | 'COMPLETED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isHostRole, setIsHostRole] = useState<boolean>(false);
  const [isAdminRole, setIsAdminRole] = useState<boolean>(false);

  useEffect(() => {
    const user = authService.getUserFromStorage();
    if (user && user.id) {
      setCurrentUserId(user.id);
      const roles = user.roles || [];
      if (roles.includes('ROLE_ADMIN') || roles.includes('ADMIN')) {
        setIsAdminRole(true);
      }
      if (roles.includes('ROLE_HOST') || roles.includes('HOST')) {
        setIsHostRole(true);
      }
    }
  }, []);

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
          {[1, 2, 3].map(n => <div key={n} className="h-32 glass-card animate-pulse"></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400 space-y-3 border border-white/10">
          <BookmarkCheck className="w-12 h-12 mx-auto text-amber-500/50" />
          <h3 className="text-lg font-bold text-white">No trips found</h3>
          <p className="text-xs max-w-md mx-auto text-slate-400">
            You don't have any {activeTab !== 'ALL' ? activeTab.toLowerCase() : ''} bookings yet. Explore our premium fleet and book your next trip!
          </p>
          <Link href="/search" className="btn-primary inline-flex items-center gap-2 text-xs py-2.5 px-5 mt-3 font-bold">
            Explore Cars <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => {
            const isUserHostForTrip = Boolean(
              (currentUserId && b.hostId && currentUserId === b.hostId) || isHostRole
            );

            let chatLinkHref = `/messages?hostId=${b.hostId || 1}&bookingId=${b.id}`;
            let chatLabel = 'Chat Host';

            if (isAdminRole) {
              chatLinkHref = `/messages?bookingId=${b.id}&hostId=${b.hostId || 1}&userId=${b.userId || 2}&role=admin`;
              chatLabel = 'Chat Parties (Renter & Host)';
            } else if (isUserHostForTrip) {
              chatLinkHref = `/host/messages?userId=${b.userId}&bookingId=${b.id}`;
              chatLabel = 'Chat Renter';
            }

            return (
              <div key={b.id} className="glass-card p-6 border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-amber-500/30 transition-all">
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-800 flex flex-col items-center justify-center font-black text-[#F5B301] text-sm border border-amber-500/30 shrink-0">
                    <span className="text-[10px] text-slate-400 font-normal">TRIP</span>
                    #{b.id}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-base font-bold text-white">
                        {b.vehicleName || `Trip Reservation #${b.id}`}
                      </h3>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        b.status === 'CONFIRMED'
                          ? 'bg-amber-500/20 text-[#F5B301] border-amber-500/30'
                          : b.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#F5B301]" /> {b.dates || `${b.startDate} to ${b.endDate}`}
                    </p>
                    <div className="text-xs text-slate-400 flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" /> Host: <strong className="text-slate-200">{b.hostName || 'Executive Host'}</strong>
                      </span>
                      <span>•</span>
                      <span className="text-[#F5B301] font-bold">
                        Total: ${b.totalPrice}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                  <Link href={`/trips/${b.id}/check-in`} className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 font-bold shadow-sm">
                    <Key className="w-3.5 h-3.5" /> Check-in
                  </Link>
                  <Link href={`/trips/${b.id}/check-out`} className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5">
                    <CheckOutIcon className="w-3.5 h-3.5" /> Check-out
                  </Link>
                  <Link href={chatLinkHref} className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 text-[#F5B301] border-amber-500/30 hover:bg-amber-500/10">
                    <MessageSquare className="w-3.5 h-3.5" /> {chatLabel}
                  </Link>
                  <Link href="/reviews" className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Review
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
