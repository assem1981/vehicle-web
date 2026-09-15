'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Calendar as CalendarIcon, 
  ArrowLeft, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Car,
  MapPin,
  Clock
} from 'lucide-react';
import { bookingService, Booking } from '@/services/bookingService';
import { vehicleService, Vehicle } from '@/services/vehicleService';

export default function AvailabilityCalendarPage() {
  const params = useParams();
  const vehicleId = Number(params.id);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const defaultEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEnd);

  useEffect(() => {
    const fetchData = async () => {
      if (!vehicleId) return;
      try {
        setLoading(true);
        const [vData, bData] = await Promise.all([
          vehicleService.getVehicleById(vehicleId),
          bookingService.getBookingsByVehicle(vehicleId)
        ]);
        setVehicle(vData);
        setBookings(bData);
      } catch (err) {
        console.error('Failed to load vehicle calendar data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [vehicleId]);

  // Compute set of all reserved date strings (YYYY-MM-DD)
  const reservedDatesSet = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach((b) => {
      if (b.status && b.status.toUpperCase() === 'CANCELLED') return;
      if (!b.startDate || !b.endDate) return;

      const curr = new Date(b.startDate);
      const last = new Date(b.endDate);

      while (curr <= last) {
        set.add(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
      }
    });
    return set;
  }, [bookings]);

  // Check if selected range overlaps with any reserved day
  const hasOverlap = useMemo(() => {
    if (!startDate || !endDate) return false;
    if (startDate > endDate) return false;

    const curr = new Date(startDate);
    const last = new Date(endDate);

    while (curr <= last) {
      const dateStr = curr.toISOString().split('T')[0];
      if (reservedDatesSet.has(dateStr)) {
        return true;
      }
      curr.setDate(curr.getDate() + 1);
    }
    return false;
  }, [startDate, endDate, reservedDatesSet]);

  const daysCount = useMemo(() => {
    if (!startDate || !endDate || startDate > endDate) return 0;
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);

  const prevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  // Generate calendar grid dates for currentMonthDate
  const calendarCells = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];

    // Leading blanks
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ isBlank: true, id: `blank-${i}` });
    }

    // Month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      // Adjust timezone offset issue for ISO string
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      const isPast = dateStr < todayStr;
      const isReserved = reservedDatesSet.has(dateStr);
      const isStart = dateStr === startDate;
      const isEnd = dateStr === endDate;
      const inRange = startDate && endDate && dateStr >= startDate && dateStr <= endDate;

      cells.push({
        isBlank: false,
        id: dateStr,
        dayNum: d,
        dateStr,
        isPast,
        isReserved,
        isStart,
        isEnd,
        inRange
      });
    }

    return cells;
  }, [currentMonthDate, reservedDatesSet, startDate, endDate, todayStr]);

  const handleDayClick = (dateStr: string, isPast: boolean, isReserved: boolean) => {
    if (isPast || isReserved) return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(dateStr);
      setEndDate('');
    } else if (startDate && !endDate) {
      if (dateStr < startDate) {
        setStartDate(dateStr);
        setEndDate('');
      } else {
        setEndDate(dateStr);
      }
    }
  };

  const monthYearLabel = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400 animate-pulse">
        Loading availability calendar...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      
      {/* Header card */}
      <div className="glass-card p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Vehicle Availability Calendar</h1>
              <p className="text-xs text-slate-400">View real-time reserved dates and select your rental window</p>
            </div>
          </div>

          <Link href={`/vehicles/${vehicleId}`} className="btn-secondary text-xs py-1.5 px-3.5 flex items-center gap-1.5 self-start sm:self-auto">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Vehicle
          </Link>
        </div>

        {/* Vehicle summary snippet */}
        {vehicle && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
            <div className="flex items-center gap-3">
              {vehicle.imageUrl ? (
                <img src={vehicle.imageUrl} alt={vehicle.model} className="w-14 h-10 object-cover rounded-lg" />
              ) : (
                <div className="w-14 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                  <Car className="w-5 h-5" />
                </div>
              )}
              <div>
                <span className="font-bold text-white block">{vehicle.make} {vehicle.model} ({vehicle.year})</span>
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <MapPin className="w-3 h-3 text-emerald-400" /> {vehicle.locationCity || 'Location N/A'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-slate-400 text-[11px] block">Daily Base Rate</span>
              <span className="text-emerald-400 font-black text-sm">${vehicle.dailyRate}/day</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Calendar Card */}
      <div className="glass-card p-6 border border-white/10 space-y-6">

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs p-3 rounded-xl bg-black/40 border border-white/10">
          <span className="text-slate-300 font-semibold flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-emerald-400" /> Availability Legend:
          </span>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500"></span>
              <span className="text-slate-300">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/40 border border-rose-500"></span>
              <span className="text-rose-300 font-medium">Reserved / Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              <span className="text-emerald-300 font-semibold">Your Selection</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700"></span>
              <span className="text-slate-500">Past Date</span>
            </div>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between pt-2">
          <button 
            onClick={prevMonth}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-1 text-xs"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <h2 className="text-lg font-bold text-white tracking-wide">
            {monthYearLabel}
          </h2>

          <button 
            onClick={nextMonth}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-1 text-xs"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 7-Column Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
            <div key={dayName} className="text-center text-[11px] font-bold text-slate-400 py-2 uppercase tracking-wider">
              {dayName}
            </div>
          ))}

          {calendarCells.map((cell) => {
            if (cell.isBlank) {
              return <div key={cell.id} className="min-h-[54px] sm:min-h-[64px] rounded-xl bg-transparent" />;
            }

            let styleClasses = 'bg-emerald-500/10 border-emerald-500/20 text-slate-200 hover:border-emerald-400 hover:bg-emerald-500/20 cursor-pointer';
            let label = null;

            if (cell.isPast) {
              styleClasses = 'bg-slate-900/40 border-white/5 text-slate-600 opacity-40 cursor-not-allowed';
            } else if (cell.isReserved) {
              styleClasses = 'bg-rose-500/20 border-rose-500/40 text-rose-300 cursor-not-allowed shadow-inner';
              label = <span className="text-[9px] font-bold uppercase tracking-tighter text-rose-400 bg-rose-950/60 px-1 py-0.2 rounded mt-0.5 block text-center">Booked</span>;
            } else if (cell.isStart || cell.isEnd) {
              styleClasses = 'bg-emerald-500 border-emerald-400 text-black font-black shadow-lg ring-2 ring-emerald-400/50 cursor-pointer scale-[1.02]';
              label = <span className="text-[9px] font-bold text-black block mt-0.5">{cell.isStart ? 'Pick-up' : 'Return'}</span>;
            } else if (cell.inRange) {
              styleClasses = 'bg-emerald-500/40 border-emerald-400/60 text-emerald-100 font-bold cursor-pointer';
            }

            return (
              <button
                key={cell.id}
                type="button"
                disabled={cell.isPast || cell.isReserved}
                onClick={() => cell.dateStr && handleDayClick(cell.dateStr, !!cell.isPast, !!cell.isReserved)}
                className={`min-h-[54px] sm:min-h-[64px] p-1.5 rounded-xl border flex flex-col items-center justify-between transition-all duration-150 relative ${styleClasses}`}
              >
                <span className="text-xs font-bold">{cell.dayNum}</span>
                {label}
              </button>
            );
          })}
        </div>

        {/* Date Selector Inputs Sync */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> Pick-up Date
            </label>
            <input
              type="date"
              value={startDate}
              min={todayStr}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> Return Date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || todayStr}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Validation & Alert Notices */}
        {hasOverlap ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-rose-200">Date Range Unavailable</h4>
              <p className="mt-0.5">
                The selected rental period ({startDate} to {endDate}) includes days that are already reserved by another customer. Please select available green days on the calendar.
              </p>
            </div>
          </div>
        ) : daysCount > 0 ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="font-bold text-white block">Dates Available!</span>
                <span>{startDate} to {endDate} • ({daysCount} {daysCount === 1 ? 'Day' : 'Days'})</span>
              </div>
            </div>
            {vehicle && (
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Est. Subtotal</span>
                <span className="font-black text-emerald-400 text-sm">${(vehicle.dailyRate * daysCount).toFixed(2)}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs text-center">
            Select a pick-up and return date to check pricing.
          </div>
        )}

        {/* Action Button Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="text-xs text-slate-400">
            Selected Duration: <span className="text-emerald-400 font-bold">{daysCount} {daysCount === 1 ? 'Day' : 'Days'}</span>
          </div>

          <Link
            href={!hasOverlap && daysCount > 0 ? `/vehicles/${vehicleId}/pricing?startDate=${startDate}&endDate=${endDate}` : '#'}
            aria-disabled={hasOverlap || daysCount <= 0}
            className={`btn-primary text-xs py-2.5 px-6 flex items-center gap-2 transition-all ${
              hasOverlap || daysCount <= 0 ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
            }`}
          >
            <span>Proceed to Pricing ({daysCount} {daysCount === 1 ? 'Day' : 'Days'})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
