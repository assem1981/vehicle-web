'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Lock, Unlock, DollarSign, Sparkles, CheckCircle2 } from 'lucide-react';
import { hostService } from '@/services/hostService';
import { Vehicle } from '@/services/vehicleService';

export default function HostCalendarPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [blockedDates, setBlockedDates] = useState<number[]>([]);
  const [customPriceDays, setCustomPriceDays] = useState<Record<number, number>>({});
  const [surgeRateInput, setSurgeRateInput] = useState(145);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const res = await hostService.getHostVehicles();
        setVehicles(res);
        if (res.length > 0) {
          setSelectedVehicle(String(res[0].id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadVehicles();
  }, []);

  const toggleBlockDay = (day: number) => {
    if (blockedDates.includes(day)) {
      setBlockedDates(blockedDates.filter(d => d !== day));
    } else {
      setBlockedDates([...blockedDates, day]);
    }
  };

  const applyCustomPrice = (day: number) => {
    setCustomPriceDays({ ...customPriceDays, [day]: surgeRateInput });
  };

  const selectedVehicleData = vehicles.find(v => String(v.id) === selectedVehicle);
  const baseRate = selectedVehicleData?.dailyRate ?? 0;

  if (loading) return <div className="p-8 text-center text-slate-400">Loading vehicles...</div>;

  return (
    <div className="space-y-6">

      {/* Controls & Vehicle Selector */}
      <div className="glass-card p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Rates & Calendar Availability</h2>
          <p className="text-xs text-slate-400">Block unavailable dates or set custom surge pricing for holidays</p>
        </div>

        <select
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
        >
          {vehicles.length === 0 ? (
            <option value="">No vehicles found</option>
          ) : (
            vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.make} {v.model} (${v.dailyRate}/day)
              </option>
            ))
          )}
        </select>
      </div>

      {/* Main Grid & Pricing Side-Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Calendar Matrix */}
        <div className="lg:col-span-2 glass-card p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between font-bold text-white text-sm">
            <span>September 2026</span>
            <span className="text-xs text-[#F5B301] font-mono">Base Rate: ${baseRate}/day</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 30 }).map((_, i) => {
              const day = i + 1;
              const isBlocked = blockedDates.includes(day);
              const customPrice = customPriceDays[day];

              return (
                <div
                  key={day}
                  onClick={() => {
                    setSelectedDay(day);
                    toggleBlockDay(day);
                  }}
                  className={`h-16 rounded-xl p-2 flex flex-col justify-between cursor-pointer border transition-all ${
                    isBlocked
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 opacity-60'
                      : customPrice
                      ? 'bg-amber-500/20 border-amber-500/40 text-white'
                      : 'bg-white/5 border-white/10 text-slate-200 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span>{day}</span>
                    {isBlocked ? <Lock className="w-3 h-3 text-rose-400" /> : <Unlock className="w-3 h-3 text-slate-500" />}
                  </div>
                  <span className={`text-[11px] font-black ${customPrice ? 'text-[#F5B301]' : 'text-slate-300'}`}>
                    ${customPrice || baseRate}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-white/10">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white/10 border border-white/20"></span> Available</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/40"></span> Blocked</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/40"></span> Custom Price</span>
          </div>
        </div>

        {/* Surge Pricing Tool */}
        <div className="glass-card p-6 border border-white/10 space-y-4 h-fit">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#F5B301]" /> Custom Weekend & Holiday Surge
          </h3>
          <p className="text-xs text-slate-400">
            Click any day on the calendar matrix to set a surge price or block reservations.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Set Surge Price ($/day)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={surgeRateInput}
                  onChange={(e) => setSurgeRateInput(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => selectedDay && applyCustomPrice(selectedDay)}
                  className="btn-primary text-xs py-2 px-4 shrink-0"
                >
                  Apply
                </button>
              </div>
            </div>

            {selectedDay && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                Selected Day: Sep {selectedDay}, 2026
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
