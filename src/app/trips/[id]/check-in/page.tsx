'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Key, Gauge, Fuel, Camera, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { bookingService } from '@/services/bookingService';

export default function CheckInPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id;

  const [odometer, setOdometer] = useState('');
  const [fuelLevel, setFuelLevel] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const bookingId = Number(tripId);
  const isValidId = !Number.isNaN(bookingId) && bookingId > 0;

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await bookingService.submitCheckRecord({
        bookingId,
        type: 'CHECK_IN',
        odometer: Number(odometer),
        fuelLevel: Number(fuelLevel),
        notes
      });
      setSubmitted(true);
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Check-in submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="glass-card p-8 border border-white/10">
        
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Pickup Digital Check-in</h1>
              <p className="text-xs text-slate-400">Unlock car & record initial vehicle condition for Trip #{isValidId ? bookingId : '—'}</p>
            </div>
          </div>
          <Link href="/bookings/history" className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Trips
          </Link>
        </div>

        {!isValidId ? (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center text-red-400">
            <p className="text-sm font-semibold">Invalid trip ID.</p>
            <p className="text-xs mt-1">Please select a booking from your trip history.</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center text-red-400">
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Check-in Complete!</h3>
            <p className="text-xs text-slate-300">Odometer reading & pickup records saved. Have a safe trip!</p>
            <Link href="/bookings/history" className="btn-primary text-xs inline-block py-2.5 px-6 mt-2">
              Return to My Trips
            </Link>
          </div>
        ) : (
          <form onSubmit={handleCheckIn} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-emerald-400" /> Current Odometer (Miles)
                </label>
                <input
                  type="number"
                  required
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block flex items-center gap-1.5">
                  <Fuel className="w-4 h-4 text-emerald-400" /> Fuel / Battery Level ({fuelLevel}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={fuelLevel}
                  onChange={(e) => setFuelLevel(e.target.value)}
                  className="w-full h-2 accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer mt-3"
                />
              </div>
            </div>

            {/* Photo Inspection Upload */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-400" /> Pickup Vehicle Inspection Photos
              </label>
              <div className="border-2 border-dashed border-white/15 rounded-2xl p-4 text-center bg-white/[0.02] cursor-pointer hover:border-emerald-500/40">
                <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="text-xs text-slate-300 font-medium">Upload photos of 4 sides & dashboard</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Pre-existing Scratches or Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mention any existing scratches, minor dents or notes..."
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-xs flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Submitting Check-in...' : 'Complete Check-in & Start Trip'}</span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
