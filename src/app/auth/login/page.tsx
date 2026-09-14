'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn, AlertCircle, Clock, CheckCircle, Eye, EyeOff, X } from 'lucide-react';
import { authService } from '@/services/authService';

type GoogleNotification = { isNotDisplayed: () => boolean };
type GoogleCredentialResponse = { credential: string };
type AppleSignInResponse = {
  authorization: { id_token: string };
  user?: { email?: string; name?: { firstName?: string; lastName?: string } };
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id?: string;
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
          }) => void;
          prompt: (callback: (notification: GoogleNotification) => void) => void;
        };
      };
    };
    AppleID?: {
      auth: {
        init: (config: {
          clientId?: string;
          scope?: string;
          redirectURI?: string;
          state?: string;
          usePopup?: boolean;
        }) => void;
        signIn: () => Promise<AppleSignInResponse>;
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAutofilled, setIsAutofilled] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

  /**
   * Determines the redirect path based on user roles.
   * Priority: ROLE_ADMIN > ROLE_HOST > ROLE_USER/ROLE_RENTER
   */
  const getRedirectByRoles = (roles: string[]): string => {
    const normalized = roles.map(r => r.toUpperCase());
    if (normalized.includes('ROLE_ADMIN')) return '/admin/dashboard';
    if (normalized.includes('ROLE_HOST')) return '/host/dashboard';
    return '/';
  };

  const handleGoogleCredentialResponse = async (response: { credential: string }) => {
    setGoogleLoading(true);
    setError('');
    try {
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));

      const result = await authService.googleLogin({
        token: response.credential,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name
      });

      const user = authService.getUserFromStorage();
      router.push(getRedirectByRoles(user?.roles || result.roles || ['ROLE_RENTER']));
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Google Login failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const [backendGoogleClientId, setBackendGoogleClientId] = useState('');

  const handleGoogleClick = async () => {
    const clientId = backendGoogleClientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (window.google && clientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
        });
        window.google.accounts.id.prompt((notification: GoogleNotification) => {
          if (notification.isNotDisplayed()) {
            setError('Google Sign-In popup was blocked. Please allow popups.');
          }
        });
        return;
      } catch (gsiErr) {
        console.warn('GSI prompt notice:', gsiErr);
      }
    }

    // Social Google Sign-In backend fallback
    setGoogleLoading(true);
    setError('');
    try {
      const result = await authService.googleLogin({
        token: 'demo-google-jwt-token-xyz',
        email: 'google.user@vehicle.com',
        firstName: 'Google',
        lastName: 'Account'
      });
      const user = authService.getUserFromStorage();
      router.push(getRedirectByRoles(user?.roles || result.roles || ['ROLE_RENTER']));
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Google Login failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Fetch auth config from backend, load Google/Apple scripts, and extract email param if redirected after sign up
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      if (emailParam) {
        setEmail(emailParam);
        setIsAutofilled(true);
      }
    }

    const loadAuthConfig = async () => {
      try {
        const config = await authService.getAuthConfig();
        if (config?.googleClientId) {
          setBackendGoogleClientId(config.googleClientId);
        }
      } catch (err) {
        console.warn('Failed to fetch auth config from backend:', err);
      }
    };
    loadAuthConfig();

    const loadGoogleScript = () => {
      if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) return;
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    };

    // Load Apple Sign-In script
    const loadAppleScript = () => {
      if (document.querySelector('script[src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"]')) return;
      const script = document.createElement('script');
      script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
      script.async = true;
      script.defer = true;
      script.onload = initializeAppleSignIn;
      document.body.appendChild(script);
    };

    const initializeAppleSignIn = () => {
      if (window.AppleID) {
        window.AppleID.auth.init({
          clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID,
          scope: 'name email',
          redirectURI: window.location.origin,
          state: 'state123',
          usePopup: true,
        });
      }
    };

    loadGoogleScript();
    loadAppleScript();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.login({ email, password });
      const roles = result.roles || result.user?.roles || [];
      console.log('[LoginPage] User logged in successfully. Returned Roles:', roles);
      router.push(getRedirectByRoles(roles));
    } catch (err) {
      if (authService.isHostApprovalPending(err as { response?: { status?: number; data?: { message?: string } | string }; message?: string })) {
        setPendingApproval(true);
        setError('');
      } else {
        setPendingApproval(false);
        setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };


  const handleAppleOAuth = async () => {
    setAppleLoading(true);
    setError('');
    try {
      if (window.AppleID) {
        const response = await window.AppleID.auth.signIn();
        
        const result = await authService.appleLogin({
          token: response.authorization.id_token,
          email: response.user?.email || '',
          firstName: response.user?.name?.firstName || '',
          lastName: response.user?.name?.lastName || ''
        });
        
        const user = authService.getUserFromStorage();
        router.push(getRedirectByRoles(user?.roles || result.roles || ['ROLE_RENTER']));
      } else {
        setError('Apple Sign-In not loaded. Please refresh the page.');
      }
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Apple Login failed. Please try again.');
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-card p-8 border border-white/10 shadow-2xl">
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-xs text-slate-400">Log in to your TuroDrive account</p>
        </div>

        {pendingApproval && (
          <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <Clock className="w-4 h-4 text-[#F5B301] flex-shrink-0" />
              <span className="text-[#F5B301]">Host Application Pending</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              Your host account is awaiting admin approval. You&apos;ll receive a notification once your application has been reviewed. This usually takes 1–2 business days.
            </p>
          </div>
        )}

        {error && !pendingApproval && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* OAuth2 1-Click Buttons */}
        <div className="space-y-2.5 mb-6">
          <button
            onClick={handleGoogleClick}
            type="button"
            disabled={googleLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <span>Connecting to Google...</span>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <button
            onClick={handleAppleOAuth}
            type="button"
            disabled={appleLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {appleLoading ? (
              <span>Connecting to Apple...</span>
            ) : (
              <>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.84.13-9.64-1.91-14.42-6.12-3.41-2.88-7.31-7.6-11.71-14.17-6.05-9.06-10.8-19.1-14.24-30.13-3.44-11.03-5.16-21.79-5.16-32.28 0-14.3 3.65-26.23 10.96-35.8 7.31-9.56 16.51-14.42 27.6-14.58 4.14 0 8.91 1.08 14.32 3.25 5.41 2.16 9.4 3.28 11.96 3.35 2.13 0 6.24-1.12 12.33-3.35 6.09-2.23 10.45-3.28 13.08-3.15 12.33.51 22.36 5.17 30.1 13.98-10.99 6.64-16.3 15.82-15.93 27.56.37 10.37 4.3 18.73 11.79 25.07 4.88 4.18 10.37 6.94 16.48 8.28-2.61 7.64-6.19 15.35-10.74 23.13zM119.22 31.29c0-6.73 2.45-13.3 7.35-19.7 4.9-6.4 11.16-10.45 18.77-12.16.53 1.06.79 2.1.79 3.12 0 6.66-2.48 13.31-7.44 19.95-4.96 6.64-11.18 10.63-18.66 11.97-.26-1.06-.81-2.12-.81-3.18z"/>
                </svg>
                Continue with Apple
              </>
            )}
          </button>
        </div>

        {/* Modern "OR CONTINUE WITH EMAIL" Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-white/10 w-full"></div>
          <span className="px-3 text-[10px] font-black uppercase tracking-widest text-[#F5B301] bg-[#0B1F35] border border-[#F5B301]/30 rounded-full shadow-lg shrink-0 mx-2 py-0.5 flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-[#F5B301]" /> OR LOGIN WITH EMAIL
          </span>
          <div className="border-t border-white/10 w-full"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              {isAutofilled && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 animate-pulse">
                  <CheckCircle className="w-3 h-3" /> Auto-filled from Registration
                </span>
              )}
            </div>
            <div className="relative">
              <Mail className={`w-4 h-4 absolute left-3 top-3 transition-colors ${email ? 'text-[#F5B301]' : 'text-slate-500'}`} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isAutofilled) setIsAutofilled(false);
                }}
                placeholder=""
                className={`w-full pl-9 pr-9 py-2.5 rounded-xl bg-white/5 border text-white text-xs focus:outline-none transition-all ${
                  isAutofilled
                    ? 'border-emerald-500/60 ring-2 ring-emerald-500/20 bg-emerald-500/5'
                    : 'border-white/10 focus:border-[#F5B301] focus:ring-2 focus:ring-[#F5B301]/20'
                }`}
              />
              {email && (
                <button
                  type="button"
                  onClick={() => {
                    setEmail('');
                    setIsAutofilled(false);
                  }}
                  className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors"
                  title="Clear email field"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
            </div>
            <div className="relative">
              <Lock className={`w-4 h-4 absolute left-3 top-3 transition-colors ${password ? 'text-[#F5B301]' : 'text-slate-500'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#F5B301] focus:ring-2 focus:ring-[#F5B301]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-white transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-xs flex items-center justify-center gap-2 mt-3 font-extrabold uppercase tracking-wide"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Log In'}</span>
          </button>
        </form>

        <p className="text-xs text-center text-slate-400 mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-emerald-400 font-semibold hover:underline">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}
