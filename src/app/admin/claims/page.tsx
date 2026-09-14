'use client';

import React, { useState } from 'react';
import { ShieldAlert, Check, X, DollarSign, Camera, FileText } from 'lucide-react';

export default function AdminClaimsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleClaimStatus = (id: string, status: string) => {
    setClaims(claims.map(c => c.id === id ? { ...c, status } : c));
  };

  return (
    <div className="space-y-6">

      <div className="glass-card p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Damage Claims Arbitration Center</h2>
          <p className="text-xs text-slate-400">Review incident reports, compare pre/post inspection photos, and authorize insurance payouts</p>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-12 border border-white/10 text-center text-slate-400">Loading claims...</div>
      ) : claims.length === 0 ? (
        <div className="glass-card p-12 border border-white/10 text-center text-slate-400">
          <p className="text-sm font-bold text-white mb-2">No claims to review</p>
          <p className="text-xs">Damage claim data will appear here once the arbitration API is available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((c) => (
            <div key={c.id} className="glass-card p-6 border border-white/10 space-y-4">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Claim #{c.id} • {c.vehicle}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Host: {c.hostName} • Renter: {c.renterName} • Trip #{c.bookingId}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xl font-black text-[#F5B301]">${c.estimatedCost} Claim</span>
                  <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/10">
                {c.description}
              </p>

              {c.status === 'UNDER_REVIEW' && (
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => handleClaimStatus(c.id, 'APPROVED_PAYOUT')}
                    className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Authorize Insurance Payout (${c.estimatedCost})
                  </button>
                  <button
                    onClick={() => handleClaimStatus(c.id, 'REJECTED')}
                    className="btn-secondary text-xs py-2 px-4 text-rose-400 hover:text-rose-300 flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Deny Claim
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
