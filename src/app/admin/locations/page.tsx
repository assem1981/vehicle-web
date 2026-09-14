'use client';

import React, { useState } from 'react';
import { MapPin, Plus, Plane, Building2, CheckCircle2 } from 'lucide-react';

export default function AdminLocationsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">

      <div className="glass-card p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Locations & City Coverage</h2>
          <p className="text-xs text-slate-400">Configure marketplace operational cities, airport dropoff hubs, and delivery zones</p>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-12 border border-white/10 text-center text-slate-400">Loading locations...</div>
      ) : locations.length === 0 ? (
        <div className="glass-card p-12 border border-white/10 text-center text-slate-400">
          <p className="text-sm font-bold text-white mb-2">No locations configured</p>
          <p className="text-xs">City coverage data will appear here once the locations API is available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {locations.map((loc) => (
            <div key={loc.id} className="glass-card p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#F5B301]" />
                  <h3 className="text-base font-bold text-white">{loc.city}</h3>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {loc.status}
                </span>
              </div>

              <p className="text-xs text-slate-400">{loc.country}</p>
              <div className="pt-2 border-t border-white/10 flex justify-between text-xs text-slate-300">
                <span>Active Fleet: <strong className="text-white">{loc.activeFleet} Cars</strong></span>
                <span className="flex items-center gap-1 font-mono text-[#F5B301]"><Plane className="w-3 h-3" /> {loc.airportCode}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
