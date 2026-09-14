'use client';

import React, { useState } from 'react';
import { Sliders, Shield, Zap, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';

export default function AdminSystemConfigPage() {
  const [config, setConfig] = useState({
    maintenanceMode: false,
    globalInstantBooking: true,
    smsNotificationsEnabled: true,
    requireIdentityVerificationToBook: true,
    googleOAuthActive: true,
    appleOAuthActive: true,
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof typeof config) => {
    setConfig({ ...config, [key]: !config[key] });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      <div className="glass-card p-6 border border-white/10">
        <h2 className="text-xl font-black text-white">System Configuration & Feature Flags</h2>
        <p className="text-xs text-slate-400">Control real-time platform feature switches, security gates, and maintenance states</p>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> System Configuration Updated!
        </div>
      )}

      <div className="space-y-4">
        
        <div className="glass-card p-5 border border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" /> Platform Maintenance Mode
            </h3>
            <p className="text-xs text-slate-400">Lock marketplace for scheduled system upgrades</p>
          </div>
          <input
            type="checkbox"
            checked={config.maintenanceMode}
            onChange={() => handleToggle('maintenanceMode')}
            className="w-5 h-5 accent-rose-500 cursor-pointer"
          />
        </div>

        <div className="glass-card p-5 border border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#F5B301]" /> Global Instant Booking Engine
            </h3>
            <p className="text-xs text-slate-400">Allow instant reservations across all verified vehicles</p>
          </div>
          <input
            type="checkbox"
            checked={config.globalInstantBooking}
            onChange={() => handleToggle('globalInstantBooking')}
            className="w-5 h-5 accent-[#F5B301] cursor-pointer"
          />
        </div>

        <div className="glass-card p-5 border border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> Mandatory ID Verification for Booking
            </h3>
            <p className="text-xs text-slate-400">Require guests to complete identity verification prior to trip start</p>
          </div>
          <input
            type="checkbox"
            checked={config.requireIdentityVerificationToBook}
            onChange={() => handleToggle('requireIdentityVerificationToBook')}
            className="w-5 h-5 accent-emerald-500 cursor-pointer"
          />
        </div>

        <div className="glass-card p-5 border border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" /> Social OAuth Integration (Google & Apple)
            </h3>
            <p className="text-xs text-slate-400">Enable 1-click social authentication for renters & hosts</p>
          </div>
          <input
            type="checkbox"
            checked={config.googleOAuthActive}
            onChange={() => handleToggle('googleOAuthActive')}
            className="w-5 h-5 accent-blue-500 cursor-pointer"
          />
        </div>

      </div>

    </div>
  );
}
