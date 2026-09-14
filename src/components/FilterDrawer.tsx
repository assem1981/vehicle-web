'use client';

import React from 'react';
import { X, SlidersHorizontal, DollarSign, Car, Users, Fuel } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    category: string;
    maxPrice: number;
    transmission: string;
    fuelType: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{ category: string; maxPrice: number; transmission: string; fuelType: string }>>;
  onApply: () => void;
}

export default function FilterDrawer({ isOpen, onClose, filters, setFilters, onApply }: FilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0f172a] h-full p-6 border-l border-white/10 flex flex-col justify-between overflow-y-auto">
        
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Refine Vehicle Search</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 block flex items-center gap-1.5">
              <Car className="w-4 h-4 text-emerald-400" /> Vehicle Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['All', 'SUV', 'Sedan', 'Electric', 'Luxury', 'Truck'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilters({ ...filters, category: cat === 'All' ? '' : cat })}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    (filters.category === cat || (cat === 'All' && !filters.category))
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Max Daily Rate Slider */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Max Daily Rate
              </label>
              <span className="text-sm font-bold text-emerald-400">{filters.maxPrice > 0 ? `$${filters.maxPrice} / day` : 'Any price'}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="500" 
              step="10"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
              className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>Any</span>
              <span>$500+</span>
            </div>
          </div>

          {/* Transmission Filter */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 block flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" /> Transmission
            </label>
            <div className="flex gap-2">
              {['Any', 'Automatic', 'Manual'].map((trans) => (
                <button
                  key={trans}
                  onClick={() => setFilters({ ...filters, transmission: trans === 'Any' ? '' : trans })}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    (filters.transmission === trans || (trans === 'Any' && !filters.transmission))
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {trans}
                </button>
              ))}
            </div>
          </div>

          {/* Fuel Type */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 block flex items-center gap-1.5">
              <Fuel className="w-4 h-4 text-emerald-400" /> Fuel / Power Source
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Any', 'Gasoline', 'Electric', 'Hybrid'].map((fuel) => (
                <button
                  key={fuel}
                  onClick={() => setFilters({ ...filters, fuelType: fuel === 'Any' ? '' : fuel })}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    (filters.fuelType === fuel || (fuel === 'Any' && !filters.fuelType))
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {fuel}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex gap-3">
          <button 
            onClick={() => {
              setFilters({ category: '', maxPrice: 0, transmission: '', fuelType: '' });
            }}
            className="flex-1 btn-secondary text-xs"
          >
            Reset All
          </button>
          <button 
            onClick={() => {
              onApply();
              onClose();
            }}
            className="flex-1 btn-primary text-xs"
          >
            Show Results
          </button>
        </div>

      </div>
    </div>
  );
}
