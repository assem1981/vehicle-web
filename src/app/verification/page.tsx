'use client';

import React, { useState } from 'react';
import { ShieldCheck, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { chatService } from '@/services/chatService';

export default function VerificationPage() {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await chatService.submitVerification(licenseNumber, documentUrl);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit verification. Please ensure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="glass-card p-8 border border-white/10">
        
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Identity &amp; Driver Verification</h1>
            <p className="text-xs text-slate-400">Required before booking high-performance &amp; luxury vehicles</p>
          </div>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center text-emerald-400 space-y-3">
            <CheckCircle2 className="w-12 h-12 mx-auto" />
            <h3 className="text-lg font-bold">Verification Submitted!</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Your driver&apos;s license details have been received and are currently under automated verification review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-2 block">Driver&apos;s License Number</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="DL-987654321-UK"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-2 block">Upload Front Photo of License / Passport</label>
              <div className="border-2 border-dashed border-white/15 hover:border-emerald-500/40 rounded-2xl p-6 text-center bg-white/[0.02] cursor-pointer transition-colors">
                <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-white">Click or drag document image here</p>
                <p className="text-[11px] text-slate-500 mt-1">PNG, JPG or PDF up to 10MB</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-sm font-semibold flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Submitting Verification...' : 'Submit ID Verification'}</span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
