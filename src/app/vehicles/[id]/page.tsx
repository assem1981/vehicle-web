'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MapPin, Users, Fuel, Gauge, ShieldCheck, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import RatingStars from '@/components/RatingStars';
import { vehicleService, Vehicle } from '@/services/vehicleService';
import { api } from '@/services/api';

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = Number(params.id);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [host, setHost] = useState<{ firstName?: string; lastName?: string; rating?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        setLoading(true);
        setError('');
        const v = await vehicleService.getVehicleById(vehicleId);
        setVehicle(v);
        if (v) {
          if (v.hostId) {
            try {
              const hostRes = await api.get(`/api/hosts/${v.hostId}`);
              setHost(hostRes.data);
            } catch (hostErr) {
              console.warn('Host details unavailable, fallback to hostName:', hostErr);
              if (v.hostName) {
                const parts = v.hostName.split(' ');
                setHost({ firstName: parts[0], lastName: parts.slice(1).join(' ') });
              }
            }
          } else if (v.hostName) {
            const parts = v.hostName.split(' ');
            setHost({ firstName: parts[0], lastName: parts.slice(1).join(' ') });
          }
        }
      } catch (err) {
        console.error('Failed to load vehicle:', err);
        setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load vehicle details.');
      } finally {
        setLoading(false);
      }
    };
    if (vehicleId) loadVehicle();
  }, [vehicleId]);

  if (loading) {
    return <div className="max-w-7xl mx-auto p-12 text-center text-slate-400">Loading vehicle details...</div>;
  }

  if (error || !vehicle) {
    return (
      <div className="max-w-7xl mx-auto p-12 text-center text-slate-400">
        <p className="text-red-400">{error || 'Vehicle not found.'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-white">{vehicle.make} {vehicle.model}</h1>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-[#F5B301] border border-amber-500/30">
              {vehicle.year}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#F5B301]" /> {vehicle.locationCity}</span>
            <span className="flex items-center gap-1 text-[#F5B301] font-semibold"><ShieldCheck className="w-3.5 h-3.5" /> Verified Host</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/vehicles/${vehicle.id}/calendar`} className="btn-secondary text-xs flex items-center gap-1.5 py-2.5 px-4">
            <Calendar className="w-4 h-4 text-[#F5B301]" /> Calendar
          </Link>
          <Link href={`/vehicles/${vehicle.id}/pricing`} className="btn-primary text-xs flex items-center gap-1.5 py-2.5 px-4">
            <span>Book from ${vehicle.dailyRate}/day</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Photo Gallery */}
      {vehicle.interiorImageUrl ? (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-3 h-[380px]">
          <div className="rounded-2xl overflow-hidden bg-slate-800 relative">
            <img src={vehicle.imageUrl} alt={`${vehicle.make} ${vehicle.model} - Exterior`} className="w-full h-full object-cover" />
            <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-200">Cover</span>
          </div>
          <div className="rounded-2xl overflow-hidden bg-slate-800 relative">
            <img src={vehicle.interiorImageUrl} alt={`${vehicle.make} ${vehicle.model} - Interior`} className="w-full h-full object-cover" />
            <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-200">Interior</span>
          </div>
        </div>
      ) : (
        <div className="mb-8 rounded-2xl overflow-hidden bg-slate-800 h-[380px]">
          <img src={vehicle.imageUrl} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Main Grid Details & Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Specs & Features */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Specifications */}
          <div className="glass-card p-6 border-white/10">
            <h3 className="text-base font-bold text-white mb-4">Vehicle Specifications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <Users className="w-4 h-4 text-[#F5B301] mb-1" />
                <span className="text-[11px] text-slate-400 block">Seating</span>
                <span className="text-xs font-bold text-white">{vehicle.seatingCapacity ? `${vehicle.seatingCapacity} Seats` : '—'}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <Fuel className="w-4 h-4 text-[#F5B301] mb-1" />
                <span className="text-[11px] text-slate-400 block">Power</span>
                <span className="text-xs font-bold text-white">{vehicle.fuelType || '—'}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <Gauge className="w-4 h-4 text-[#F5B301] mb-1" />
                <span className="text-[11px] text-slate-400 block">Transmission</span>
                <span className="text-xs font-bold text-white">{vehicle.transmission || '—'}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <ShieldCheck className="w-4 h-4 text-[#F5B301] mb-1" />
                <span className="text-[11px] text-slate-400 block">VIN Number</span>
                <span className="text-[11px] font-mono text-slate-300">{vehicle.vin ? vehicle.vin.substring(0, 10) : 'N/A'}...</span>
              </div>
            </div>
          </div>

          {/* Included Features */}
          <div className="glass-card p-6 border-white/10">
            <h3 className="text-base font-bold text-white mb-4">Included Features</h3>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
              {['Autopilot / Self-Driving', 'Apple CarPlay & Android Auto', 'Heated Leather Seats', 'Contactless Keyless Pickup', 'Blindspot Monitoring', 'Unlimited Miles Upgrade'].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F5B301]" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Host Card */}
          <div className="glass-card p-6 border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#F5B301] to-amber-600 flex items-center justify-center text-slate-950 font-extrabold text-xl shadow-lg">
                {host ? `${host.firstName?.[0] || ''}${host.lastName?.[0] || ''}` : 'H'}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Hosted by {host ? `${host.firstName || ''} ${host.lastName || ''}`.trim() : 'Verified Host'}
                </h4>
                <p className="text-xs text-slate-400">Verified Host • Contact via messaging</p>
                {host?.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <RatingStars rating={Math.round(host.rating)} size={14} />
                    <span className="text-xs font-bold text-amber-400 ml-1">{host.rating}</span>
                  </div>
                )}
              </div>
            </div>

            <Link href="/messages" className="btn-secondary text-xs py-2 px-3">
              Message Host
            </Link>
          </div>

        </div>

        {/* Right Column: Pricing & Booking Widget */}
        <div>
          <div className="glass-card p-6 border-amber-500/30 sticky top-24 space-y-6">
            <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-3xl font-black text-white">${vehicle.dailyRate}</span>
                <span className="text-xs text-slate-400"> / day</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-[#F5B301] border border-amber-500/20">
                Free cancellation
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Base Daily Rate</span>
                <span className="text-white font-medium">${vehicle.dailyRate}/day</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Cleanliness & Service Fee</span>
                <span className="text-white font-medium">$25</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Protection Insurance</span>
                <span className="text-[#F5B301] font-medium">Included</span>
              </div>

              <div className="border-t border-white/10 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Estimated Daily Total</span>
                <span className="text-xl font-black text-[#F5B301]">${Number(vehicle.dailyRate || 0) + 25}</span>
              </div>
            </div>

            <Link 
              href={`/vehicles/${vehicle.id}/pricing`} 
              className="w-full btn-primary text-xs py-3.5 flex items-center justify-center gap-2"
            >
              <span>Continue to Reservation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-[11px] text-center text-slate-500">
              You won&apos;t be charged yet until payment is confirmed.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
