'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, User as UserIcon, Phone, AlertCircle, CheckCircle, Car, Key, Clock, Shield } from 'lucide-react';
import { authService } from '@/services/authService';

type RoleOption = 'RENTER' | 'HOST';

export default function RegisterPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleOption>('RENTER');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy to create an account.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        emailUpdates,
        agreeTerms,
        roles: selectedRole === 'HOST' ? ['HOST'] : undefined,
      };
      const message = await authService.register(payload);

      if (selectedRole === 'HOST') {
        setIsPendingApproval(true);
        setSuccess(typeof message === 'string' ? message : 'Host registration submitted! Your account is pending admin approval.');
      } else {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          router.push(`/auth/login?email=${encodeURIComponent(formData.email)}`);
        }, 1500);
      }
    } catch (err) {
      const data = (err as { response?: { data?: { message?: string } | string } })?.response?.data;
      const message = typeof data === 'object' && data !== null ? data?.message : data;
      setError(message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-card p-8 border border-white/10 shadow-2xl">
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Create an account</h1>
          <p className="text-xs text-slate-400">Join the world&apos;s largest car sharing community</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Pending Approval State — special full-card message */}
        {isPendingApproval && success ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Clock className="w-8 h-8 text-[#F5B301]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Application Submitted!</h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">{success}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 justify-center mb-2">
                <Shield className="w-4 h-4 text-[#F5B301]" />
                <span className="text-xs font-bold text-[#F5B301]">What happens next?</span>
              </div>
              <ol className="text-[11px] text-slate-300 space-y-1 text-left pl-4 list-decimal">
                <li>Our admin team reviews your application</li>
                <li>You&apos;ll receive a notification once approved</li>
                <li>Log in and start listing your vehicles!</li>
              </ol>
            </div>
            <Link
              href="/auth/login"
              className="inline-block text-xs text-emerald-400 font-semibold hover:underline mt-2"
            >
              ← Back to Login
            </Link>
          </div>
        ) : (
          <>
            {success && !isPendingApproval && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Role Selector */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-300 mb-2 block">I want to join as</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('RENTER')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedRole === 'RENTER'
                      ? 'bg-emerald-500/15 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      selectedRole === 'RENTER' ? 'bg-emerald-500/25 text-emerald-400' : 'bg-white/10 text-slate-400'
                    }`}>
                      <Key className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-xs font-bold ${selectedRole === 'RENTER' ? 'text-emerald-400' : 'text-slate-300'}`}>
                      Renter
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">Browse & book luxury vehicles</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('HOST')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedRole === 'HOST'
                      ? 'bg-blue-500/15 border-blue-500/40 shadow-lg shadow-blue-500/10'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      selectedRole === 'HOST' ? 'bg-blue-500/25 text-blue-400' : 'bg-white/10 text-slate-400'
                    }`}>
                      <Car className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-xs font-bold ${selectedRole === 'HOST' ? 'text-blue-400' : 'text-slate-300'}`}>
                      Host
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">List your cars & earn revenue</p>
                </button>
              </div>

              {selectedRole === 'HOST' && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#F5B301]" />
                  <span>Host accounts require admin approval before you can log in and list vehicles.</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder=""
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder=""
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder=""
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder=""
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Agreements & Email Preferences Checkboxes */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none group">
                  <input
                    type="checkbox"
                    checked={emailUpdates}
                    onChange={(e) => setEmailUpdates(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded bg-slate-900 border-white/20 text-[#F5B301] focus:ring-[#F5B301] accent-[#F5B301] cursor-pointer shrink-0"
                  />
                  <span className="leading-snug text-slate-300 group-hover:text-white transition-colors">
                    Send me email updates, recommendations, and deals
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none group">
                  <input
                    type="checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded bg-slate-900 border-white/20 text-[#F5B301] focus:ring-[#F5B301] accent-[#F5B301] cursor-pointer shrink-0"
                  />
                  <span className="leading-snug text-slate-300 group-hover:text-white transition-colors">
                    I agree to the{' '}
                    <Link href="/support" target="_blank" className="text-[#F5B301] font-semibold underline hover:text-amber-300">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/support" target="_blank" className="text-[#F5B301] font-semibold underline hover:text-amber-300">
                      Privacy Policy
                    </Link>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 text-xs flex items-center justify-center gap-2 mt-4 rounded-xl font-bold transition-all ${
                  selectedRole === 'HOST'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20'
                    : 'btn-primary'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Creating account...' : selectedRole === 'HOST' ? 'Submit Host Application' : 'Sign Up'}</span>
              </button>
            </form>

            <p className="text-xs text-center text-slate-400 mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-emerald-400 font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </>
        )}

      </div>
    </div>
  );
}
