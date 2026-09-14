'use client';

import React from 'react';

export function AppleStoreBadge({ className = '' }: { className?: string }) {
  return (
    <a 
      href="https://apple.com/app-store" 
      target="_blank" 
      rel="noopener noreferrer"
      title="Download MyMotionLux on Apple App Store"
      aria-label="Download MyMotionLux on Apple App Store"
      className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 hover:border-[#F5B301]/60 hover:bg-slate-800 transition-all shadow-lg group ${className}`}
    >
      <svg className="w-7 h-7 text-white group-hover:text-[#F5B301] transition-colors shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.05-.96.04-2.13.64-2.82 1.44-.61.71-1.15 1.86-.99 2.97 1.07.08 2.16-.56 2.82-1.36z"/>
      </svg>
      <div className="flex flex-col text-left">
        <span className="text-[10px] uppercase font-bold text-slate-400 leading-tight">Download on the</span>
        <span className="text-sm font-extrabold text-white group-hover:text-[#F5B301] transition-colors leading-tight">Apple App Store</span>
      </div>
    </a>
  );
}

export function GooglePlayBadge({ className = '' }: { className?: string }) {
  return (
    <a 
      href="https://play.google.com/store" 
      target="_blank" 
      rel="noopener noreferrer"
      title="Get MyMotionLux on Google Play Store"
      aria-label="Get MyMotionLux on Google Play Store"
      className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 hover:border-[#F5B301]/60 hover:bg-slate-800 transition-all shadow-lg group ${className}`}
    >
      <svg className="w-7 h-7 text-[#F5B301] shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.609 1.814L13.792 12 3.61 22.186a2.372 2.372 0 01-.61-1.616V3.43c0-.625.228-1.205.609-1.616zm11.597 11.601L17.75 11l-2.544-2.415L3.923 1.9a1.69 1.69 0 01.996-.312c.384 0 .764.122 1.082.355l11.605 6.7 5.795 3.353c.691.4 1.119 1.135 1.119 1.934s-.428 1.534-1.119 1.934l-5.795 3.353-11.605 6.7a2.157 2.157 0 01-1.082.355 1.69 1.69 0 01-.996-.312l11.284-6.586z"/>
      </svg>
      <div className="flex flex-col text-left">
        <span className="text-[10px] uppercase font-bold text-slate-400 leading-tight">GET IT ON</span>
        <span className="text-sm font-extrabold text-white group-hover:text-[#F5B301] transition-colors leading-tight">Google Play Store</span>
      </div>
    </a>
  );
}

export default function AppStoreBadges({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <AppleStoreBadge />
      <GooglePlayBadge />
    </div>
  );
}
