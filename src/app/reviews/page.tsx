'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Star, CheckCircle2, ArrowLeft } from 'lucide-react';
import RatingStars from '@/components/RatingStars';
import { chatService } from '@/services/chatService';

function ReviewsContent() {
  const searchParams = useSearchParams();
  const bookingId = Number(searchParams.get('bookingId'));
  const vehicleId = Number(searchParams.get('vehicleId'));

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId || !vehicleId) {
      setError('Missing booking or vehicle information.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await chatService.submitReview(bookingId, vehicleId, rating, comment);
      setSubmitted(true);
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="glass-card p-8 border border-white/10">

        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Rate & Review Your Trip</h1>
              <p className="text-xs text-slate-400">Share your experience with the host and vehicle</p>
            </div>
          </div>
          <Link href="/bookings/history" className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
        </div>

        {submitted ? (
          <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Thank You for Your Feedback!</h3>
            <p className="text-xs text-slate-300">Your review helps keep the MyMotionLux community safe and high-quality.</p>
            <Link href="/bookings/history" className="btn-primary text-xs inline-block py-2.5 px-6 mt-2">
              Back to My Trips
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-6">

            <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="text-xs font-semibold text-slate-300 block">Overall Trip Rating</span>
              <div className="flex justify-center">
                <RatingStars rating={rating} onRate={(r) => setRating(r)} size={32} />
              </div>
              <span className="text-sm font-bold text-amber-400 block">{rating} out of 5 Stars</span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Written Review & Feedback</label>
              <textarea
                rows={4}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the car cleanliness, host communication, and driving experience?"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-xs flex items-center justify-center gap-2"
            >
              <Star className="w-4 h-4 fill-white" />
              <span>{loading ? 'Submitting Review...' : 'Publish Review'}</span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={<div className="text-center text-slate-400 py-12">Loading review page...</div>}>
      <ReviewsContent />
    </Suspense>
  );
}
