'use client';

import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Gauge, DollarSign, Calendar, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { hostService, MaintenanceRecord } from '@/services/hostService';

export default function HostMaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<{
    vehicleId: number;
    vehicleName: string;
    serviceType: 'Oil Change' | 'Tire Rotation' | 'Brake Inspection' | 'General Repair';
    date: string;
    odometerMiles: number;
    costUSD: number;
    provider: string;
    notes: string;
  }>({
    vehicleId: 0,
    vehicleName: '',
    serviceType: 'Oil Change',
    date: '',
    odometerMiles: 0,
    costUSD: 0,
    provider: '',
    notes: ''
  });

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await hostService.getMaintenanceRecords();
        setRecords(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await hostService.addMaintenanceRecord(formData);
    setRecords([created, ...records]);
    setShowAddForm(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading Maintenance logs...</div>;
  }

  return (
    <div className="space-y-6">

      {/* Header & Add Action */}
      <div className="glass-card p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Vehicle Maintenance Logs</h2>
          <p className="text-xs text-slate-400">Track oil changes, tire rotations, inspections, and repair costs</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Log Service Record
        </button>
      </div>

      {/* Add Record Form Modal/Accordion */}
      {showAddForm && (
        <form onSubmit={handleAddRecord} className="glass-card p-6 border border-amber-500/30 space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-white mb-2">Add Maintenance Entry</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Vehicle Name</label>
              <input
                type="text"
                value={formData.vehicleName}
                onChange={(e) => setFormData({ ...formData, vehicleName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Service Type</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as 'Oil Change' | 'Tire Rotation' | 'Brake Inspection' | 'General Repair' })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
              >
                <option value="Oil Change">Oil Change</option>
                <option value="Tire Rotation">Tire Rotation</option>
                <option value="Brake Inspection">Brake Inspection</option>
                <option value="General Repair">General Repair</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Current Odometer (Miles)</label>
              <input
                type="number"
                value={formData.odometerMiles || ''}
                onChange={(e) => setFormData({ ...formData, odometerMiles: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Cost ($)</label>
              <input
                type="number"
                value={formData.costUSD || ''}
                onChange={(e) => setFormData({ ...formData, costUSD: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary text-xs py-2 px-4">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs py-2 px-4">
              Save Entry
            </button>
          </div>
        </form>
      )}

      {/* History Log Table */}
      <div className="glass-card p-6 border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white">Maintenance History Log</h3>

        {records.length === 0 ? (
          <p className="text-xs text-slate-400">No maintenance records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">Vehicle</th>
                  <th className="pb-3">Service Type</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Odometer</th>
                  <th className="pb-3">Cost</th>
                  <th className="pb-3">Provider</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-white/5 transition-all">
                    <td className="py-3 font-bold text-white">{r.vehicleName}</td>
                    <td className="py-3 font-semibold text-[#F5B301]">{r.serviceType}</td>
                    <td className="py-3">{r.date}</td>
                    <td className="py-3">{r.odometerMiles.toLocaleString()} mi</td>
                    <td className="py-3 font-extrabold text-white">${r.costUSD}</td>
                    <td className="py-3 text-slate-400">{r.provider}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
