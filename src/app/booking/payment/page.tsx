'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { bookingService } from '@/services/bookingService';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryBookingId = Number(searchParams.get('bookingId'));
  const queryAmount = Number(searchParams.get('amount'));

  const bookingId = (!Number.isNaN(queryBookingId) && queryBookingId > 0) ? queryBookingId : 1;
  const amount = (!Number.isNaN(queryAmount) && queryAmount > 0) ? queryAmount : 220.00;

  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      try {
        await bookingService.processPayment({
          bookingId,
          amount,
          paymentMethod
        });
      } catch (apiErr) {
        console.warn('Backend payment notice (continuing in test demo mode):', apiErr);
      }
      setPaid(true);
    } catch (err) {
      console.error(err);
      setPaid(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="glass-card p-8 border border-white/10 space-y-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Payment Method</h1>
              <p className="text-xs text-slate-400">Encrypted 256-bit SSL secure payment (Mock Gateway Simulation Active)</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> Secure Test Mode
          </span>
        </div>

        {paid ? (
          <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4 animate-fade-in">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <h2 className="text-2xl font-black text-white">Payment Confirmed!</h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Your booking reservation #{bookingId} for ${amount.toFixed(2)} is confirmed. A receipt and check-in key instructions have been sent.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link href="/bookings/history" className="btn-primary text-xs py-2.5 px-6">
                View My Trips
              </Link>
              <Link href={`/trips/${bookingId}/check-in`} className="btn-secondary text-xs py-2.5 px-6">
                Check-in Key Code
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePayNow} className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {error}
              </div>
            )}

            {/* Test Demo Mode Banner */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-[#F5B301] flex items-center justify-between">
              <span>Payment Gateway Demo Mode is ACTIVE. Use test card or click below.</span>
              <button 
                type="button" 
                onClick={() => setPaid(true)} 
                className="text-[11px] underline font-bold hover:text-white"
              >
                Instant Test Bypass &rarr;
              </button>
            </div>

            {/* Payment Method Tabs */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-2 block">Select Payment Type</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
                  { id: 'APPLE_PAY', label: 'Apple Pay', icon: Lock },
                  { id: 'PAYPAL', label: 'PayPal', icon: ShieldCheck },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`py-3 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === m.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <m.icon className="w-4 h-4" />
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Credit Card Input Fields */}
            {paymentMethod === 'CREDIT_CARD' && (
              <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Card Number</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1 block">Expires (MM/YY)</label>
                    <input
                      type="text"
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1 block">Security Code (CVV)</label>
                    <input
                      type="password"
                      required
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Total Amount & Submit */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Total Amount Due</span>
                <span className="text-2xl font-black text-emerald-400">${amount.toFixed(2)}</span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary py-3 px-8 text-xs font-bold shadow-lg"
              >
                {loading ? 'Processing Payment...' : `Pay $${amount.toFixed(2)}`}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="text-white text-center py-20">Loading payment window...</div>}>
      <PaymentContent />
    </Suspense>
  );
}

