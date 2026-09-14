'use client';

import React from 'react';
import Link from 'next/link';
import { Star, MapPin, Users, Fuel, Gauge } from 'lucide-react';
import { Vehicle } from '@/services/vehicleService';

interface CarCardProps {
  vehicle: Vehicle;
}

export default function CarCard({ vehicle }: CarCardProps) {
  const imageSrc = vehicle.imageUrl;

  return (
    <Link href={`/vehicles/${vehicle.id}`} className="glass-card group overflow-hidden block">
      {/* Vehicle Image Cover */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-800">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={`${vehicle.make} ${vehicle.model}`} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
            No image available
          </div>
        )}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-400 border border-white/10">
          {vehicle.category || 'Luxury'}
        </div>
        {vehicle.locationCity && (
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-medium text-slate-200 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{vehicle.locationCity}</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
              {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-xs text-slate-400 font-medium">{vehicle.year} • {vehicle.transmission || '—'}</p>
          </div>
          {vehicle.rating && (
            <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-white">{vehicle.rating}</span>
            </div>
          )}
        </div>

        {/* Feature Tags */}
        <div className="flex items-center gap-3 my-3 text-xs text-slate-400 border-y border-white/5 py-2">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>{vehicle.seatingCapacity ? `${vehicle.seatingCapacity} Seats` : '—'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Fuel className="w-3.5 h-3.5 text-slate-500" />
            <span>{vehicle.fuelType || '—'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-slate-500" />
            <span>{vehicle.transmission || '—'}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-xl font-extrabold text-white">${vehicle.dailyRate}</span>
            <span className="text-xs text-slate-400 font-medium"> / day</span>
          </div>
          <span className="text-xs font-semibold text-emerald-400 group-hover:underline flex items-center gap-0.5">
            Book now &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
