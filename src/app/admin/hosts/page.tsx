'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Star, Car, DollarSign, ShieldCheck, Sparkles, Eye, X } from 'lucide-react';
import { adminService, AdminHost, AdminVehicleListing } from '@/services/adminService';

export default function AdminHostsPage() {
  const [hosts, setHosts] = useState<AdminHost[]>([]);
  const [loading, setLoading] = useState(true);

  // Fleet Modal state
  const [selectedHost, setSelectedHost] = useState<AdminHost | null>(null);
  const [hostVehicles, setHostVehicles] = useState<AdminVehicleListing[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  useEffect(() => {
    const loadHosts = async () => {
      try {
        const res = await adminService.getHosts();
        setHosts(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadHosts();
  }, []);

  const openHostFleetModal = async (host: AdminHost) => {
    setSelectedHost(host);
    setLoadingVehicles(true);
    try {
      const vehicles = await adminService.getVehiclesByHost(host.userId);
      setHostVehicles(vehicles);
    } catch (err) {
      console.error(err);
      setHostVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Host Directory...</div>;

  return (
    <div className="space-y-6">

      <div className="glass-card p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Host Partner Directory</h2>
          <p className="text-xs text-slate-400">Oversight of registered vehicle hosts, Superhost badges, and fleet metrics</p>
        </div>
      </div>

      {hosts.length === 0 ? (
        <div className="glass-card p-12 border border-white/10 text-center text-slate-400">
          <p className="text-sm font-bold text-white mb-2">No hosts found</p>
          <p className="text-xs">Host partners will appear here once registered.</p>
        </div>
      ) : (
        <div className="glass-card p-6 border border-white/10 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3">Host Name</th>
                <th className="pb-3">Fleet Size</th>
                <th className="pb-3">Rating</th>
                <th className="pb-3">Total Earnings</th>
                <th className="pb-3">Superhost</th>
                <th className="pb-3">Verification</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {hosts.map((h) => (
                <tr key={h.id} className="hover:bg-white/5 transition-all">
                  <td className="py-3">
                    <span className="font-bold text-white block flex items-center gap-1.5">
                      {h.name || `${h.firstName || ''} ${h.lastName || ''}`.trim() || h.email}
                      {h.isSuperhost && <Sparkles className="w-3.5 h-3.5 text-[#F5B301]" />}
                    </span>
                    <span className="text-[11px] text-slate-400 block">{h.email}</span>
                  </td>
                  <td className="py-3 font-extrabold text-white">
                    <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-amber-400">
                      {h.fleetSize ?? 0} Vehicles
                    </span>
                  </td>
                  <td className="py-3 font-bold text-amber-400">★ {h.rating ?? '-'}</td>
                  <td className="py-3 font-extrabold text-emerald-400">${h.totalEarnings ? h.totalEarnings.toLocaleString() : '0'}</td>
                  <td className="py-3">
                    {h.isSuperhost ? (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[#F5B301] border border-amber-500/30">
                        SUPERHOST
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Standard</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {h.status || 'VERIFIED'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => openHostFleetModal(h)}
                      className="btn-secondary text-[11px] py-1.5 px-3 inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Fleet
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Host Fleet Modal */}
      {selectedHost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-3xl p-6 border border-white/10 max-h-[85vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-[#F5B301] border border-amber-500/30 flex items-center justify-center font-bold">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Vehicles Owned by {selectedHost.name}</h3>
                  <p className="text-xs text-slate-400">Host User ID: #{selectedHost.userId} • {selectedHost.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedHost(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vehicles List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingVehicles ? (
                <div className="p-12 text-center text-slate-400">Fetching host vehicles...</div>
              ) : hostVehicles.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Car className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm font-bold text-white">No vehicles found for this host.</p>
                </div>
              ) : (
                hostVehicles.map(v => (
                  <div key={v.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-white/10">
                        {v.imageUrl ? (
                          <img src={v.imageUrl} alt={v.model} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="w-5 h-5 text-slate-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{v.make} {v.model} ({v.year})</h4>
                        <p className="text-xs text-slate-400">Category: <span className="text-slate-200">{v.category}</span> • Rate: <span className="text-[#F5B301] font-bold">${v.dailyRate}/day</span></p>
                        <p className="text-[11px] text-slate-500 font-mono">VIN: {v.vin} • Location: {v.locationCity}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                      v.status === 'AVAILABLE' 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : v.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-500/20 text-[#F5B301] border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 mt-4 border-t border-white/10 flex justify-end">
              <button 
                onClick={() => setSelectedHost(null)}
                className="btn-secondary text-xs py-2 px-5"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
