'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Clock, CheckCircle, XCircle, Mail, Phone, CalendarDays, RefreshCw, Shield } from 'lucide-react';
import { adminService, HostApplication } from '@/services/adminService';

export default function AdminHostApprovalsPage() {
  const [applications, setApplications] = useState<HostApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ userId: number; action: 'approved' | 'rejected' } | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    const data = await adminService.getHostApplications();
    setApplications(data.filter(a => a.hostApprovalStatus === 'PENDING'));
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (userId: number) => {
    setProcessing(userId);
    setActionFeedback(null);
    await adminService.approveHostApplication(userId);
    setActionFeedback({ userId, action: 'approved' });
    // Remove from list after a brief delay for visual feedback
    setTimeout(() => {
      setApplications(prev => prev.filter(a => a.id !== userId));
      setActionFeedback(null);
      setProcessing(null);
    }, 1200);
  };

  const handleReject = async (userId: number) => {
    setProcessing(userId);
    setActionFeedback(null);
    await adminService.rejectHostApplication(userId);
    setActionFeedback({ userId, action: 'rejected' });
    setTimeout(() => {
      setApplications(prev => prev.filter(a => a.id !== userId));
      setActionFeedback(null);
      setProcessing(null);
    }, 1200);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="glass-card p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#F5B301]" />
            Host Approvals
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Review and approve new host registration applications</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 text-[#F5B301] border border-amber-500/30 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {applications.length} Pending
          </span>
          <button
            onClick={fetchApplications}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="glass-card p-12 border border-white/10 text-center">
          <div className="animate-pulse text-slate-400 text-sm font-semibold">Loading applications...</div>
        </div>
      ) : applications.length === 0 ? (
        <div className="glass-card p-12 border border-white/10 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <p className="text-sm font-bold text-white">All caught up!</p>
          <p className="text-xs text-slate-400">No pending host applications to review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const isProcessing = processing === app.id;
            const feedback = actionFeedback?.userId === app.id ? actionFeedback : null;

            return (
              <div
                key={app.id}
                className={`glass-card p-5 border transition-all duration-500 ${
                  feedback?.action === 'approved'
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : feedback?.action === 'rejected'
                    ? 'border-red-500/40 bg-red-500/5'
                    : 'border-white/10'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Applicant Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20 shrink-0">
                      {app.firstName?.[0]}{app.lastName?.[0]}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-sm font-bold text-white">
                        {app.firstName} {app.lastName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {app.email}
                        </span>
                        {app.phoneNumber && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {app.phoneNumber}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          Applied {formatDate(app.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status / Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {feedback ? (
                      <div className={`flex items-center gap-1.5 text-xs font-extrabold px-4 py-2 rounded-xl ${
                        feedback.action === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {feedback.action === 'approved' ? (
                          <><CheckCircle className="w-4 h-4" /> Approved</>
                        ) : (
                          <><XCircle className="w-4 h-4" /> Rejected</>
                        )}
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleApprove(app.id)}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(app.id)}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
