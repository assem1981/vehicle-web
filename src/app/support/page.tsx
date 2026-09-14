'use client';

import React, { useState } from 'react';
import { HelpCircle, ShieldAlert, PhoneCall, CheckCircle2, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { chatService } from '@/services/chatService';

export default function SupportPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [claimBookingId, setClaimBookingId] = useState('');
  const [claimDescription, setClaimDescription] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [loading, setLoading] = useState(false);

  const faqs = [
    { q: 'How does insurance and liability coverage work?', a: 'Every trip is covered by up to $750,000 in liability protection insurance and includes 24/7 emergency roadside assistance.' },
    { q: 'What is required for digital check-in pickup?', a: 'You will need a valid driver license verified in the app, plus the 4-digit key lockbox code sent automatically 1 hour prior to trip start.' },
    { q: 'What happens if there is accidental damage during a trip?', a: 'Report the incident immediately using the File a Claim form below. Our claims team will review damage documentation and contact you.' },
    { q: 'Can I extend my trip while driving?', a: 'Yes! Navigate to My Trips, select Extend Trip, and choose your new end date subject to host vehicle availability.' },
  ];

  const handleFileClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimError('');
    setLoading(true);

    const bookingId = Number(claimBookingId);
    const amount = Number(claimAmount);
    if (Number.isNaN(bookingId) || bookingId <= 0) {
      setClaimError('Please enter a valid booking ID.');
      setLoading(false);
      return;
    }

    try {
      await chatService.fileClaim(bookingId, claimDescription, amount);
      setClaimSubmitted(true);
    } catch (err) {
      setClaimError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to submit claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      
      {/* Support Header Banner */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <HelpCircle className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-black text-white">How Can We Help You?</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          24/7 customer support, claims management, roadside assistance, and safety guidance.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="glass-card p-6 border border-white/10 space-y-4">
        <h2 className="text-base font-bold text-white mb-4">Frequently Asked Questions</h2>
        {faqs.map((f, i) => (
          <div key={i} className="border border-white/5 rounded-xl overflow-hidden bg-white/[0.02]">
            <button
              onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              className="w-full p-4 text-left flex justify-between items-center text-xs font-bold text-white hover:text-emerald-400 transition-colors"
            >
              <span>{f.q}</span>
              {activeFaq === i ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>
            {activeFaq === i && (
              <div className="px-4 pb-4 text-xs text-slate-400 border-t border-white/5 pt-3 leading-relaxed">
                {f.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Claims & Damage Incident Filing Form */}
      <div className="glass-card p-6 border border-red-500/20 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">File a Damage & Incident Claim</h2>
            <p className="text-xs text-slate-400">Report accidents, scratches, or vehicle claims to Turo Security</p>
          </div>
        </div>

        {claimError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
            {claimError}
          </div>
        )}

        {claimSubmitted ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2 text-emerald-400">
            <CheckCircle2 className="w-10 h-10 mx-auto" />
            <h3 className="text-base font-bold text-white">Claim Incident Filed</h3>
            <p className="text-xs text-slate-300">
              Claim ticket has been opened. Our insurance team will contact you within 2 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleFileClaim} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Booking ID #</label>
                <input
                  type="number"
                  required
                  value={claimBookingId}
                  onChange={(e) => setClaimBookingId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Estimated Damage ($)</label>
                <input
                  type="number"
                  required
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Incident Description</label>
              <textarea
                rows={3}
                required
                value={claimDescription}
                onChange={(e) => setClaimDescription(e.target.value)}
                placeholder="Describe what happened, location of damage, and involved parties..."
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-500/20"
            >
              {loading ? 'Filing Incident Ticket...' : 'Submit Claim Ticket'}
            </button>

          </form>
        )}
      </div>

    </div>
  );
}
