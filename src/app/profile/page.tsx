'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Edit2, 
  Save, 
  X, 
  AlertCircle,
  BookmarkCheck,
  Car,
  Clock,
  CheckCircle2,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { authService, UserSession } from '@/services/authService';
import { bookingService, Booking } from '@/services/bookingService';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await authService.getCurrentUser();
      if (userProfile) {
        setUser(userProfile);
        setFormData({
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          phoneNumber: userProfile.phoneNumber || ''
        });

        // Load user's bookings
        try {
          const userBookings = await bookingService.getMyBookings();
          setBookings(userBookings);
        } catch (bErr) {
          console.warn('Failed to load user bookings on profile:', bErr);
        }
      } else {
        router.push('/auth/login?redirect=/profile');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load user profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const updatedUser = await authService.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber
      });
      setUser(updatedUser);
      setEditing(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber || ''
      });
    }
    setEditing(false);
    setError('');
  };

  const getRoleBadge = (roles: string[]) => {
    const norm = (roles || []).map(r => String(r).toUpperCase());
    if (norm.includes('ROLE_ADMIN') || norm.includes('ADMIN')) return { label: 'Administrator', className: 'bg-amber-500/20 text-[#F5B301] border-amber-500/40' };
    if (norm.includes('ROLE_HOST') || norm.includes('HOST')) return { label: 'Vehicle Host', className: 'bg-blue-500/20 text-blue-400 border-blue-500/40' };
    return { label: 'Registered User', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1F35] flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">Loading user profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B1F35] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-white">Please log in to view your user profile.</p>
          <Link href="/auth/login?redirect=/profile" className="btn-primary py-2 px-6 text-xs inline-block">
            Log In Now
          </Link>
        </div>
      </div>
    );
  }

  const roleBadge = getRoleBadge(user.roles || []);

  return (
    <div className="min-h-screen bg-[#0B1F35] py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">User Account & Profile</h1>
            <p className="text-slate-400 text-xs sm:text-sm">View and update your personal information and trip activity</p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/search" className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5" /> Explore Cars
            </Link>
            <Link href="/bookings/history" className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
              <BookmarkCheck className="w-3.5 h-3.5" /> My Bookings
            </Link>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="glass-card p-6 sm:p-8 border border-white/10 shadow-2xl space-y-8">
          
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F5B301] to-amber-600 flex items-center justify-center text-2xl font-black text-[#0B1F35] shadow-lg shadow-[#F5B301]/20">
                {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-slate-400 text-xs flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" /> {user.email}
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${roleBadge.className}`}>
                    {roleBadge.label}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                    ID: #{user.id}
                  </span>
                </div>
              </div>
            </div>

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn-secondary text-xs py-2 px-4 flex items-center gap-2 self-start sm:self-auto"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            )}
          </div>

          {/* Profile Form Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* First Name */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" /> First Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              ) : (
                <p className="text-white text-sm font-semibold bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                  {user.firstName || 'N/A'}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" /> Last Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              ) : (
                <p className="text-white text-sm font-semibold bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                  {user.lastName || 'N/A'}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" /> Email Address
              </label>
              <p className="text-white text-sm font-semibold bg-white/5 px-3 py-2 rounded-xl border border-white/5 opacity-80">
                {user.email}
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block">Account primary email (read-only)</span>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> Phone Number
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              ) : (
                <p className="text-white text-sm font-semibold bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                  {user.phoneNumber || 'Not provided'}
                </p>
              )}
            </div>

            {/* System Roles */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Assigned Roles
              </label>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((r, idx) => (
                    <span key={idx} className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      {String(r).replace('ROLE_', '')}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    USER
                  </span>
                )}
              </div>
            </div>

            {/* Account Status */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Account Status
              </label>
              <div className="flex items-center gap-2 pt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs text-white font-bold">Active User Account</span>
              </div>
            </div>

          </div>

          {/* Edit Actions */}
          {editing && (
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary text-xs py-2.5 px-6 flex items-center justify-center gap-2 font-bold"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="btn-secondary text-xs py-2.5 px-6 flex items-center justify-center gap-2"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          )}

        </div>

        {/* User Activity & Reservations Card */}
        <div className="glass-card p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">My Trips & Reservations</h3>
            </div>
            <Link href="/bookings/history" className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1">
              View All History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.slice(0, 3).map((b) => (
                <div key={b.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">Booking #{b.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {b.status || 'CONFIRMED'}
                      </span>
                    </div>
                    <p className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-emerald-400" /> {b.startDate} to {b.endDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <span className="font-black text-emerald-400 text-sm">${Number(b.totalPrice || 0).toFixed(2)}</span>
                    <Link 
                      href={`/trips/${b.id}/check-in`} 
                      className="btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1"
                    >
                      <span>Trip Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center space-y-3">
              <Car className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-300">You have no active vehicle reservations yet.</p>
              <Link href="/search" className="btn-primary text-xs py-2 px-5 inline-block font-bold">
                Find & Book a Vehicle
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
