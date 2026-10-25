'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Car, 
  Search, 
  MessageSquare, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  PlusCircle, 
  BookmarkCheck, 
  ChevronDown,
  LayoutDashboard,
  Shield,
  Menu,
  X,
  Sparkles,
  CalendarDays,
  DollarSign,
  Wrench,
  Users,
  FileText
} from 'lucide-react';
import { authService, UserSession } from '@/services/authService';
import { chatService } from '@/services/chatService';
import { socketService } from '@/services/socketService';

/**
 * Returns the display label and color styling for the user's primary (highest priority) role.
 */
function getRoleBadge(roles: string[]): { label: string; className: string } {
  const norm = (roles || []).map(r => String(r).toUpperCase());
  if (norm.includes('ROLE_ADMIN') || norm.includes('ADMIN')) return { label: 'Admin', className: 'bg-amber-500/20 text-[#F5B301] border-amber-500/40' };
  if (norm.includes('ROLE_HOST') || norm.includes('HOST'))  return { label: 'Host',  className: 'bg-blue-500/20 text-blue-400 border-blue-500/40' };
  return { label: 'User', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  /**
   * Syncs user state from localStorage.
   */
  const syncUser = useCallback(() => {
    const stored = authService.getUserFromStorage();
    setUser(stored);
  }, []);

  const fetchUnread = useCallback(async () => {
    if (!user) return;
    try {
      const count = await chatService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // fallback
    }
  }, [user]);

  useEffect(() => {
    syncUser();

    const handleAuthChange = () => syncUser();
    window.addEventListener('auth-change', handleAuthChange);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token') syncUser();
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [syncUser]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    const unsubscribe = socketService.subscribeToUnreadCount((count) => {
      setUnreadCount(count);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [fetchUnread]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push('/auth/login');
  };

  const handleMessageClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    if (unreadCount > 0) {
      try {
        const unreadThread = await chatService.getLatestUnreadThread();
        if (unreadThread) {
          const isHost = authService.hasRole(user, 'HOST');
          if (isHost) {
            router.push(`/host/messages?userId=${unreadThread.otherUserId}&bookingId=${unreadThread.bookingId || ''}&openUnread=true`);
          } else {
            router.push(`/messages?hostId=${unreadThread.otherUserId}&bookingId=${unreadThread.bookingId || ''}&openUnread=true`);
          }
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch unread thread:', err);
      }
    }
    const isHost = authService.hasRole(user, 'HOST');
    router.push(isHost ? '/host/messages' : '/messages');
  };

  const isAdmin = authService.hasRole(user, 'ADMIN');
  const isHost = authService.hasRole(user, 'HOST');
  const roleBadge = user ? getRoleBadge(user.roles || []) : null;

  return (
    <header className="sticky top-0 z-50 bg-[#0B1F35]/95 backdrop-blur-md border-b border-[#F5B301]/20 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img 
              src="/vehicle/assets/mymotionlux/app-icons/logo-dark-square.png" 
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

          {/* Desktop Role-Based Quick Nav Bar Links */}
          <nav className="hidden lg:flex items-center gap-1.5 pl-4 border-l border-white/10">
            {isAdmin && (
              <>
                <Link 
                  href="/admin/dashboard" 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    pathname?.startsWith('/admin') 
                      ? 'bg-amber-500/20 text-[#F5B301] border border-amber-500/40 shadow-sm' 
                      : 'text-amber-300/80 hover:text-[#F5B301] hover:bg-white/5'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin Console
                </Link>
                <Link 
                  href="/admin/host-approvals" 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    pathname === '/admin/host-approvals' ? 'text-[#F5B301] bg-white/5' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Approvals
                </Link>
              </>
            )}

            {isHost && (
              <>
                <Link 
                  href="/host/dashboard" 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    pathname?.startsWith('/host') 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-sm' 
                      : 'text-blue-300/80 hover:text-blue-400 hover:bg-white/5'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Host Hub
                </Link>
                <Link 
                  href="/host/vehicles" 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    pathname === '/host/vehicles' ? 'text-blue-400 bg-white/5' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  My Fleet
                </Link>
                <Link 
                  href="/host/bookings" 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    pathname === '/host/bookings' ? 'text-blue-400 bg-white/5' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Host Bookings
                </Link>
              </>
            )}

            {!isAdmin && !isHost && (
              <>
                <Link 
                  href="/search" 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    pathname === '/search' ? 'text-[#F5B301] bg-white/5' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-[#F5B301]" />
                  Explore Vehicles
                </Link>
                <Link 
                  href="/host/onboarding" 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Become a Host
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Quick Search Pill (Center) */}
        {!isAdmin && (
          <div 
            onClick={() => router.push('/search')}
            className="hidden xl:flex items-center gap-3 bg-white/5 border border-white/10 hover:border-[#F5B301]/40 rounded-full px-4 py-1.5 shadow-inner cursor-pointer transition-colors"
          >
            <Search className="w-4 h-4 text-[#F5B301]" />
            <span className="text-xs text-slate-300 font-medium">Search luxury vehicles & locations...</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F5B301]/20 text-[#F5B301] font-bold">Search</span>
          </div>
        )}

        {/* Action Controls & Profile Menu */}
        <div className="flex items-center gap-2.5">

          {/* Quick Host Add Vehicle Button */}
          {(isHost || isAdmin) && (
            <Link
              href="/host/vehicles/new"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#F5B301] text-slate-950 text-xs font-extrabold shadow-md hover:brightness-110 transition-all"
              title="Add New Vehicle"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>List Car</span>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              
              {/* Messages Notification Button */}
              <button 
                onClick={handleMessageClick}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 transition-colors relative"
                title="Messages"
              >
                <MessageSquare className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white shadow-lg animate-pulse border border-rose-400">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Bookings Link */}
              <Link 
                href={isHost ? "/host/bookings" : "/bookings/history"} 
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 transition-colors"
                title={isHost ? "Host Bookings" : "My Bookings"}
              >
                <BookmarkCheck className="w-4 h-4" />
              </Link>

              {/* Identity Verification Status */}
              <Link 
                href={isHost ? "/host/verification" : "/verification"} 
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[#F5B301] transition-colors"
                title="Identity Verification"
              >
                <ShieldCheck className="w-4 h-4" />
              </Link>

              {/* User Profile Dropdown Button */}
              <div className="relative pl-1.5 border-l border-white/10">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-md ${
                    isAdmin 
                      ? 'bg-gradient-to-br from-amber-400 to-[#F5B301] text-slate-950 ring-2 ring-amber-500/50' 
                      : isHost 
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white ring-2 ring-blue-500/50' 
                        : 'bg-gradient-to-br from-[#F5B301] to-amber-600 text-[#0B1F35]'
                  }`}>
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

                {/* Dropdown Menu Window */}
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-[#0f1d31] border border-white/15 shadow-2xl shadow-black/80 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      
                      {/* Dropdown User Header */}
                      <div className="px-4 py-3 border-b border-white/10 bg-white/[0.03]">
                        <p className="text-sm font-bold text-white truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                        {roleBadge && (
                          <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-md border mt-2 ${roleBadge.className}`}>
                            {roleBadge.label} Mode Active
                          </span>
                        )}
                      </div>

                      <div className="py-2 max-h-[70vh] overflow-y-auto space-y-1">
                        
                        {/* ADMIN ROLE SECTION */}
                        {isAdmin && (
                          <div className="px-2 py-1">
                            <div className="px-2 py-1 text-[10px] font-bold text-[#F5B301] uppercase tracking-wider flex items-center justify-between">
                              <span>Admin Suite</span>
                              <Shield className="w-3 h-3 text-[#F5B301]" />
                            </div>
                            <Link 
                              href="/admin/dashboard" 
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-amber-300 font-semibold hover:bg-amber-500/10 transition-colors"
                            >
                              <LayoutDashboard className="w-3.5 h-3.5 text-[#F5B301]" />
                              Executive Dashboard
                            </Link>
                            <Link 
                              href="/admin/host-approvals" 
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                              Host Approvals
                            </Link>
                            <Link 
                              href="/admin/users" 
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                              <Users className="w-3.5 h-3.5 text-amber-400" />
                              User & Host Directory
                            </Link>
                            <Link 
                              href="/admin/bookings" 
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-amber-400" />
                              All System Bookings
                            </Link>
                          </div>
                        )}

                        {/* HOST ROLE SECTION */}
                        {(isHost || isAdmin) && (
                          <div className="px-2 py-1 border-t border-white/10">
                            <div className="px-2 py-1 text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center justify-between">
                              <span>Host Center</span>
                              <Car className="w-3 h-3 text-blue-400" />
                            </div>
                            <Link 
                              href="/host/dashboard" 
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-blue-300 font-semibold hover:bg-blue-500/10 transition-colors"
                            >
                              <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
                              Host Overview Hub
                            </Link>
                            <Link 
                              href="/host/vehicles" 
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                              <Car className="w-3.5 h-3.5 text-blue-400" />
                              My Vehicle Fleet
                            </Link>
                            <Link 
                              href="/host/vehicles/new" 
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                              <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
                              Add New Vehicle
                            </Link>
                            <Link 
                              href="/host/bookings" 
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                              <BookmarkCheck className="w-3.5 h-3.5 text-blue-400" />
                              Host Guest Bookings
                            </Link>
                            <Link 
                              href="/host/calendar" 
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                              <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
                              Rates & Calendar
                            </Link>
                            <Link 
                              href="/host/earnings" 
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                              <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                              Earnings & Payouts
                            </Link>
                          </div>
                        )}

                        {/* RENTER & ACCOUNT SECTION */}
                        <div className="px-2 py-1 border-t border-white/10">
                          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            My Account
                          </div>
                          <Link 
                            href="/profile" 
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <UserIcon className="w-3.5 h-3.5" />
                            My Profile Settings
                          </Link>
                          <Link 
                            href="/bookings/history" 
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <BookmarkCheck className="w-3.5 h-3.5" />
                            My Trip History
                          </Link>
                          <button 
                            onClick={(e) => {
                              handleMessageClick(e);
                            }}
                            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors w-full text-left"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Messages</span>
                            {unreadCount > 0 && (
                              <span className="ml-auto px-1.5 py-0.2 rounded-full bg-rose-500 text-[9px] font-bold text-white">
                                {unreadCount}
                              </span>
                            )}
                          </button>
                        </div>

                      </div>

                      {/* Sign Out Footer */}
                      <div className="border-t border-white/10 p-2 bg-white/[0.02]">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full text-left font-semibold"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out Account
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

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-white/10 space-y-3 pb-2 animate-in fade-in duration-200">
          
          {/* Quick Search for Mobile */}
          <div 
            onClick={() => { setMobileMenuOpen(false); router.push('/search'); }}
            className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-300 cursor-pointer"
          >
            <Search className="w-4 h-4 text-[#F5B301]" />
            <span>Search vehicles...</span>
          </div>

          {/* Role Navigation Mobile Links */}
          <div className="space-y-1">
            {isAdmin && (
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <div className="text-[10px] font-bold text-[#F5B301] uppercase px-2">Admin Portal</div>
                <Link 
                  href="/admin/dashboard" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-1.5 text-xs text-amber-300 font-medium hover:bg-white/5 rounded-lg"
                >
                  <Shield className="w-3.5 h-3.5 text-[#F5B301]" />
                  Admin Executive Dashboard
                </Link>
                <Link 
                  href="/admin/host-approvals" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-300 hover:bg-white/5 rounded-lg"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Host Approvals
                </Link>
              </div>
            )}

            {(isHost || isAdmin) && (
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                <div className="text-[10px] font-bold text-blue-400 uppercase px-2">Host Center</div>
                <Link 
                  href="/host/dashboard" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-1.5 text-xs text-blue-300 font-medium hover:bg-white/5 rounded-lg"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
                  Host Dashboard
                </Link>
                <Link 
                  href="/host/vehicles" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-300 hover:bg-white/5 rounded-lg"
                >
                  <Car className="w-3.5 h-3.5 text-blue-400" />
                  My Fleet & Vehicles
                </Link>
                <Link 
                  href="/host/bookings" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-300 hover:bg-white/5 rounded-lg"
                >
                  <BookmarkCheck className="w-3.5 h-3.5 text-blue-400" />
                  Host Bookings
                </Link>
              </div>
            )}

            <div className="p-2 space-y-1">
              <Link 
                href="/search" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-300 hover:bg-white/5 rounded-lg"
              >
                <Search className="w-3.5 h-3.5 text-[#F5B301]" />
                Explore Vehicles
              </Link>
              <Link 
                href="/bookings/history" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-300 hover:bg-white/5 rounded-lg"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-slate-400" />
                My Bookings
              </Link>
              <button 
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleMessageClick(e);
                }}
                className="flex items-center justify-between w-full px-2 py-1.5 text-xs text-slate-300 hover:bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>Messages</span>
                </div>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
