'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Upload, FileText, CheckCircle2, AlertCircle, Lock, ArrowRight } from 'lucide-react';
import { hostService } from '@/services/hostService';

export default function HostVerificationPage() {
  const [status, setStatus] = useState<{ status?: string; verifiedAt?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    idType: 'DRIVERS_LICENSE',
    idNumber: '',
    taxId: '',
    address: '',
    frontPhotoName: '',
    backPhotoName: '',
  });

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await hostService.getVerificationStatus();
        setStatus(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await hostService.submitVerification({
        driverLicenseNumber: formData.idNumber,
        identityDocumentUrl: formData.frontPhotoName
      });
      setSubmitted(true);
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to submit verification');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading identity verification...</div>;
  }

  return (
    <div className="space-y-6">

      {/* Status Header */}
      <div className="glass-card p-6 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Host Identity Verification Status</h2>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {status?.status || 'NOT SUBMITTED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {status?.verifiedAt ? `Verified on ${status.verifiedAt}` : 'Submit your credentials to become a verified host.'}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
          <Lock className="w-3.5 h-3.5 text-[#F5B301]" />
          <span>256-Bit Encrypted Data</span>
        </div>
      </div>

      {submitted ? (
        <div className="glass-card p-10 text-center space-y-4 border border-emerald-500/30">
          <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
          <h3 className="text-xl font-bold text-white">Verification Submission Received!</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Our automated security system and verification specialists are processing your updated government ID and tax information.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card p-6 border border-white/10 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <h3 className="text-base font-bold text-white mb-1">Update Host Credentials</h3>
            <p className="text-xs text-slate-400">Ensure your legal driver identity and tax forms remain up to date for payouts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Legal Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Identification Type</label>
              <select
                value={formData.idType}
                onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="DRIVERS_LICENSE">Driver&apos;s License</option>
                <option value="PASSPORT">Passport</option>
                <option value="NATIONAL_ID">National ID Card</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Document Number</label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Tax Identification (SSN / TIN / VAT)</label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Upload Documents Box */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-slate-300 block">Document Scans (Front & Back)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-dashed border-white/20 bg-white/5 text-center space-y-2 cursor-pointer hover:border-amber-500/50 transition-all">
                <Upload className="w-6 h-6 text-[#F5B301] mx-auto" />
                <input
                  type="text"
                  value={formData.frontPhotoName}
                  onChange={(e) => setFormData({ ...formData, frontPhotoName: e.target.value })}
                  placeholder="Front document URL"
                  className="w-full bg-transparent text-xs text-white text-center focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-xl border border-dashed border-white/20 bg-white/5 text-center space-y-2 cursor-pointer hover:border-amber-500/50 transition-all">
                <Upload className="w-6 h-6 text-[#F5B301] mx-auto" />
                <input
                  type="text"
                  value={formData.backPhotoName}
                  onChange={(e) => setFormData({ ...formData, backPhotoName: e.target.value })}
                  placeholder="Back document URL"
                  className="w-full bg-transparent text-xs text-white text-center focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button type="submit" className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2">
              <span>Save & Update Credentials</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
