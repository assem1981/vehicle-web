'use client';

import React, { useState, useEffect } from 'react';
import { Users, Shield, Ban, CheckCircle2, Search, Filter } from 'lucide-react';
import { adminService, AdminUser } from '@/services/adminService';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await adminService.getUsers();
        setUsers(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await adminService.toggleUserStatus(id, newStatus);
    setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
  };

  const filteredUsers = users.filter(u =>
    (u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-slate-400">Loading User Directory...</div>;

  return (
    <div className="space-y-6">
      
      <div className="glass-card p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Platform User Directory</h2>
          <p className="text-xs text-slate-400">Manage user accounts, privileges, security status, and suspensions</p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or email..."
            className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <div className="glass-card p-6 border border-white/10 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
              <th className="pb-3">User ID</th>
              <th className="pb-3">Full Name & Email</th>
              <th className="pb-3">Role</th>
              <th className="pb-3">Joined Date</th>
              <th className="pb-3">Completed Trips</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-white/5 transition-all">
                <td className="py-3 font-mono font-bold text-white">#{u.id}</td>
                <td className="py-3">
                  <span className="font-bold text-white block">{u.fullName}</span>
                  <span className="text-[11px] text-slate-400 block">{u.email}</span>
                </td>
                <td className="py-3 font-semibold text-[#F5B301]">{u.role}</td>
                <td className="py-3">{u.joinedDate}</td>
                <td className="py-3 font-bold text-white">{u.tripsCount}</td>
                <td className="py-3">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    u.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => handleToggleStatus(u.id, u.status)}
                    className={`btn-secondary text-[11px] py-1 px-3 ${
                      u.status === 'ACTIVE' ? 'text-rose-400 hover:text-rose-300' : 'text-emerald-400 hover:text-emerald-300'
                    }`}
                  >
                    {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
