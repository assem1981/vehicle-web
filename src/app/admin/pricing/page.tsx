'use client';

import React, { useState } from 'react';
import { Percent, DollarSign, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AdminPricingPage() {
  const [pricingConfig, setPricingConfig] = useState({
    platformCommissionPercent: 10,
    guestServiceFeeUSD: 25,
    vatTaxPercent: 20,
    cancellationPenaltyPercent: 15,
    minSecurityDepositUSD: 200,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      <div className="glass-card p-6 border border-white/10">
        <h2 className="text-xl font-black text-white">Global Pricing & Commission Rules</h2>
        <p className="text-xs text-slate-400">Configure marketplace host commission percentage, guest service fees, and tax calculations</p>
      </div>

      <form onSubmit={handleSave} className="glass-card p-6 border border-white/10 space-y-6">
        {saved && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Global Pricing & Commission Rules Saved Successfully!
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Platform Host Commission Rate (%)</label>
            <input
              type="number"
              value={pricingConfig.platformCommissionPercent}
              onChange={(e) => setPricingConfig({ ...pricingConfig, platformCommissionPercent: Number(e.target.value) })}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Percentage deducted from host earnings (e.g. 10%)</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Guest Cleanliness & Service Fee ($)</label>
            <input
              type="number"
              value={pricingConfig.guestServiceFeeUSD}
              onChange={(e) => setPricingConfig({ ...pricingConfig, guestServiceFeeUSD: Number(e.target.value) })}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Fixed fee added to every booking checkout</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">VAT / Local Tax Rate (%)</label>
            <input
              type="number"
              value={pricingConfig.vatTaxPercent}
              onChange={(e) => setPricingConfig({ ...pricingConfig, vatTaxPercent: Number(e.target.value) })}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Minimum Security Deposit ($)</label>
            <input
              type="number"
              value={pricingConfig.minSecurityDepositUSD}
              onChange={(e) => setPricingConfig({ ...pricingConfig, minSecurityDepositUSD: Number(e.target.value) })}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button type="submit" className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span>Save Pricing Policy</span>
          </button>
        </div>
      </form>

    </div>
  );
}
