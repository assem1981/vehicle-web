'use client';

import React, { useState, useEffect } from 'react';
import { Car, Check, X, ShieldCheck, AlertCircle, Trash2, Edit, Save } from 'lucide-react';
import { adminService, AdminVehicleListing } from '@/services/adminService';

type FilterTab = 'PENDING_APPROVAL' | 'AVAILABLE' | 'DEACTIVATED' | 'ALL';

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<AdminVehicleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('PENDING_APPROVAL');

  // Edit Modal State
  const [editingVehicle, setEditingVehicle] = useState<AdminVehicleListing | null>(null);
  const [editFormData, setEditFormData] = useState({
    make: '',
    model: '',
    year: 2024,
    dailyRate: 0,
    locationCity: '',
    category: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const loadVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getVehicles();
      setVehicles(res);
    } catch (err) {
      console.error(err);
      setError('Failed to load vehicle listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleApproval = async (id: number, action: 'APPROVED' | 'REJECTED') => {
    try {
      await adminService.updateVehicleApproval(id, action);
      const newStatus = action === 'APPROVED' ? 'AVAILABLE' : 'DEACTIVATED';
      setVehicles(prev => prev.map(v => v.id === id ? { ...v, status: newStatus as AdminVehicleListing['status'] } : v));
      window.dispatchEvent(new Event('vehicleModerationUpdated'));
    } catch (err) {
      console.error(err);
      setError(`Failed to ${action.toLowerCase()} vehicle #${id}.`);
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    if (!window.confirm(`Are you sure you want to permanently remove vehicle #${id}?`)) return;
    try {
      await adminService.deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
      window.dispatchEvent(new Event('vehicleModerationUpdated'));
    } catch (err) {
      console.error(err);
      setError(`Failed to delete vehicle #${id}.`);
    }
  };

  const openEditModal = (v: AdminVehicleListing) => {
    setEditingVehicle(v);
    setEditFormData({
      make: v.make || '',
      model: v.model || '',
      year: v.year || 2024,
      dailyRate: v.dailyRate || 0,
      locationCity: v.locationCity || '',
      category: v.category || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingVehicle) return;
    setSavingEdit(true);
    try {
      const updated = await adminService.updateVehicleDetails(editingVehicle.id, editFormData);
      setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? { ...v, ...updated } : v));
      setEditingVehicle(null);
    } catch (err) {
      console.error(err);
      setError(`Failed to update vehicle #${editingVehicle.id}.`);
    } finally {
      setSavingEdit(false);
    }
  };

  const pendingCount = vehicles.filter(v => v.status === 'PENDING_APPROVAL').length;
  const approvedCount = vehicles.filter(v => v.status === 'AVAILABLE').length;
  const rejectedCount = vehicles.filter(v => v.status === 'DEACTIVATED').length;
  const totalCount = vehicles.length;

  const filteredVehicles = vehicles.filter(v => {
    if (activeTab === 'ALL') return true;
    return v.status === activeTab;
  });

  const statusLabel = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL': return 'PENDING APPROVAL';
      case 'AVAILABLE': return 'APPROVED';
      case 'DEACTIVATED': return 'REJECTED';
      default: return status.replace('_', ' ');
    }
  };

  const statusClass = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL': return 'bg-amber-500/20 text-[#F5B301] border-amber-500/30 animate-pulse';
      case 'AVAILABLE': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'DEACTIVATED': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Vehicle Moderation Queue...</div>;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-card p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Vehicle Listing Moderation Queue</h2>
          <p className="text-xs text-slate-400">Verify host car submissions, VIN registration numbers, edit specifications, or remove listings</p>
        </div>

        <span className="text-xs font-bold px-3.5 py-2 rounded-xl bg-amber-500/10 text-[#F5B301] border border-amber-500/30">
          {pendingCount} Pending Approvals
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('PENDING_APPROVAL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
            activeTab === 'PENDING_APPROVAL'
              ? 'bg-amber-500/20 border-amber-500 text-[#F5B301]'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <span>Pending Approvals</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/30 text-amber-300 font-extrabold">
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('AVAILABLE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
            activeTab === 'AVAILABLE'
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <span>Approved</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/30 text-emerald-300 font-extrabold">
            {approvedCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('DEACTIVATED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
            activeTab === 'DEACTIVATED'
              ? 'bg-rose-500/20 border-rose-500 text-rose-400'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <span>Rejected</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/30 text-rose-300 font-extrabold">
            {rejectedCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
            activeTab === 'ALL'
              ? 'bg-blue-500/20 border-blue-500 text-blue-400'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <span>All Vehicles</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-slate-300 font-extrabold">
            {totalCount}
          </span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {filteredVehicles.length === 0 && !error && (
        <div className="glass-card p-12 text-center border border-white/10">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-sm text-slate-300">
            {activeTab === 'PENDING_APPROVAL'
              ? 'No pending vehicles to review.'
              : `No vehicles found in category: ${activeTab}.`}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {filteredVehicles.map((v) => (
          <div key={v.id} className="glass-card p-6 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-center gap-4">
              <div className="w-20 h-16 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-white/10">
                {v.imageUrl ? (
                  <img src={v.imageUrl} alt={v.model} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="w-6 h-6 text-slate-600" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{v.make} {v.model} ({v.year})</h3>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusClass(v.status)}`}>
                    {statusLabel(v.status)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Host: <span className="text-white font-medium">{v.hostName || `Host #${v.hostId}`}</span> • Category: <span className="text-slate-300 font-semibold">{v.category || 'Standard'}</span> • Rate: <span className="text-[#F5B301] font-bold">${v.dailyRate}/day</span></p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">VIN: {v.vin} • Location: {v.locationCity}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {v.status === 'PENDING_APPROVAL' && (
                <>
                  <button
                    onClick={() => handleApproval(v.id, 'APPROVED')}
                    className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleApproval(v.id, 'REJECTED')}
                    className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 text-amber-400 hover:text-amber-300"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </>
              )}

              <button
                onClick={() => openEditModal(v)}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 text-blue-400 hover:text-blue-300"
                title="Edit Specification"
              >
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>

              <button
                onClick={() => handleDeleteVehicle(v.id)}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 text-rose-400 hover:text-rose-300 hover:border-rose-500/50"
                title="Remove Vehicle"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg p-6 border border-white/10 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-emerald-400" /> Edit Vehicle #{editingVehicle.id} Details
              </h3>
              <button 
                onClick={() => setEditingVehicle(null)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Make</label>
                <input
                  type="text"
                  value={editFormData.make}
                  onChange={(e) => setEditFormData({ ...editFormData, make: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Model</label>
                <input
                  type="text"
                  value={editFormData.model}
                  onChange={(e) => setEditFormData({ ...editFormData, model: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Year</label>
                <input
                  type="number"
                  value={editFormData.year}
                  onChange={(e) => setEditFormData({ ...editFormData, year: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Daily Rate ($)</label>
                <input
                  type="number"
                  value={editFormData.dailyRate}
                  onChange={(e) => setEditFormData({ ...editFormData, dailyRate: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Category</label>
                <input
                  type="text"
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  placeholder="Sedan, SUV, Electric, Luxury"
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Location City</label>
                <input
                  type="text"
                  value={editFormData.locationCity}
                  onChange={(e) => setEditFormData({ ...editFormData, locationCity: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setEditingVehicle(null)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingEdit ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
