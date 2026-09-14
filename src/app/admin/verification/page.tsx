'use client';

import React, { useState } from 'react';
import { ShieldCheck, Check, X, Eye, FileText, AlertCircle } from 'lucide-react';

export default function AdminVerificationPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAction = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setItems(items.map(i => i.id === id ? { ...i, status } : i));
  };

  return (
    <div className="space-y-6">

      <div className="glass-card p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Identity Verification Queue</h2>
          <p className="text-xs text-slate-400">Inspect host and renter government photo IDs and tax compliance documents</p>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-12 border border-white/10 text-center text-slate-400">Loading verification queue...</div>
      ) : items.length === 0 ? (
        <div className="glass-card p-12 border border-white/10 text-center text-slate-400">
          <p className="text-sm font-bold text-white mb-2">No pending identity reviews</p>
          <p className="text-xs">Verification data will appear here once the admin queue API is available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="glass-card p-6 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-[#F5B301] border border-amber-500/30 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{item.name}</h3>
                  <p className="text-xs text-slate-400">{item.type} • Document #{item.docNumber} • Submitted {item.submittedAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                  item.status === 'PENDING_REVIEW'
                    ? 'bg-amber-500/20 text-[#F5B301] border-amber-500/30 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}>
                  {item.status.replace('_', ' ')}
                </span>

                {item.status === 'PENDING_REVIEW' && (
                  <>
                    <button
                      onClick={() => handleAction(item.id, 'APPROVED')}
                      className="btn-primary text-xs py-2 px-3 flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Approve Identity
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'REJECTED')}
                      className="btn-secondary text-xs py-2 px-3 text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
