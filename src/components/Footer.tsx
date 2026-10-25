'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, HelpCircle, PhoneCall, Smartphone } from 'lucide-react';
import { basePath } from '@/services/basePath';
import AppStoreBadges from '@/components/AppStoreBadges';
import SocialLinks from '@/components/SocialLinks';

export default function Footer() {
  return (
    <footer className="bg-[#081728] border-t border-[#F5B301]/20 pt-12 pb-8 mt-20 text-slate-400">
      
      {/* Top Banner: App Store & Social Links Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
        <div className="glass-card p-6 md:p-8 border-[#F5B301]/25 bg-gradient-to-r from-[#0B1F35] via-[#0D2644] to-[#081728] flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
          
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5B301]/15 text-[#F5B301] text-xs font-bold uppercase tracking-wider mb-2">
              <Smartphone className="w-3.5 h-3.5" /> Mobile Experience
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Get the MyMotionLux App
            </h3>
            <p className="text-xs md:text-sm text-slate-300 mt-1 leading-relaxed">
              Unlock vehicles instantly from your phone, manage trips on the go, and connect with 5-star hosts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto justify-center">
            <AppStoreBadges />
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <img 
              src={`${basePath}/assets/mymotionlux/app-icons/logo-dark-square.png`} 
              alt="MyMotionLux" 
              className="h-8 w-8 rounded-lg" 
            />
            <span className="text-base font-black tracking-tight text-white">
              MyMotion<span className="text-[#F5B301]">Lux</span>
            </span>
          </div>
          <p className="text-xs font-bold text-[#F5B301] tracking-wider uppercase mb-3">
            DRIVE • RENT • EXPLORE
          </p>
          <p className="text-xs leading-relaxed text-slate-400 mb-4">
            The premier luxury car sharing marketplace. Book extraordinary vehicles from trusted local hosts.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#F5B301] mb-6">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Liability Protection & 24/7 Roadside Assistance</span>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Follow Our Journey
            </h5>
            <SocialLinks size="sm" />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-4">Explore Vehicles</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/search?category=SUV" className="hover:text-[#F5B301] transition-colors">SUVs & Crossovers</Link></li>
            <li><Link href="/search?category=Electric" className="hover:text-[#F5B301] transition-colors">Electric & Teslas</Link></li>
            <li><Link href="/search?category=Luxury" className="hover:text-[#F5B301] transition-colors">Luxury & Sports Cars</Link></li>
            <li><Link href="/search?category=Sedan" className="hover:text-[#F5B301] transition-colors">Economic Sedans</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-4">Hosting & Community</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/host/onboarding" className="hover:text-[#F5B301] transition-colors">List Your Car</Link></li>
            <li><Link href="/host/onboarding" className="hover:text-[#F5B301] transition-colors">Host Calculator & Earnings</Link></li>
            <li><Link href="/verification" className="hover:text-[#F5B301] transition-colors">Verification Center</Link></li>
            <li><Link href="/reviews" className="hover:text-[#F5B301] transition-colors">Ratings & Reviews</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-4">Support & Assistance</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/support" className="hover:text-[#F5B301] transition-colors flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5" /> Help Center & FAQs</Link></li>
            <li><Link href="/support" className="hover:text-[#F5B301] transition-colors flex items-center gap-1.5"><PhoneCall className="w-3.5 h-3.5" /> File a Claim / Report Damage</Link></li>
            <li><Link href="/support" className="hover:text-[#F5B301] transition-colors">Trust & Safety</Link></li>
            <li><Link href="/support" className="hover:text-[#F5B301] transition-colors">Cancellation Policy</Link></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 MyMotionLux. All rights reserved. DRIVE • RENT • EXPLORE.</p>
        <div className="flex items-center gap-6">
          <Link href="/support" className="hover:text-slate-300">Privacy Policy</Link>
          <Link href="/support" className="hover:text-slate-300">Terms of Service</Link>
          <Link href="/support" className="hover:text-slate-300">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}

