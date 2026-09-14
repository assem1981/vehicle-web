'use client';

import React, { useState } from 'react';
import { CalendarDays, Car, User, DollarSign, Ban, ShieldCheck } from 'lucide-react';

export default function AdminBookingsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCancelBooking = (id: number) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: 'CANCELLED_BY_ADMIN' } : b));
  };

  return (
    <div className="space-y-6">

      <div className="glass-card p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Global Bookings Ledger</h2>
          <p className="text-xs text-slate-400">Platform-wide reservation oversight and administrative cancellation controls</p>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-12 border border-white/10 text-center text-slate-400">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="glass-card p-12 border border-white/10 text-center text-slate-400">
          <p className="text-sm font-bold text-white mb-2">No bookings found</p>
          <p className="text-xs">Platform booking data will appear here once the admin ledger API is available.</p>
        </div>
      ) : (
        <div className="glass-card p-6 border border-white/10 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3">Trip ID</th>
                <th className="pb-3">Vehicle</th>
                <th className="pb-3">Renter & Host</th>
                <th className="pb-3">Trip Dates</th>
                <th className="pb-3">Total GMV</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-white/5 transition-all">
                  <td className="py-3 font-mono font-bold text-white">#{b.id}</td>
                  <td className="py-3 font-bold text-white">{b.vehicleName}</td>
                  <td className="py-3">
                    <span className="text-white font-medium block">Renter: {b.renterName}</span>
                    <span className="text-[11px] text-slate-400 block">Host: {b.hostName}</span>
                  </td>
                  <td className="py-3">{b.dates}</td>
                  <td className="py-3 font-extrabold text-[#F5B301]">${b.totalPrice}</td>
                  <td className="py-3">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      b.status === 'ACTIVE' || b.status === 'CONFIRMED'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : b.status === 'COMPLETED'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}>
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {b.status !== 'CANCELLED_BY_ADMIN' && b.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="btn-secondary text-[11px] py-1 px-3 text-rose-400 hover:text-rose-300"
                      >
                        Force Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
