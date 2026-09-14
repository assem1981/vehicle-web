'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, CheckCircle2, Percent, Calendar } from 'lucide-react';
import { adminService, AdminPromoCode } from '@/services/adminService';

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState<AdminPromoCode[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    code: '',
    discountPercent: 0,
    maxUses: 0,
    expiresAt: ''
  });

  useEffect(() => {
    const loadPromos = async () => {
      try {
        const res = await adminService.getPromoCodes();
        setPromos(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPromos();
  }, []);

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await adminService.createPromoCode({
      code: formData.code,
      discountPercent: Number(formData.discountPercent),
      maxUses: Number(formData.maxUses),
      expiresAt: formData.expiresAt
    });
    setPromos([created, ...promos]);
    setShowAddForm(false);
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Promotions...</div>;

  return (
    <div className="space-y-6">
      
      <div className="glass-card p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Promotions & Coupon Management</h2>
          <p className="text-xs text-slate-400">Create discount promo codes, referral incentives, and marketing campaign vouchers</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Promo Code
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreatePromo} className="glass-card p-6 border border-amber-500/30 space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-white mb-2">Create New Voucher Code</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Promo Code Name</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-mono uppercase"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Discount Rate (%)</label>
              <input
                type="number"
                required
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Max Redemptions Limit</label>
              <input
                type="number"
                required
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Expiration Date</label>
              <input
                type="date"
                required
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary text-xs py-2 px-4">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs py-2 px-4">
              Publish Code
            </button>
          </div>
        </form>
      )}

      <div className="glass-card p-6 border border-white/10 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
              <th className="pb-3">Promo Code</th>
              <th className="pb-3">Discount</th>
              <th className="pb-3">Redemptions</th>
              <th className="pb-3">Expires At</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {promos.map((p) => (
              <tr key={p.id} className="hover:bg-white/5 transition-all">
                <td className="py-3 font-mono font-bold text-[#F5B301]">{p.code}</td>
                <td className="py-3 font-extrabold text-white">{p.discountPercent}% OFF</td>
                <td className="py-3 text-slate-300">{p.usedCount} / {p.maxUses} used</td>
                <td className="py-3">{p.expiresAt}</td>
                <td className="py-3">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
