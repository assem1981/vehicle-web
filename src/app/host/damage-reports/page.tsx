'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Upload, Camera, AlertCircle, CheckCircle2, Clock, FileText } from 'lucide-react';
import { hostService, DamageReport } from '@/services/hostService';

export default function HostDamageReportsPage() {
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [showFileForm, setShowFileForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<{
    bookingId: number;
    vehicleId: number;
    vehicleName: string;
    renterName: string;
    severity: 'MINOR' | 'MODERATE' | 'SEVERE';
    description: string;
    photoUrls: string[];
    estimatedCostUSD: number;
  }>({
    bookingId: 0,
    vehicleId: 0,
    vehicleName: '',
    renterName: '',
    severity: 'MINOR',
    description: '',
    photoUrls: [],
    estimatedCostUSD: 0
  });

  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await hostService.getDamageReports();
        setReports(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  const handleFileClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await hostService.submitDamageReport(formData);
    setReports([created, ...reports]);
    setShowFileForm(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading Damage Claims...</div>;
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="glass-card p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Damage & Incident Claims</h2>
          <p className="text-xs text-slate-400">Report post-trip vehicle damage, submit evidence photos, and track protection claims</p>
        </div>

        <button
          onClick={() => setShowFileForm(!showFileForm)}
          className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> File New Incident Claim
        </button>
      </div>

      {/* File Form Modal/Accordion */}
      {showFileForm && (
        <form onSubmit={handleFileClaim} className="glass-card p-6 border border-rose-500/30 space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" /> New Damage Claim Form
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Booking Trip ID</label>
              <input
                type="number"
                value={formData.bookingId || ''}
                onChange={(e) => setFormData({ ...formData, bookingId: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Renter Name</label>
              <input
                type="text"
                value={formData.renterName}
                onChange={(e) => setFormData({ ...formData, renterName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Damage Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as 'MINOR' | 'MODERATE' | 'SEVERE' })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
              >
                <option value="MINOR">Minor (Scratch / Dent &lt; $500)</option>
                <option value="MODERATE">Moderate ($500 - $2,000)</option>
                <option value="SEVERE">Severe (Major Collision / Mechanical)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Estimated Repair Cost ($)</label>
              <input
                type="number"
                value={formData.estimatedCostUSD || ''}
                onChange={(e) => setFormData({ ...formData, estimatedCostUSD: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Incident Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="p-4 rounded-xl border border-dashed border-white/20 bg-white/5 text-center space-y-1 cursor-pointer">
            <Upload className="w-6 h-6 text-[#F5B301] mx-auto" />
            <span className="text-xs font-semibold text-white block">Upload Evidence Photos (High-Res)</span>
            <span className="text-[10px] text-slate-400 block">Pre-trip vs Post-trip comparison images</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowFileForm(false)} className="btn-secondary text-xs py-2 px-4">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs py-2 px-4">
              Submit Claim
            </button>
          </div>
        </form>
      )}

      {reports.length === 0 ? (
        <div className="glass-card p-12 border border-white/10 text-center text-slate-400">
          <p className="text-sm font-bold text-white mb-2">No damage claims</p>
          <p className="text-xs">Claims will appear here once submitted.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => (
            <div key={rep.id} className="glass-card p-6 border border-white/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Claim #{rep.id} • {rep.vehicleName}</h3>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {rep.severity} DAMAGE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Renter: {rep.renterName} • Trip #{rep.bookingId} • Reported on {rep.reportedAt}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-[#F5B301]">${rep.estimatedCostUSD} Est.</span>
                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                    rep.status === 'CLAIM_APPROVED'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {rep.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/10">
                {rep.description}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
