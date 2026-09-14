'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Car, Search, MessageSquare, User as UserIcon, LogOut, ShieldCheck, PlusCircle, BookmarkCheck, ChevronDown } from 'lucide-react';
import { authService, UserSession } from '@/services/authService';

/**
 * Returns the display label and color for the user's primary (highest priority) role.
 */
function getRoleBadge(roles: string[]): { label: string; className: string } {
  const norm = (roles || []).map(r => String(r).toUpperCase());
  if (norm.includes('ROLE_ADMIN') || norm.includes('ADMIN')) return { label: 'Admin', className: 'bg-amber-500/20 text-[#F5B301] border-amber-500/40' };
  if (norm.includes('ROLE_HOST') || norm.includes('HOST'))  return { label: 'Host',  className: 'bg-blue-500/20 text-blue-400 border-blue-500/40' };
  return { label: 'User', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /**
   * Syncs user state from localStorage.
   * Called on route change and whenever an auth event fires.
   */
  const syncUser = useCallback(() => {
    const stored = authService.getUserFromStorage();
    setUser(stored);
  }, []);

  useEffect(() => {
    // Initial sync after hydration so server and client render match.
    syncUser();

    // Listen for same-tab auth changes (custom event dispatched by authService)
    const handleAuthChange = () => syncUser();
    window.addEventListener('auth-change', handleAuthChange);

    // Listen for cross-tab storage changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token') syncUser();
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [syncUser]);



  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setDropdownOpen(false);
    router.push('/auth/login');
  };

  const roleBadge = user ? getRoleBadge(user.roles || []) : null;

  return (
    <header className="sticky top-0 z-50 bg-[#0B1F35]/90 backdrop-blur-md border-b border-[#F5B301]/20 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Tagline */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img 
            src="/assets/mymotionlux/app-icons/logo-dark-square.png" 
            alt="MyMotionLux" 
            className="h-9 w-9 rounded-lg shadow-lg shadow-[#F5B301]/10 group-hover:scale-105 transition-transform" 
          />
          <div className="flex flex-col leading-none">
            <span className="text-lg font-black tracking-tight text-white">
              MyMotion<span className="text-[#F5B301]">Lux</span>
            </span>
            <span className="hidden sm:block text-[8px] tracking-[0.25em] font-bold text-[#F5B301]/70 uppercase mt-0.5">
              DRIVE • RENT • EXPLORE
            </span>
          </div>
        </Link>

        {/* Quick Search Pill */}
        <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 shadow-inner hover:border-[#F5B301]/40 transition-colors">
          <Search className="w-4 h-4 text-[#F5B301]" />
          <span className="text-xs text-slate-300 font-medium">Where to next?</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F5B301]/20 text-[#F5B301] font-bold">Explore</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">

          {user ? (
            <div className="flex items-center gap-2">
              <Link 
                href="/messages" 
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 transition-colors relative"
                title="Messages"
              >
                <MessageSquare className="w-4 h-4" />
              </Link>

              <Link 
                href="/bookings/history" 
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 transition-colors"
                title="Booking History"
              >
                <BookmarkCheck className="w-4 h-4" />
              </Link>

              <Link 
                href="/verification" 
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[#F5B301] transition-colors"
                title="ID Verification"
              >
                <ShieldCheck className="w-4 h-4" />
              </Link>

              {/* User Profile Dropdown */}
              <div className="relative pl-2 border-l border-white/10">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  {/* Avatar Circle */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5B301] to-amber-600 flex items-center justify-center text-xs font-black text-[#0B1F35] shadow-md">
                    {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-xs font-semibold text-white">
                      {user.firstName} {user.lastName}
                    </span>
                    {roleBadge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border mt-0.5 ${roleBadge.className}`}>
                        {roleBadge.label}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#0f1d31] border border-white/10 shadow-2xl shadow-black/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                        <p className="text-sm font-bold text-white truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                        {roleBadge && (
                          <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-md border mt-1.5 ${roleBadge.className}`}>
                            {roleBadge.label}
                          </span>
                        )}
                      </div>
                      
                      <div className="py-1.5">
                        {authService.hasRole(user, 'ADMIN') && (
                          <Link 
                            href="/admin/dashboard" 
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#F5B301] font-semibold hover:bg-amber-500/10 transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Admin Portal
                          </Link>
                        )}

                        {(authService.hasRole(user, 'HOST') || authService.hasRole(user, 'ADMIN')) && (
                          <Link 
                            href="/host/dashboard" 
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-blue-400 font-semibold hover:bg-blue-500/10 transition-colors"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            Host Dashboard
                          </Link>
                        )}

                        {(authService.hasRole(user, 'ADMIN') || authService.hasRole(user, 'HOST')) && (
                          <div className="border-t border-white/10 my-1"></div>
                        )}
                        <Link 
                          href="/profile" 
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <UserIcon className="w-3.5 h-3.5" />
                          My Profile
                        </Link>
                        <Link 
                          href="/bookings/history" 
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <BookmarkCheck className="w-3.5 h-3.5" />
                          My Bookings
                        </Link>
                        <Link 
                          href="/messages" 
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Messages
                        </Link>
                      </div>

                      <div className="border-t border-white/10 py-1.5">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                href="/auth/login" 
                className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-200 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link 
                href="/auth/register" 
                className="btn-primary text-xs font-bold px-4 py-2"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
