'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Calendar, MapPin, ShieldCheck, Zap, Award, Sparkles, SlidersHorizontal, ArrowRight, Smartphone } from 'lucide-react';
import CarCard from '@/components/CarCard';
import AppStoreBadges from '@/components/AppStoreBadges';
import SocialLinks from '@/components/SocialLinks';
import { vehicleService, Vehicle } from '@/services/vehicleService';

export default function HomePage() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const data = await vehicleService.getAllVehicles();
        setVehicles(data);
      } catch (err) {
        console.error('Failed to load vehicles:', err);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };
    loadVehicles();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?city=${encodeURIComponent(city)}&startDate=${startDate}&endDate=${endDate}`);
  };

  return (
    <div className="min-h-screen">
      
      {/* MyMotionLux Hero Banner Section */}
      <section className="relative pt-20 pb-28 overflow-hidden border-b border-[#F5B301]/20 min-h-[520px] flex items-center">
        {/* Background Image Hero Banner */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/mymotionlux/banners/hero-desktop-1920x845.jpg" 
            alt="MyMotionLux Hero" 
            className="w-full h-full object-cover object-center opacity-40 filter contrast-125" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F35] via-[#0B1F35]/85 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F35] via-transparent to-[#0B1F35]/70"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 w-full">
          
          <div className="max-w-3xl mb-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5B301]/15 border border-[#F5B301]/30 text-[#F5B301] text-xs font-bold mb-5 tracking-widest uppercase shadow-lg">
              <Sparkles className="w-4 h-4 text-[#F5B301]" />
              <span>DRIVE • RENT • EXPLORE</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none mb-6">
              Experience the Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5B301] via-amber-300 to-yellow-200">
                Luxury & Performance Motion.
              </span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl">
              Elevate every journey. Rent extraordinary vehicles from verified local hosts across 10,000+ destinations on MyMotionLux.
            </p>
          </div>

          {/* Instant Search Bar Card */}
          <form onSubmit={handleSearchSubmit} className="glass-card p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-2xl border-[#F5B301]/20">
            
            <div className="flex flex-col gap-1.5 border-b md:border-b-0 md:border-r border-white/10 pb-3 md:pb-0 md:pr-4">
              <label className="text-xs font-bold text-[#F5B301] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#F5B301]" /> Where
              </label>
              <input 
                type="text" 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City, airport, or address"
                className="bg-transparent text-white text-sm font-semibold focus:outline-none placeholder:text-slate-500"
              />
            </div>

            <div className="flex flex-col gap-1.5 border-b md:border-b-0 md:border-r border-white/10 pb-3 md:pb-0 md:pr-4">
              <label className="text-xs font-bold text-[#F5B301] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#F5B301]" /> From
              </label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-white text-sm font-semibold focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5 pb-3 md:pb-0 md:pr-4">
              <label className="text-xs font-bold text-[#F5B301] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#F5B301]" /> Until
              </label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-white text-sm font-semibold focus:outline-none"
              />
            </div>

            <button type="submit" className="btn-primary flex items-center justify-center gap-2 h-full text-sm font-extrabold uppercase tracking-wide">
              <Search className="w-4 h-4" />
              <span>Search Cars</span>
            </button>

          </form>

        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-12 max-w-7xl mx-auto px-4 md:px-8">
        <h2 className="text-xl font-bold text-white mb-6">Browse by Experience</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Electric & Teslas', cat: 'Electric', img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=400&q=80' },
            { label: 'SUVs & All-Wheel', cat: 'SUV', img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80' },
            { label: 'Luxury & Sports', cat: 'Luxury', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80' },
            { label: 'Economic Sedans', cat: 'Sedan', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=400&q=80' },
          ].map((item) => (
            <Link 
              key={item.cat} 
              href={`/search?category=${item.cat}`}
              className="glass-card group overflow-hidden relative h-32 flex items-end p-4 border border-white/10 hover:border-[#F5B301]/50 transition-all"
            >
              <img src={item.img} alt={item.label} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              <span className="relative z-10 text-xs font-bold text-white group-hover:text-[#F5B301] transition-colors">
                {item.label} &rarr;
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Vehicles List */}
      <section className="py-12 max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-white">Featured Luxury Fleet</h2>
            <p className="text-xs text-slate-400 mt-1">Top-rated vehicles hosted by verified MyMotionLux Superhosts</p>
          </div>
          <Link href="/search" className="text-xs font-bold text-[#F5B301] hover:underline flex items-center gap-1">
            View All Cars <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => <div key={n} className="h-72 glass-card animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {(Array.isArray(vehicles) ? vehicles : []).map((v) => (
              <CarCard key={v.id} vehicle={v} />
            ))}
          </div>
        )}
      </section>

      {/* Trust & Features Section */}
      <section className="py-16 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-card p-6 border-white/10">
            <div className="w-12 h-12 rounded-xl bg-[#F5B301]/10 border border-[#F5B301]/20 text-[#F5B301] flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Liability Protection Included</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Book with peace of mind on MyMotionLux. Every trip is backed by comprehensive liability protection and 24/7 roadside assistance.
            </p>
          </div>

          <div className="glass-card p-6 border-white/10">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Contactless Digital Check-in</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unlock your vehicle seamlessly from your phone or use digital code lockboxes for fast 24/7 keyless pickup.
            </p>
          </div>

          <div className="glass-card p-6 border-white/10">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#F5B301] flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Superhost Quality Standards</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose from 5-star rated hosts who keep their luxury vehicles sanitized, inspected, and ready for your ride.
            </p>
          </div>

        </div>
      </section>

      {/* Dedicated App Download & Social Banner */}
      <section className="py-20 max-w-7xl mx-auto px-4 md:px-8">
        <div className="glass-card p-8 md:p-12 border-[#F5B301]/30 bg-gradient-to-br from-[#0B1F35] via-[#0D2644] to-[#061220] relative overflow-hidden shadow-2xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5B301]/20 border border-[#F5B301]/30 text-[#F5B301] text-xs font-bold uppercase tracking-wider mb-4">
                <Smartphone className="w-4 h-4" /> Download Mobile App
              </div>

              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                Drive Anywhere, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5B301] to-amber-200">
                  Right From Your Phone.
                </span>
              </h2>

              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8 max-w-xl">
                Experience instant keyless entry, real-time GPS tracking, 24/7 host chat, and effortless booking management on iOS and Android.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 w-full">
                <AppStoreBadges />
              </div>

              <div className="border-t border-white/10 pt-6 w-full">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Connect With Us On Social Media
                </p>
                <SocialLinks size="md" />
              </div>
            </div>

            {/* App Mockup Preview Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm rounded-3xl bg-slate-900/90 border-4 border-slate-800 p-4 shadow-2xl backdrop-blur-md hover:border-[#F5B301]/40 transition-all group">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <img src="/assets/mymotionlux/app-icons/logo-dark-square.png" alt="Logo" className="w-7 h-7 rounded-md" />
                    <span className="text-xs font-black text-white">MyMotionLux App</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live Demo
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="h-36 rounded-xl bg-slate-800 overflow-hidden relative">
                    <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80" alt="App preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                      <span className="text-xs font-bold text-white">Porsche 911 Carrera S • 2024</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400">Digital Vehicle Key</p>
                      <p className="text-xs font-bold text-white">Ready for Unlock</p>
                    </div>
                    <span className="px-3 py-1 text-[11px] font-bold rounded-lg bg-[#F5B301] text-black">
                      Unlock
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}

