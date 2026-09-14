'use client';

import React, { useState, useEffect } from 'react';
import { RotateCcw, Check, X, DollarSign, AlertCircle } from 'lucide-react';
import { adminService, AdminRefundRequest } from '@/services/adminService';

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<AdminRefundRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRefunds = async () => {
      try {
        const res = await adminService.getRefundRequests();
        setRefunds(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadRefunds();
  }, []);

  const handleProcessRefund = async (id: string, status: 'APPROVED' | 'DENIED') => {
    await adminService.processRefund(id, status);
    setRefunds(refunds.map(r => r.id === id ? { ...r, status } : r));
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Refund Requests...</div>;

  return (
    <div className="space-y-6">
      
      <div className="glass-card p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Refund Requests Queue</h2>
          <p className="text-xs text-slate-400">Review renter cancellation refund claims and issue card returns</p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 text-[#F5B301] border border-amber-500/30">
          {refunds.filter(r => r.status === 'PENDING').length} Pending Action
        </span>
      </div>

      <div className="space-y-4">
        {refunds.map((r) => (
          <div key={r.id} className="glass-card p-6 border border-white/10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Refund Claim #{r.id} • Trip #{r.bookingId}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Renter: {r.customerName} • Requested on {r.requestedAt}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xl font-black text-[#F5B301]">${r.amountUSD}</span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  r.status === 'PENDING'
                    ? 'bg-amber-500/20 text-[#F5B301] border-amber-500/30 animate-pulse'
                    : r.status === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}>
                  {r.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/10">
              Reason: {r.reason}
            </p>

            {r.status === 'PENDING' && (
              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => handleProcessRefund(r.id, 'APPROVED')}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Issue Full Refund (${r.amountUSD})
                </button>
                <button
                  onClick={() => handleProcessRefund(r.id, 'DENIED')}
                  className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 text-rose-400 hover:text-rose-300"
                >
                  <X className="w-4 h-4" /> Deny Claim
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
