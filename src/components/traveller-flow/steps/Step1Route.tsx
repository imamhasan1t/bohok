'use client';

import React from 'react';
import { CITY_HUBS } from '@/data/cities';
import { findRouteByEndpoints, NATIONWIDE_ROUTES } from '@/data/routes';
import { Button } from '@/components/common/Button';
import { toBengaliNumerals } from '@/lib/utils';
import { MapPin, Navigation, ArrowLeftRight, Clock, ArrowRight, Sparkles, Compass } from 'lucide-react';

interface Step1RouteProps {
  originId: string;
  destinationId: string;
  onOriginChange: (id: string) => void;
  onDestinationChange: (id: string) => void;
  onSwap: () => void;
  onNext: () => void;
}

export function Step1Route({
  originId,
  destinationId,
  onOriginChange,
  onDestinationChange,
  onSwap,
  onNext,
}: Step1RouteProps) {
  const currentRoute =
    findRouteByEndpoints(originId, destinationId) ||
    NATIONWIDE_ROUTES.find((r) => r.originId === originId) ||
    NATIONWIDE_ROUTES[0];

  const popularRoutes = [
    { from: 'dhaka', to: 'cumilla', label: 'ঢাকা → কুমিল্লা (পাইলট)' },
    { from: 'dhaka', to: 'chattogram', label: 'ঢাকা → চট্টগ্রাম' },
    { from: 'dhaka', to: 'sylhet', label: 'ঢাকা → সিলেট' },
    { from: 'dhaka', to: 'khulna', label: 'ঢাকা → খুলনা' },
    { from: 'dhaka', to: 'rajshahi', label: 'ঢাকা → রাজশাহী' },
    { from: 'cumilla', to: 'dhaka', label: 'কুমিল্লা → ঢাকা' },
    { from: 'chattogram', to: 'dhaka', label: 'চট্টগ্রাম → ঢাকা' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
          ধাপ ১: যাত্রাপথ নির্বাচন
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] mt-1">
          আপনি কোথা থেকে কোথায় যাচ্ছেন?
        </h2>
        <p className="text-sm text-[#6B6B6B] mt-1.5">
          আপনার পূর্বনির্ধারিত ভ্রমণের শুরু ও গন্তব্য শহর জানান। কোনো বাড়তি ভ্রমণ নয়—আপনার স্বাভাবিক পথেই পার্সেল ম্যাচিং হবে।
        </p>
      </div>

      {/* Route Inputs Card */}
      <div className="bg-[#FFF7F0]/50 rounded-3xl p-5 sm:p-7 border border-[#FFE2CD] space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Origin */}
          <div className="flex-1">
            <label className="text-xs font-bold text-[#171717] block mb-1.5 pl-1">
              কোথা থেকে? (যাত্রার শুরু)
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF6B00]">
                <MapPin className="w-4 h-4" />
              </div>
              <select
                value={originId}
                onChange={(e) => onOriginChange(e.target.value)}
                className="w-full text-base font-semibold pl-10 pr-4 py-3.5 rounded-2xl border border-[#E5E7EB] bg-white text-[#171717] hover:border-[#FF6B00] focus:outline-none focus:border-[#FF6B00] shadow-xs cursor-pointer"
              >
                {CITY_HUBS.map((city) => (
                  <option key={city.id} value={city.id} disabled={city.id === destinationId}>
                    {city.nameBn} {city.isPilotHub ? '(পাইলট হাব)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex items-center justify-center -my-1 sm:my-0 sm:pt-6">
            <button
              type="button"
              onClick={onSwap}
              title="শহর অদল-বদল করুন"
              className="w-11 h-11 rounded-full bg-white border border-[#FFE2CD] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white transition-all flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="flex-1">
            <label className="text-xs font-bold text-[#171717] block mb-1.5 pl-1">
              কোথায়? (যাত্রার গন্তব্য)
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E85D04]">
                <Navigation className="w-4 h-4 -rotate-45" />
              </div>
              <select
                value={destinationId}
                onChange={(e) => onDestinationChange(e.target.value)}
                className="w-full text-base font-semibold pl-10 pr-4 py-3.5 rounded-2xl border border-[#E5E7EB] bg-white text-[#171717] hover:border-[#FF6B00] focus:outline-none focus:border-[#FF6B00] shadow-xs cursor-pointer"
              >
                {CITY_HUBS.map((city) => (
                  <option key={city.id} value={city.id} disabled={city.id === originId}>
                    {city.nameBn} {city.isPilotHub ? '(পাইলট হাব)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Route Stats Box */}
        {currentRoute && (
          <div className="bg-white rounded-2xl p-4 border border-[#FFE2CD] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-[#171717] text-sm block">
                {currentRoute.fromBn} ↔ {currentRoute.toBn} ({currentRoute.highwayCode} জাতীয় মহাসড়ক)
              </span>
              <p className="text-[#6B6B6B]">
                আনুমানিক সড়ক দূরত্ব ~{toBengaliNumerals(currentRoute.distanceKm)} কিমি • স্বাভাবিক যাত্রার সময়: {currentRoute.estimatedHours}
              </p>
            </div>
            <div className="bg-[#FFF7F0] text-[#FF6B00] border border-[#FFE2CD] px-3 py-1.5 rounded-xl font-bold shrink-0">
              {toBengaliNumerals(currentRoute.stats.todayPotentialMatches)}টি পার্সেল অনুরোধ প্রস্তুত
            </div>
          </div>
        )}

        {/* Quick Shortcuts */}
        <div className="pt-2">
          <span className="text-xs font-bold text-[#6B6B6B] block mb-2">
            জনপ্রিয় নিয়মিত যাত্রাপথ:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {popularRoutes.map((qr) => (
              <button
                key={`${qr.from}-${qr.to}`}
                type="button"
                onClick={() => {
                  onOriginChange(qr.from);
                  onDestinationChange(qr.to);
                }}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                  originId === qr.from && destinationId === qr.to
                    ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-xs'
                    : 'bg-white text-[#171717] border-[#E5E7EB] hover:border-[#FFE2CD] hover:bg-[#FFF7F0]'
                }`}
              >
                {qr.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={onNext}
          className="w-full sm:w-auto px-8 shadow-md"
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          পরবর্তী: যাত্রার সময়
        </Button>
      </div>
    </div>
  );
}
