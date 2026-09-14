'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Grid, RefreshCw } from 'lucide-react';
import MapView from '@/components/MapView';
import { vehicleService, Vehicle } from '@/services/vehicleService';

export default function MapPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const data = await vehicleService.getAllVehicles();
      setVehicles(data);
    } catch (err) {
      console.error('Failed to load vehicles for map:', err);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/search" className="btn-secondary text-xs flex items-center gap-2 py-2 px-3">
            <ArrowLeft className="w-4 h-4" /> Back to Search
          </Link>
          <h1 className="text-xl font-bold text-white hidden sm:block">Vehicle Map Explorer</h1>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={loadVehicles} 
            className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Map</span>
          </button>
          <Link href="/search" className="btn-primary text-xs flex items-center gap-2 py-2 px-4">
            <Grid className="w-4 h-4" /> Grid View
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="w-full h-[700px] rounded-2xl glass-card border border-white/10 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-2 border-[#F5B301] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold">Loading live vehicle GPS map coordinates...</p>
        </div>
      ) : (
        <MapView vehicles={vehicles} />
      )}
    </div>
  );
}
