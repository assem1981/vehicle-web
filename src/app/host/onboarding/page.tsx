'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Car, DollarSign, MapPin, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';

interface HostOnboardingForm {
  make: string;
  model: string;
  year: string;
  vin: string;
  category: string;
  transmission: string;
  seatingCapacity: string;
  fuelType: string;
  dailyRate: string;
  locationCity: string;
  imageUrl: string;
}

export default function HostOnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<HostOnboardingForm>({
    make: '',
    model: '',
    year: '',
    vin: '',
    category: '',
    transmission: '',
    seatingCapacity: '',
    fuelType: '',
    dailyRate: '',
    locationCity: '',
    imageUrl: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await vehicleService.createVehicle({
        make: formData.make,
        model: formData.model,
        year: Number(formData.year),
        vin: formData.vin,
        category: formData.category,
        transmission: formData.transmission,
        seatingCapacity: Number(formData.seatingCapacity),
        fuelType: formData.fuelType,
        dailyRate: Number(formData.dailyRate),
        locationCity: formData.locationCity,
        imageUrl: formData.imageUrl
      });
      setSubmitted(true);
    } catch (err) {
      setError('Failed to register as host. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="glass-card p-8 border border-white/10">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">List Your Car & Start Earning</h1>
            <p className="text-xs text-slate-400">Earn up to $1,200/month sharing your vehicle on TuroDrive</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <h2 className="text-2xl font-black text-white">Vehicle Listing Published!</h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Your {formData.make} {formData.model} is now live on the marketplace. Local guests can start booking immediately.
            </p>
            <div className="pt-2">
              <Link href="/search" className="btn-primary text-xs py-2.5 px-6">
                View in Car Search
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitVehicle} className="space-y-6">
            
            {/* Step 1: Vehicle Basics */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 1: Vehicle Specifications</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1 block">Make</label>
                    <input
                      type="text"
                      required
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      placeholder="e.g. Tesla / BMW"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1 block">Model</label>
                    <input
                      type="text"
                      required
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="e.g. Model Y / M3"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1 block">Year</label>
                    <input
                      type="number"
                      required
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1 block">VIN Number</label>
                    <input
                      type="text"
                      required
                      value={formData.vin}
                      onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                      placeholder="17-digit VIN code"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full btn-primary py-3 text-xs flex items-center justify-center gap-2 mt-4"
                >
                  <span>Next: Pricing & Location</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 2: Pricing & Location */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 2: Rates & Location</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1 block flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Daily Rate ($)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.dailyRate}
                      onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1 block flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" /> City / Location
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.locationCity}
                      onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                      placeholder="e.g. London"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Image Cover URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 btn-secondary text-xs py-3"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary text-xs py-3 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{loading ? 'Publishing...' : 'Publish Vehicle'}</span>
                  </button>
                </div>
              </div>
            )}

          </form>
        )}

      </div>
    </div>
  );
}
