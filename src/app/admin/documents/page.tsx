'use client';

import React, { useState } from 'react';
import { FileText, Check, X, Download, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminDocumentsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAction = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setDocs(docs.map(d => d.id === id ? { ...d, status } : d));
  };

  return (
    <div className="space-y-6">

      <div className="glass-card p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Vehicle Documents Verification Queue</h2>
          <p className="text-xs text-slate-400">Review registration cards, commercial insurance policies, and annual safety inspection certificates</p>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-12 border border-white/10 text-center text-slate-400">Loading documents...</div>
      ) : docs.length === 0 ? (
        <div className="glass-card p-12 border border-white/10 text-center text-slate-400">
          <p className="text-sm font-bold text-white mb-2">No documents to review</p>
          <p className="text-xs">Document verification data will appear here once the API is available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {docs.map((doc) => (
            <div key={doc.id} className="glass-card p-6 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-[#F5B301] border border-amber-500/30 flex items-center justify-center font-bold">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{doc.vehicle}</h3>
                  <p className="text-xs text-slate-400">{doc.type.replace('_', ' ')} • File: <span className="text-amber-400 font-mono">{doc.fileName}</span> • Host: {doc.host}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                  doc.status === 'PENDING_APPROVAL'
                    ? 'bg-amber-500/20 text-[#F5B301] border-amber-500/30 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}>
                  {doc.status.replace('_', ' ')}
                </span>

                {doc.status === 'PENDING_APPROVAL' && (
                  <>
                    <button
                      onClick={() => handleAction(doc.id, 'APPROVED')}
                      className="btn-primary text-xs py-2 px-3 flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Approve Document
                    </button>
                    <button
                      onClick={() => handleAction(doc.id, 'REJECTED')}
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
