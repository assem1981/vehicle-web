'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Navigation, MapPin, ArrowRight, X, Users, Fuel, Gauge, Star, ShieldCheck } from 'lucide-react';
import { Vehicle } from '@/services/vehicleService';
import { basePath } from '@/services/basePath';

interface MapViewProps {
  vehicles: Vehicle[];
}

const CITY_COORDS: Record<string, [number, number]> = {
  'new york': [40.7128, -74.0060],
  'los angeles': [34.0522, -118.2437],
  'miami': [25.7617, -80.1918],
  'san francisco': [37.7749, -122.4194],
  'chicago': [41.8781, -87.6298],
  'houston': [29.7604, -95.3698],
  'seattle': [47.6062, -122.3321],
  'boston': [42.3601, -71.0589],
  'dallas': [32.7767, -96.7970],
};

function getVehicleCoords(v: Vehicle, index: number): [number, number] {
  if (v.latitude && v.longitude) {
    return [v.latitude, v.longitude];
  }
  if (v.locationCity) {
    const key = v.locationCity.toLowerCase().trim();
    if (CITY_COORDS[key]) return CITY_COORDS[key];
  }
  const baseLat = 39.8283;
  const baseLng = -98.5795;
  return [baseLat + (index * 0.8), baseLng + (index * 1.2)];
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L: any;
  }
}

export default function MapView({ vehicles }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Map<number, { marker: any; element: HTMLElement }>>(new Map());
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(cssLink);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || !window.L) return;

    const L = window.L;
    const container = mapContainerRef.current;

    // Reset container's internal Leaflet ID if map was previously unmounted
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    if ((container as unknown as { _leaflet_id?: unknown })._leaflet_id) {
      delete (container as unknown as { _leaflet_id?: unknown })._leaflet_id;
    }

    const map = L.map(container, {
      zoomControl: true,
      attributionControl: false,
    }).setView([39.8283, -98.5795], 4);

    mapInstanceRef.current = map;
    markersRef.current.clear();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'dark-map-tiles',
    }).addTo(map);

    const vehicleList = Array.isArray(vehicles) ? vehicles : [];
    const bounds: [number, number][] = [];

    vehicleList.forEach((car, index) => {
      const coords = getVehicleCoords(car, index);
      bounds.push(coords);

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div id="pin-badge-${car.id}" class="map-price-badge">
            <span style="font-size:10px;">★</span>
            <span>$${car.dailyRate}/d</span>
          </div>
        `,
        iconSize: [85, 28],
        iconAnchor: [42, 14],
      });

      const popupHtml = `
        <div style="padding: 8px; min-width: 210px; font-family: 'Inter', system-ui, sans-serif;">
          <div style="font-size: 14px; font-weight: 900; color: #ffffff; margin-bottom: 4px;">${car.make} ${car.model}</div>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px; font-size: 11px; color: #cbd5e1;">
            <span style="color: #F5B301; font-weight: 700;">📍 ${car.locationCity || 'Available City wide'}</span>
            <span style="background: rgba(245, 179, 1, 0.2); color: #F5B301; border: 1px solid rgba(245, 179, 1, 0.3); padding: 1px 6px; border-radius: 4px; font-weight: 800; font-size: 10px;">${car.category || 'Luxury'}</span>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 8px; margin-top: 4px;">
            <div>
              <span style="font-size: 17px; font-weight: 900; color: #F5B301;">$${car.dailyRate}</span>
              <span style="font-size: 10px; color: #94a3b8; font-weight: 500;">/day</span>
            </div>
            <a href="${basePath}/vehicles/${car.id}" style="background: linear-gradient(135deg, #F5B301, #D99B00); color: #0B1F35; font-size: 11px; font-weight: 800; padding: 5px 12px; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 8px rgba(245,179,1,0.4);">
              View Car &rarr;
            </a>
          </div>
        </div>
      `;

      const marker = L.marker(coords, { icon: customIcon }).addTo(map);
      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setActiveVehicle(car);
        map.flyTo(coords, 11, { duration: 1.2, easeLinearity: 0.25 });
        marker.openPopup();

        // Highlight active marker badge
        markersRef.current.forEach((val, id) => {
          const badgeEl = document.getElementById(`pin-badge-${id}`);
          if (badgeEl) {
            if (id === car.id) {
              badgeEl.className = 'map-price-badge-active';
            } else {
              badgeEl.className = 'map-price-badge';
            }
          }
        });
      });

      markersRef.current.set(car.id, { marker, element: document.getElementById(`pin-badge-${car.id}`)! });
    });

    if (bounds.length > 0) {
      if (bounds.length === 1) {
        map.setView(bounds[0], 10);
      } else {
        map.fitBounds(bounds, { padding: [60, 60] });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (container) {
        delete (container as unknown as { _leaflet_id?: unknown })._leaflet_id;
      }
    };
  }, [leafletLoaded, vehicles]);

  return (
    <div className="space-y-4">
      {/* Main Map Container */}
      <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-white/10 glass-card bg-slate-950 flex flex-col justify-between shadow-2xl">
        {/* Map Header Overlay */}
        <div className="absolute top-4 left-4 right-4 z-[500] flex items-center justify-between bg-slate-950/85 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Navigation className="w-4 h-4 text-[#F5B301] animate-pulse" />
            <span>Interactive Vehicle Matrix ({Array.isArray(vehicles) ? vehicles.length : 0} Vehicles Loaded)</span>
          </div>
          <span className="text-[11px] text-[#F5B301] bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-bold flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> Click any price pin to inspect details
          </span>
        </div>

        {/* Leaflet Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-full z-10 bg-slate-950" />
      </div>

      {/* Selected Vehicle Docked Details Panel */}
      {activeVehicle && (
        <div className="glass-card bg-slate-900/95 border-2 border-amber-500/40 rounded-2xl p-5 shadow-2xl animate-fade-in ring-1 ring-amber-500/20 relative">
          
          {/* Close Button */}
          <button
            onClick={() => setActiveVehicle(null)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 text-slate-400 hover:text-white hover:bg-white/20 transition-colors z-10"
            title="Close Details"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            {/* Vehicle Main Info */}
            <div className="flex items-center gap-5 w-full md:w-auto">
              <div className="w-32 h-22 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 border border-white/15 shadow-lg">
                {activeVehicle.imageUrl ? (
                  <img 
                    src={activeVehicle.imageUrl} 
                    alt={activeVehicle.model} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">No image</div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-black text-white">{activeVehicle.make} {activeVehicle.model}</h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[#F5B301] border border-amber-500/30">
                    {activeVehicle.year}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10">
                    {activeVehicle.category || 'Luxury'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-[#F5B301]" />
                    {activeVehicle.locationCity || 'Available City wide'}
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-4 h-4" /> Verified Fleet
                  </span>
                </div>

                {/* Specification Badges */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-slate-200 font-semibold">
                  <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                    <Users className="w-3.5 h-3.5 text-[#F5B301]" /> {activeVehicle.seatingCapacity || 5} Seats
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                    <Fuel className="w-3.5 h-3.5 text-[#F5B301]" /> {activeVehicle.fuelType || 'Gasoline'}
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                    <Gauge className="w-3.5 h-3.5 text-[#F5B301]" /> {activeVehicle.transmission || 'Automatic'}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing & Actions */}
            <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
              <div className="text-left md:text-right">
                <span className="text-3xl font-black text-[#F5B301]">${activeVehicle.dailyRate}</span>
                <span className="text-xs text-slate-400 font-semibold block"> / day</span>
              </div>

              <Link 
                href={`/vehicles/${activeVehicle.id}`}
                className="btn-primary text-xs py-3 px-6 flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"
              >
                <span>Book Vehicle</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
