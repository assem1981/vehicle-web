'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShieldAlert, Lock, Home, LogIn } from 'lucide-react';
import { authService } from '@/services/authService';

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const requiredRole = searchParams.get('required')?.toUpperCase() || 'AUTHORIZED';
  const currentUser = authService.getUserFromStorage();

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">

      {/* Access Denied Icon Header */}
      <div className="relative inline-block">
        <div className="w-24 h-24 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto shadow-2xl shadow-rose-500/20 animate-pulse">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-slate-900 border border-white/20 text-[#F5B301]">
          <Lock className="w-5 h-5" />
        </div>
      </div>

      {/* Error Titles */}
      <div className="space-y-2">
        <span className="text-xs font-extrabold tracking-widest uppercase px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
          HTTP 403 • ACCESS FORBIDDEN
        </span>
        <h1 className="text-3xl font-black text-white">Authorization Required</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {currentUser ? (
            <>Your current account (<strong className="text-white">{currentUser.email}</strong>) does not hold the required <span className="text-[#F5B301] font-bold">{requiredRole}</span> privilege to view this management portal.</>
          ) : (
            <>You must be logged in with a verified <span className="text-[#F5B301] font-bold">{requiredRole}</span> account to access this section.</>
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
        <Link href="/auth/login" className="btn-primary text-xs py-3 px-6 flex items-center justify-center gap-2">
          <LogIn className="w-4 h-4" /> Go to Login Page
        </Link>
        <Link href="/" className="btn-secondary text-xs py-3 px-6 flex items-center justify-center gap-2">
          <Home className="w-4 h-4" /> Return to Homepage
        </Link>
      </div>

    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading Access Control...</div>}>
      <UnauthorizedContent />
    </Suspense>
  );
}
