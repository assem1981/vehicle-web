'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { DollarSign, Tag, CheckCircle2, ArrowRight, ShieldCheck, ArrowLeft, Calendar, AlertCircle } from 'lucide-react';
import { vehicleService, Vehicle } from '@/services/vehicleService';
import { bookingService, Booking } from '@/services/bookingService';
import { api } from '@/services/api';

export default function PricingBreakdownPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const vehicleId = Number(params.id);

  const todayStr = new Date().toISOString().split('T')[0];
  const futureStr = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const urlStart = searchParams.get('startDate');
  const urlEnd = searchParams.get('endDate');

  const [startDate, setStartDate] = useState(urlStart || todayStr);
  const [endDate, setEndDate] = useState(urlEnd || futureStr);

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [v, bList] = await Promise.all([
          vehicleService.getVehicleById(vehicleId),
          bookingService.getBookingsByVehicle(vehicleId)
        ]);
        setVehicle(v);
        setBookings(bList);
        if (startDate && endDate) {
          try {
            const price = await vehicleService.calculatePrice(vehicleId, startDate, endDate);
            setCalculatedPrice(Number(price));
          } catch {
            setCalculatedPrice(null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch pricing:', err);
      } finally {
        setLoading(false);
      }
    };
    if (vehicleId) load();
  }, [vehicleId, startDate, endDate]);

  const hasOverlap = React.useMemo(() => {
    if (!startDate || !endDate || startDate > endDate) return false;
    const reservedSet = new Set<string>();
    bookings.forEach((b) => {
      if (b.status && b.status.toUpperCase() === 'CANCELLED') return;
      if (!b.startDate || !b.endDate) return;
      const curr = new Date(b.startDate);
      const last = new Date(b.endDate);
      while (curr <= last) {
        reservedSet.add(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
      }
    });

    const curr = new Date(startDate);
    const last = new Date(endDate);
    while (curr <= last) {
      if (reservedSet.has(curr.toISOString().split('T')[0])) return true;
      curr.setDate(curr.getDate() + 1);
    }
    return false;
  }, [startDate, endDate, bookings]);

  const dailyRate = vehicle?.dailyRate ?? 0;
  const days = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;

  const subtotal = calculatedPrice && calculatedPrice > 0 ? calculatedPrice : (dailyRate * days);
  const discountAmount = (subtotal * discountPercent) / 100;
  const serviceFee = 25;
  const finalTotal = subtotal - discountAmount + serviceFee;

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    try {
      const response = await api.post('/api/promotions/validate', null, { params: { code: promoCode } });
      const promo = response.data;
      if (promo && promo.discountPercentage) {
        setDiscountPercent(Number(promo.discountPercentage));
        setPromoApplied(true);
      } else {
        setPromoError('Invalid or expired promo code.');
      }
    } catch (err) {
      setPromoError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to validate promo code.');
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-slate-400">Loading pricing...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="glass-card p-8 border border-white/10 space-y-6">

        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Price Calculation Breakdown</h1>
              <p className="text-xs text-slate-400">Review rates, rental duration, fees, and promo discounts</p>
            </div>
          </div>
          <Link href={`/vehicles/${vehicleId}`} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
        </div>

        {/* Date Selection Bar */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" /> Rental Dates ({days} {days === 1 ? 'Day' : 'Days'})
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Pick-up Date</span>
              <input
                type="date"
                value={startDate}
                min={todayStr}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Return Date</span>
              <input
                type="date"
                value={endDate}
                min={startDate || todayStr}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Breakdown Items */}
        <div className="space-y-4 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-slate-400">Daily Base Rate (${dailyRate} x {days} {days === 1 ? 'day' : 'days'})</span>
            <span className="text-white font-bold">${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-slate-400">Cleanliness & Standard Service Fee</span>
            <span className="text-white font-bold">${serviceFee.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Liability Protection
            </span>
            <span className="text-emerald-400 font-bold">Included</span>
          </div>

          {promoApplied && (
            <div className="flex justify-between items-center py-2 border-b border-white/5 text-emerald-400">
              <span className="flex items-center gap-1.5 font-semibold">
                <Tag className="w-4 h-4" /> Promo Discount ({discountPercent}%)
              </span>
              <span className="font-bold">-${discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline pt-4 text-lg font-bold border-t border-white/10">
            <span className="text-white">Total Estimated Cost</span>
            <span className="text-2xl font-black text-emerald-400">${finalTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Promo Code Form */}
        <form onSubmit={handleApplyPromo} className="p-4 rounded-xl bg-white/5 border border-white/10">
          <label className="text-xs font-semibold text-slate-300 mb-2 block flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-emerald-400" /> Have a Promo Code?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="e.g. SUMMER20"
              className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs uppercase focus:outline-none focus:border-emerald-500"
            />
            <button type="submit" className="btn-secondary text-xs py-2 px-4">
              Apply
            </button>
          </div>
          {promoError && <p className="text-[11px] text-red-400 mt-1.5">{promoError}</p>}
          {promoApplied && <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Promo code applied successfully!</p>}
        </form>

        {/* Overlap Warning Box */}
        {hasOverlap && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-rose-200">Selected Dates Unavailable</h4>
              <p className="mt-0.5">
                The selected dates ({startDate} to {endDate}) overlap with an existing booking for this vehicle. Please choose available dates.
              </p>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <Link
          href={!hasOverlap ? `/booking/checkout?vehicleId=${vehicleId}&total=${finalTotal.toFixed(2)}&startDate=${startDate}&endDate=${endDate}` : '#'}
          aria-disabled={hasOverlap}
          className={`w-full btn-primary py-3.5 text-xs flex items-center justify-center gap-2 transition-all ${
            hasOverlap ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
          }`}
        >
          <span>{hasOverlap ? 'Selected Dates Are Reserved' : 'Continue to Booking Checkout'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

      </div>
    </div>
  );
}
