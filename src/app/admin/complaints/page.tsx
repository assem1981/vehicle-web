'use client';

import React, { useState } from 'react';
import { MessageSquareWarning, Check, AlertCircle, Clock } from 'lucide-react';

export default function AdminComplaintsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleResolve = (id: string) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, status: 'RESOLVED' } : c));
  };

  return (
    <div className="space-y-6">

      <div className="glass-card p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Complaints & Support Ticket Center</h2>
          <p className="text-xs text-slate-400">Resolve renter & host disputes, customer service tickets, and feedback escalation</p>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-12 border border-white/10 text-center text-slate-400">Loading support tickets...</div>
      ) : complaints.length === 0 ? (
        <div className="glass-card p-12 border border-white/10 text-center text-slate-400">
          <p className="text-sm font-bold text-white mb-2">No support tickets</p>
          <p className="text-xs">Support ticket data will appear here once the API is available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c.id} className="glass-card p-6 border border-white/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Ticket #{c.id} • {c.category}</h3>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {c.priority} PRIORITY
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Submitted by: {c.user} ({c.type})</p>
                </div>

                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                  c.status === 'OPEN'
                    ? 'bg-amber-500/20 text-[#F5B301] border-amber-500/30'
                    : c.status === 'RESOLVED'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                }`}>
                  {c.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/10">
                {c.description}
              </p>

              {c.status !== 'RESOLVED' && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleResolve(c.id)}
                    className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Mark Ticket Resolved
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
