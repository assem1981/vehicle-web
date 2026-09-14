'use client';

import React, { useState } from 'react';
import { Star, EyeOff, ShieldCheck, Check } from 'lucide-react';

export default function AdminReviewsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleToggleHide = (id: string) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: r.status === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED' } : r));
  };

  return (
    <div className="space-y-6">

      <div className="glass-card p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Marketplace Reviews Moderation</h2>
          <p className="text-xs text-slate-400">Moderate customer ratings, feedback comments, and inappropriate review flags</p>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-12 border border-white/10 text-center text-slate-400">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="glass-card p-12 border border-white/10 text-center text-slate-400">
          <p className="text-sm font-bold text-white mb-2">No reviews to moderate</p>
          <p className="text-xs">Review data will appear here once the moderation API is available.</p>
        </div>
      ) : (
        <div className="glass-card p-6 border border-white/10 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3">Vehicle</th>
                <th className="pb-3">Author</th>
                <th className="pb-3">Rating</th>
                <th className="pb-3">Review Comment</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-white/5 transition-all">
                  <td className="py-3 font-bold text-white">{r.vehicle}</td>
                  <td className="py-3">{r.author}</td>
                  <td className="py-3 font-bold text-[#F5B301]">★ {r.rating}.0</td>
                  <td className="py-3 max-w-xs truncate text-slate-300">{r.comment}</td>
                  <td className="py-3">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      r.status === 'PUBLISHED'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleToggleHide(r.id)}
                      className="btn-secondary text-[11px] py-1 px-3"
                    >
                      {r.status === 'PUBLISHED' ? 'Hide Review' : 'Publish'}
                    </button>
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
