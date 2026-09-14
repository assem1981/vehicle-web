'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { LogOut, Gauge, Fuel, Camera, CheckCircle2, ArrowLeft } from 'lucide-react';
import { bookingService } from '@/services/bookingService';

export default function CheckOutPage() {
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

  const handleCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await bookingService.submitCheckRecord({
        bookingId,
        type: 'CHECK_OUT',
        odometer: Number(odometer),
        fuelLevel: Number(fuelLevel),
        notes
      });
      setSubmitted(true);
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Check-out submission failed. Please try again.');
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
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Return Digital Check-out</h1>
              <p className="text-xs text-slate-400">Lock vehicle & submit final condition for Trip #{isValidId ? bookingId : '—'}</p>
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
          <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
            <h3 className="text-2xl font-bold text-white">Trip Ended & Checked Out!</h3>
            <p className="text-xs text-slate-300">
              Keys returned and lockbox secured. Don&apos;t forget to leave a review for your host!
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <Link href="/reviews" className="btn-primary text-xs py-2.5 px-6">
                Leave a Review
              </Link>
              <Link href="/bookings/history" className="btn-secondary text-xs py-2.5 px-6">
                Back to My Trips
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCheckOut} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-emerald-400" /> Final Odometer (Miles)
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
                  <Fuel className="w-4 h-4 text-emerald-400" /> Final Fuel / Battery ({fuelLevel}%)
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

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-400" /> Return Inspection Photos
              </label>
              <div className="border-2 border-dashed border-white/15 rounded-2xl p-4 text-center bg-white/[0.02] cursor-pointer hover:border-emerald-500/40">
                <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="text-xs text-slate-300 font-medium">Upload photo of key inside lockbox & fuel gauge</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Return Notes / Comments</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="All clear, parked at specified location..."
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-xs flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Submitting Return...' : 'Complete Check-out & Return Key'}</span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
