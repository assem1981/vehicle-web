'use client';

import React, { useState, useEffect } from 'react';
import { History, Shield, Lock, Search } from 'lucide-react';
import { adminService, AdminAuditLog } from '@/services/adminService';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await adminService.getAuditLogs();
        setLogs(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Audit Trail...</div>;

  return (
    <div className="space-y-6">
      
      <div className="glass-card p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Security & Administrative Audit Logs</h2>
          <p className="text-xs text-slate-400">Immutable ledger of administrative actions, system config edits, and security events</p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 text-[#F5B301] border border-amber-500/30">
          256-Bit Signed Audit Trail
        </span>
      </div>

      <div className="glass-card p-6 border border-white/10 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
              <th className="pb-3">Log ID</th>
              <th className="pb-3">Timestamp</th>
              <th className="pb-3">Actor / Admin</th>
              <th className="pb-3">Action Type</th>
              <th className="pb-3">Target Details</th>
              <th className="pb-3">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-white/5 transition-all">
                <td className="py-3 font-mono font-bold text-white">{l.id}</td>
                <td className="py-3 font-mono text-slate-400">{l.timestamp}</td>
                <td className="py-3 font-bold text-white">{l.actor}</td>
                <td className="py-3 font-semibold text-[#F5B301]">{l.action}</td>
                <td className="py-3 text-slate-300">{l.targetEntity}</td>
                <td className="py-3 font-mono text-slate-400">{l.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
