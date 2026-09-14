'use client';

import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookmarkCheck, Calendar, MapPin, User, ShieldCheck, ArrowRight, ArrowLeft, Lock, LogIn } from 'lucide-react';
import { bookingService } from '@/services/bookingService';
import { vehicleService, Vehicle } from '@/services/vehicleService';
import { authService } from '@/services/authService';

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleId = Number(searchParams.get('vehicleId'));
  const urlTotal = Number(searchParams.get('total')) || 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const futureStr = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const startDate = searchParams.get('startDate') || todayStr;
  const endDate = searchParams.get('endDate') || futureStr;

  const days = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      setIsAuthenticated(Boolean(token));
    }

    const loadVehicle = async () => {
      if (!vehicleId) return;
      try {
        const v = await vehicleService.getVehicleById(vehicleId);
        setVehicle(v);
      } catch (err) {
        console.error('Failed to load vehicle for checkout:', err);
      } finally {
        setLoading(false);
      }
    };
    loadVehicle();
  }, [vehicleId]);

  const dailyRate = vehicle?.dailyRate ?? 0;
  const subtotal = dailyRate * days;
  const serviceFee = 25;
  const calculatedTotal = subtotal > 0 ? (subtotal + serviceFee) : 0;
  const finalTotalDue = urlTotal > 0 ? urlTotal : calculatedTotal;

  const loginRedirectUrl = `/auth/login?redirect=${encodeURIComponent(`/booking/checkout?vehicleId=${vehicleId}&total=${finalTotalDue}&startDate=${startDate}&endDate=${endDate}`)}`;

  const handleProceedToPayment = async () => {
    if (!isAuthenticated) {
      router.push(loginRedirectUrl);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const booking = await bookingService.createBooking({
        vehicleId,
        startDate,
        endDate
      });
      router.push(`/booking/payment?bookingId=${booking.id}&amount=${finalTotalDue.toFixed(2)}`);
    } catch (err: unknown) {
      const apiErr = err as { response?: { status?: number; data?: { message?: string } } };
      if (apiErr?.response?.status === 401) {
        setError('Authentication Required: You must be signed in as a registered user to complete a booking.');
        setIsAuthenticated(false);
      } else {
        setError(apiErr?.response?.data?.message || 'Failed to create booking reservation. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center text-slate-400">Loading checkout details...</div>;
  }

  return (
    <div className="glass-card p-8 border border-white/10 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Review Reservation Details</h1>
            <p className="text-xs text-slate-400">Confirm trip details before proceeding to payment</p>
          </div>
        </div>
        <button onClick={() => router.back()} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>

      {/* Auth Banner Prompt if User Not Signed In */}
      {!isAuthenticated && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-amber-200 text-sm">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Sign In Required To Reserve Vehicle</span>
          </div>
          <p className="text-slate-300">
            You must be signed in with a user account to finalize your booking reservation.
          </p>
          <div className="pt-1 flex items-center gap-3">
            <Link
              href={loginRedirectUrl}
              className="btn-primary text-xs py-2 px-5 font-bold inline-flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In to Continue</span>
            </Link>
            <Link
              href={`/auth/register?redirect=${encodeURIComponent(loginRedirectUrl)}`}
              className="text-xs text-amber-400 underline font-semibold hover:text-amber-200"
            >
              Create New Account
            </Link>
          </div>
        </div>
      )}

      {/* Vehicle Summary Box */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
        {vehicle?.imageUrl ? (
          <img
            src={vehicle.imageUrl}
            alt={vehicle.model}
            className="w-24 h-16 object-cover rounded-lg"
          />
        ) : (
          <div className="w-24 h-16 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] text-slate-500">
            No image
          </div>
        )}
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white">
            {vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : 'Vehicle'}
          </h3>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {vehicle?.locationCity || 'Location TBD'} • Pick-up & Drop-off
          </p>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" /> {startDate} to {endDate} ({days} {days === 1 ? 'day' : 'days'})
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Driver Information</h4>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-white font-bold block">Primary Driver</span>
              <span className="text-slate-400">Verified Driver&apos;s License • Full Coverage</span>
            </div>
          </div>
          <Link href="/verification" className="text-emerald-400 font-semibold hover:underline">
            Edit ID
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
          <p className="font-semibold">{error}</p>
          {error.includes('Authentication') && (
            <div className="pt-1">
              <Link 
                href={loginRedirectUrl}
                className="btn-primary text-xs py-1.5 px-4 inline-block font-bold"
              >
                Sign In Now &rarr;
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Itemized Price Summary */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 text-xs">
        <div className="flex justify-between items-center text-slate-300">
          <span>Rental Subtotal ({days} {days === 1 ? 'day' : 'days'} @ ${dailyRate}/day)</span>
          <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Cleanliness & Standard Service Fee</span>
          <span className="font-semibold text-white">${serviceFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Liability Protection</span>
          <span className="font-semibold text-emerald-400">Included</span>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <div>
          <span className="text-xs text-slate-300 block font-medium">Total Due Now</span>
          <span className="text-2xl font-black text-emerald-400">${finalTotalDue.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Instant Confirmation</span>
        </div>
      </div>

      <button
        onClick={handleProceedToPayment}
        disabled={submitting}
        className="w-full btn-primary py-3.5 text-xs flex items-center justify-center gap-2"
      >
        {!isAuthenticated ? (
          <>
            <Lock className="w-4 h-4" />
            <span>Sign In to Proceed with Booking</span>
          </>
        ) : (
          <>
            <span>{submitting ? 'Securing Booking...' : `Proceed to Payment ($${finalTotalDue.toFixed(2)})`}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}

export default function BookingCheckoutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Suspense fallback={<div className="text-center text-slate-400">Loading Checkout...</div>}>
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
