'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, SlidersHorizontal, Map as MapIcon, RefreshCw } from 'lucide-react';
import CarCard from '@/components/CarCard';
import FilterDrawer from '@/components/FilterDrawer';
import { vehicleService, Vehicle } from '@/services/vehicleService';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlCategory = searchParams.get('category') || '';
  const urlCity = searchParams.get('city') || '';
  const urlStartDate = searchParams.get('startDate') || '';
  const urlEndDate = searchParams.get('endDate') || '';

  const [city, setCity] = useState(urlCity);
  const [startDate, setStartDate] = useState(urlStartDate);
  const [endDate, setEndDate] = useState(urlEndDate);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: urlCategory,
    maxPrice: 0,
    transmission: '',
    fuelType: '',
  });

  const [error, setError] = useState('');

  // Keep state in sync if URL search params change externally
  useEffect(() => {
    setCity(urlCity);
    setStartDate(urlStartDate);
    setEndDate(urlEndDate);
    setFilters(prev => ({ ...prev, category: urlCategory }));
  }, [urlCity, urlStartDate, urlEndDate, urlCategory]);

  const fetchSearchResults = useCallback(async (customFilters?: typeof filters, customCity?: string, customStart?: string, customEnd?: string) => {
    setLoading(true);
    setError('');

    const targetCity = customCity !== undefined ? customCity : city;
    const targetStart = customStart !== undefined ? customStart : startDate;
    const targetEnd = customEnd !== undefined ? customEnd : endDate;
    const targetFilters = customFilters !== undefined ? customFilters : filters;

    try {
      const results = await vehicleService.searchVehicles({
        city: targetCity,
        startDate: targetStart,
        endDate: targetEnd,
        maxPrice: targetFilters.maxPrice,
        category: targetFilters.category,
      });
      
      // Client-side additional filtering for transmission and fuelType if specified
      let filtered = Array.isArray(results) ? results : [];
      if (targetFilters.transmission) {
        filtered = filtered.filter(v => v.transmission?.toLowerCase() === targetFilters.transmission.toLowerCase());
      }
      if (targetFilters.fuelType) {
        filtered = filtered.filter(v => v.fuelType?.toLowerCase() === targetFilters.fuelType.toLowerCase());
      }

      setVehicles(filtered);
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load search results.');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [city, startDate, endDate, filters]);

  // Initial fetch and fetch when URL parameters change
  useEffect(() => {
    fetchSearchResults(
      { category: urlCategory, maxPrice: filters.maxPrice, transmission: filters.transmission, fuelType: filters.fuelType },
      urlCity,
      urlStartDate,
      urlEndDate
    );
  }, [urlCategory, urlCity, urlStartDate, urlEndDate]);

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (filters.category) params.set('category', filters.category);

    router.push(`${pathname}?${params.toString()}`);
    fetchSearchResults();
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Search Header Controls */}
        <div className="glass-card p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
              placeholder="City"
            />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleSearchSubmit}
              className="flex-1 md:flex-none btn-primary text-xs flex items-center justify-center gap-2 py-2 px-4"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>

            <button
              onClick={() => setDrawerOpen(true)}
              className="flex-1 md:flex-none btn-secondary text-xs flex items-center justify-center gap-2 py-2 px-4"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>Filters {filters.category ? `(${filters.category})` : ''}</span>
            </button>

            <Link
              href="/map"
              className="flex-1 md:flex-none btn-secondary text-xs flex items-center justify-center gap-2 py-2 px-4"
            >
              <MapIcon className="w-4 h-4" />
              <span>Map View</span>
            </Link>
          </div>
        </div>

        {/* Results Title & Count */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">
            Available Cars {city ? `in ${city}` : ''} {filters.category ? `• ${filters.category}` : ''} <span className="text-xs font-semibold text-slate-400">({vehicles.length} cars found)</span>
          </h1>
          <button 
            onClick={() => fetchSearchResults()} 
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Car Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => <div key={n} className="h-72 glass-card animate-pulse"></div>)}
          </div>
        ) : error ? (
          <div className="glass-card p-12 text-center text-rose-400 space-y-3">
            <Search className="w-10 h-10 mx-auto text-slate-600" />
            <h3 className="text-base font-bold text-white">Search failed</h3>
            <p className="text-xs max-w-sm mx-auto">{error}</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 space-y-3">
            <Search className="w-10 h-10 mx-auto text-slate-600" />
            <h3 className="text-base font-bold text-white">No vehicles match your search criteria</h3>
            <p className="text-xs max-w-sm mx-auto">Try resetting filters or expanding your daily price range.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {(Array.isArray(vehicles) ? vehicles : []).map((car) => (
              <CarCard key={car.id} vehicle={car} />
            ))}
          </div>
        )}

      </div>

      {/* Filter Drawer Component */}
      <FilterDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={() => {
          handleSearchSubmit();
        }}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen py-16 flex items-center justify-center text-slate-400 text-sm">
        Loading vehicles...
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
