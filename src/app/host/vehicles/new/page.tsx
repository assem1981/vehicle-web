'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Car, 
  FileText, 
  Camera, 
  DollarSign, 
  MapPin, 
  Calendar, 
  Upload, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Truck,
  ShieldCheck,
  Zap,
  Clock
} from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';

interface VehicleFormData {
  make: string;
  model: string;
  year: string;
  vin: string;
  category: string;
  transmission: string;
  seatingCapacity: string;
  fuelType: string;
  registrationNumber: string;
  insurancePolicyNumber: string;
  inspectionDocName: string;
  coverImageUrl: string;
  interiorImageUrl: string;
  dailyRate: string;
  weeklyDiscountPercent: string;
  monthlyDiscountPercent: string;
  securityDepositUSD: string;
  pickupAddress: string;
  offersDelivery: boolean;
  deliveryRadiusMiles: string;
  deliveryFeeUSD: string;
  airportDelivery: boolean;
  airportFeeUSD: string;
  minTripDays: string;
  maxTripDays: string;
  instantBooking: boolean;
  advanceNoticeHours: string;
}

export default function AddVehiclePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(false);
  const [createdVehicleId, setCreatedVehicleId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [inspectionFile, setInspectionFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Form State covering all requirements
  const [formData, setFormData] = useState<VehicleFormData>({
    // Step 1: Specs
    make: '',
    model: '',
    year: '',
    vin: '',
    category: '',
    transmission: '',
    seatingCapacity: '',
    fuelType: '',

    // Step 2: Documents
    registrationNumber: '',
    insurancePolicyNumber: '',
    inspectionDocName: '',

    // Step 3: Photos
    coverImageUrl: '',
    interiorImageUrl: '',

    // Step 4: Pricing & Discounts
    dailyRate: '',
    weeklyDiscountPercent: '',
    monthlyDiscountPercent: '',
    securityDepositUSD: '',

    // Step 5: Pickup & Delivery Configuration
    pickupAddress: '',
    offersDelivery: false,
    deliveryRadiusMiles: '',
    deliveryFeeUSD: '',
    airportDelivery: false,
    airportFeeUSD: '',

    // Step 6: Availability & Rules
    minTripDays: '',
    maxTripDays: '',
    instantBooking: false,
    advanceNoticeHours: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a PDF or JPEG file');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setInspectionFile(file);
      setFormData({ ...formData, inspectionDocName: file.name });
    }
  };

  const resizeImageToDataUrl = async (
    file: File,
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image for resizing'));
      };
      img.src = objectUrl;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'coverImageUrl' | 'interiorImageUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setFormData((prev) => ({ ...prev, [field]: dataUrl }));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Image resize error:', err);
      setError('Image resize failed. Please try a smaller image or use a URL instead.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const year = Number(formData.year);
    const seatingCapacity = Number(formData.seatingCapacity);
    const dailyRate = Number(formData.dailyRate);

    if (!formData.make || !formData.model || !formData.year || Number.isNaN(year) || year < 1900) {
      setError('Please enter a valid make, model, and year.');
      return;
    }
    if (!formData.vin) {
      setError('Please enter a VIN.');
      return;
    }
    if (!formData.category || !formData.transmission || !formData.fuelType) {
      setError('Please select category, transmission, and fuel type.');
      return;
    }
    if (!formData.seatingCapacity || Number.isNaN(seatingCapacity) || seatingCapacity < 1) {
      setError('Please enter a valid seating capacity.');
      return;
    }
    if (!formData.dailyRate || Number.isNaN(dailyRate) || dailyRate <= 0) {
      setError('Please enter a valid daily rate.');
      return;
    }
    if (!formData.pickupAddress) {
      setError('Please enter a pickup address.');
      return;
    }

    setLoading(true);

    try {
      const created = await vehicleService.createVehicle({
        make: formData.make,
        model: formData.model,
        year,
        vin: formData.vin,
        category: formData.category,
        transmission: formData.transmission,
        seatingCapacity,
        fuelType: formData.fuelType,
        dailyRate,
        locationCity: formData.pickupAddress.split(',')[1]?.trim() || formData.pickupAddress,
        imageUrl: formData.coverImageUrl,
        interiorImageUrl: formData.interiorImageUrl || undefined
      });

      if (!created || !created.id) {
        setError('The server did not return a saved vehicle. Please check the backend logs.');
        return;
      }

      setCreatedVehicleId(created.id);
      setPublished(true);
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to publish vehicle. Please check your inputs and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const STEPS = [
    { num: 1, label: 'Vehicle Specs', icon: Car },
    { num: 2, label: 'Documents', icon: FileText },
    { num: 3, label: 'Photos Gallery', icon: Camera },
    { num: 4, label: 'Pricing & Surge', icon: DollarSign },
    { num: 5, label: 'Pickup & Delivery', icon: Truck },
    { num: 6, label: 'Availability', icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      
      {/* Wizard Progress Bar */}
      <div className="glass-card p-4 border border-white/10">
        <div className="flex items-center justify-between overflow-x-auto gap-2 pb-2 sm:pb-0">
          {STEPS.map((s) => {
            const StepIcon = s.icon;
            const isActive = currentStep === s.num;
            const isCompleted = currentStep > s.num;

            return (
              <button
                key={s.num}
                onClick={() => isCompleted && setCurrentStep(s.num)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  isActive
                    ? 'bg-[#F5B301] text-slate-950 font-bold shadow-md'
                    : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-500 bg-white/5'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                <span>{s.num}. {s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
          {error}
        </div>
      )}

      {published ? (
        <div className="glass-card p-12 text-center space-y-4 border border-amber-500/30">
          <Clock className="w-16 h-16 text-[#F5B301] mx-auto animate-pulse" />
          <h2 className="text-2xl font-black text-white">Vehicle Submitted for Approval!</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Your {formData.make} {formData.model} has been submitted and is pending admin approval. Once approved, it will go live on the MyMotionLux marketplace.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <Link href="/host/dashboard" className="btn-secondary text-xs py-2.5 px-6">
              Return to Host Hub
            </Link>
            {createdVehicleId ? (
              <Link href={`/vehicles/${createdVehicleId}`} className="btn-primary text-xs py-2.5 px-6">
                View Vehicle Details
              </Link>
            ) : (
              <Link href="/host/dashboard" className="btn-primary text-xs py-2.5 px-6">
                View Dashboard
              </Link>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card p-8 border border-white/10 space-y-6">
          
          {/* STEP 1: Specs */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-base font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
                <Car className="w-5 h-5 text-[#F5B301]" /> Step 1: Vehicle Specifications & Identification
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Make</label>
                  <input
                    type="text"
                    required
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    placeholder="e.g. Porsche / Tesla / BMW"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Model</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. Taycan / Model Y"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Year</label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">17-Digit VIN Number</label>
                  <input
                    type="text"
                    required
                    value={formData.vin}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                    placeholder="e.g. WP0AA2Y12MSA10492"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Vehicle Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select category</option>
                    <option value="Luxury">Luxury</option>
                    <option value="SUV">SUV</option>
                    <option value="Electric">Electric</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Transmission</label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select transmission</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Seating Capacity</label>
                  <input
                    type="number"
                    required
                    value={formData.seatingCapacity}
                    onChange={(e) => setFormData({ ...formData, seatingCapacity: e.target.value })}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Fuel Type</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select fuel type</option>
                    <option value="Gasoline">Gasoline</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Documents */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-base font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#F5B301]" /> Step 2: Upload Vehicle Legal Documents
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1 block">Vehicle Registration Number</label>
                    <input
                      type="text"
                      required
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      placeholder="e.g. REG-894021"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1 block">Insurance Policy Number</label>
                    <input
                      type="text"
                      required
                      value={formData.insurancePolicyNumber}
                      onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                      placeholder="e.g. INS-POL-77402"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-xl border border-dashed border-white/20 bg-white/5 text-center space-y-2 cursor-pointer hover:border-amber-500/50 transition-all"
                >
                  <Upload className="w-8 h-8 text-[#F5B301] mx-auto" />
                  <span className="text-xs font-bold text-white block">Upload Official Annual Safety Inspection (PDF/JPEG)</span>
                  <span className="text-[11px] text-slate-400 block">{inspectionFile ? inspectionFile.name : formData.inspectionDocName} • {inspectionFile ? 'File selected' : 'Click to upload'}</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Photos */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-base font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#F5B301]" /> Step 3: High-Res Photo Gallery
              </h2>

              <div className="space-y-4">
                {/* Cover photo */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Main Exterior Cover Photo URL</label>
                  <input
                    type="text"
                    value={formData.coverImageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                    placeholder="https://... or upload an image below"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <label className="mt-2 flex items-center gap-2 text-xs text-slate-400 cursor-pointer w-fit">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'coverImageUrl')}
                      className="hidden"
                    />
                    <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-[#F5B301]">
                      Upload Cover Photo
                    </span>
                  </label>
                </div>

                {/* Interior photo */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Interior Cabin Photo URL</label>
                  <input
                    type="text"
                    value={formData.interiorImageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, interiorImageUrl: e.target.value })}
                    placeholder="https://... or upload an image below"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <label className="mt-2 flex items-center gap-2 text-xs text-slate-400 cursor-pointer w-fit">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'interiorImageUrl')}
                      className="hidden"
                    />
                    <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-[#F5B301]">
                      Upload Interior Photo
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="h-32 rounded-xl bg-slate-800 overflow-hidden border border-white/10 flex items-center justify-center">
                    {formData.coverImageUrl ? (
                      <img src={formData.coverImageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[11px] text-slate-500">No cover preview</span>
                    )}
                  </div>
                  <div className="h-32 rounded-xl bg-slate-800 overflow-hidden border border-white/10 flex items-center justify-center">
                    {formData.interiorImageUrl ? (
                      <img src={formData.interiorImageUrl} alt="Interior Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[11px] text-slate-500">No interior preview</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Pricing */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-base font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#F5B301]" /> Step 4: Daily Rate & Discount Configuration
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Standard Daily Rate ($)</label>
                  <input
                    type="number"
                    required
                    value={formData.dailyRate}
                    onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Security Deposit ($)</label>
                  <input
                    type="number"
                    value={formData.securityDepositUSD}
                    onChange={(e) => setFormData({ ...formData, securityDepositUSD: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Weekly Discount (%)</label>
                  <input
                    type="number"
                    value={formData.weeklyDiscountPercent}
                    onChange={(e) => setFormData({ ...formData, weeklyDiscountPercent: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Monthly Discount (%)</label>
                  <input
                    type="number"
                    value={formData.monthlyDiscountPercent}
                    onChange={(e) => setFormData({ ...formData, monthlyDiscountPercent: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Pickup & Delivery */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-base font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#F5B301]" /> Step 5: Pickup Locations & Delivery Options
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Primary Pickup Address</label>
                  <input
                    type="text"
                    required
                    value={formData.pickupAddress}
                    onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Custom Doorstep Delivery</h4>
                      <p className="text-[11px] text-slate-400">Deliver vehicle directly to guest&apos;s location</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.offersDelivery}
                      onChange={(e) => setFormData({ ...formData, offersDelivery: e.target.checked })}
                      className="w-4 h-4 accent-[#F5B301]"
                    />
                  </div>

                  {formData.offersDelivery && (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">Max Delivery Radius (Miles)</label>
                        <input
                          type="number"
                          value={formData.deliveryRadiusMiles}
                          onChange={(e) => setFormData({ ...formData, deliveryRadiusMiles: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">Delivery Fee ($)</label>
                        <input
                          type="number"
                          value={formData.deliveryFeeUSD}
                          onChange={(e) => setFormData({ ...formData, deliveryFeeUSD: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Availability */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-base font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#F5B301]" /> Step 6: Trip Rules & Availability
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1 block">Min Trip Duration (Days)</label>
                    <input
                      type="number"
                      value={formData.minTripDays}
                      onChange={(e) => setFormData({ ...formData, minTripDays: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1 block">Max Trip Duration (Days)</label>
                    <input
                      type="number"
                      value={formData.maxTripDays}
                      onChange={(e) => setFormData({ ...formData, maxTripDays: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-[#F5B301]" /> Instant Booking Approval
                    </h4>
                    <p className="text-[11px] text-slate-400">Allow guests to book automatically without waiting for manual confirmation</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.instantBooking}
                    onChange={(e) => setFormData({ ...formData, instantBooking: e.target.checked })}
                    className="w-4 h-4 accent-[#F5B301]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-white/10 flex justify-between gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="btn-secondary text-xs py-2.5 px-5 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
            )}

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="btn-primary text-xs py-2.5 px-6 ml-auto flex items-center gap-1.5"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary text-xs py-2.5 px-6 ml-auto flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Publishing...' : 'Publish Vehicle Listing'}</span>
              </button>
            )}
          </div>

        </form>
      )}

    </div>
  );
}
