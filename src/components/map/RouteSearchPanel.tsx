'use client';

import React from 'react';
import { CITY_HUBS } from '@/data/cities';
import { Button } from '@/components/common/Button';
import { MapPin, Navigation, ArrowLeftRight, Clock, Search, Sparkles } from 'lucide-react';

interface RouteSearchPanelProps {
  originId: string;
  destinationId: string;
  timeFilter: 'all' | 'morning' | 'afternoon' | 'evening' | 'night';
  onOriginChange: (id: string) => void;
  onDestinationChange: (id: string) => void;
  onTimeFilterChange: (time: 'all' | 'morning' | 'afternoon' | 'evening' | 'night') => void;
  onSwapEndpoints: () => void;
  onSearchSubmit: () => void;
  isPilotActive?: boolean;
}

export function RouteSearchPanel({
  originId,
  destinationId,
  timeFilter,
  onOriginChange,
  onDestinationChange,
  onTimeFilterChange,
  onSwapEndpoints,
  onSearchSubmit,
  isPilotActive = true,
}: RouteSearchPanelProps) {
  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#FFE2CD] shadow-lg mb-6">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Origin Hub */}
        <div className="flex-1 relative">
          <label className="text-[11px] font-bold text-[#6B6B6B] block mb-1 uppercase tracking-wider pl-1">
            কোথা থেকে? (শুরু)
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF6B00]">
              <MapPin className="w-4 h-4" />
            </div>
            <select
              value={originId}
              onChange={(e) => onOriginChange(e.target.value)}
              className="w-full text-sm font-semibold pl-10 pr-4 py-3 rounded-2xl border border-[#EFEFEF] bg-[#FFF7F0]/40 text-[#171717] hover:border-[#FF6B00] focus:outline-none focus:border-[#FF6B00] transition-colors cursor-pointer appearance-none"
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
        <div className="flex items-center justify-center -my-1 lg:my-0 lg:pt-5">
          <button
            type="button"
            onClick={onSwapEndpoints}
            title="দিক পরিবর্তন করুন"
            className="w-10 h-10 rounded-full bg-[#FFF7F0] border border-[#FFE2CD] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white transition-all flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
            aria-label="Swap origin and destination"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* Destination Hub */}
        <div className="flex-1 relative">
          <label className="text-[11px] font-bold text-[#6B6B6B] block mb-1 uppercase tracking-wider pl-1">
            কোথায়? (গন্তব্য)
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E85D04]">
              <Navigation className="w-4 h-4 -rotate-45" />
            </div>
            <select
              value={destinationId}
              onChange={(e) => onDestinationChange(e.target.value)}
              className="w-full text-sm font-semibold pl-10 pr-4 py-3 rounded-2xl border border-[#EFEFEF] bg-[#FFF7F0]/40 text-[#171717] hover:border-[#FF6B00] focus:outline-none focus:border-[#FF6B00] transition-colors cursor-pointer appearance-none"
            >
              {CITY_HUBS.map((city) => (
                <option key={city.id} value={city.id} disabled={city.id === originId}>
                  {city.nameBn} {city.isPilotHub ? '(পাইলট হাব)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Departure Time Filter */}
        <div className="w-full lg:w-48 relative">
          <label className="text-[11px] font-bold text-[#6B6B6B] block mb-1 uppercase tracking-wider pl-1">
            যাত্রার সময়
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]">
              <Clock className="w-4 h-4" />
            </div>
            <select
              value={timeFilter}
              onChange={(e) => onTimeFilterChange(e.target.value as any)}
              className="w-full text-sm font-semibold pl-10 pr-4 py-3 rounded-2xl border border-[#EFEFEF] bg-[#FFF7F0]/40 text-[#171717] hover:border-[#FF6B00] focus:outline-none focus:border-[#FF6B00] transition-colors cursor-pointer appearance-none"
            >
              <option value="all">যেকোনো সময়</option>
              <option value="morning">সকাল (ভোর - দুপুর)</option>
              <option value="afternoon">দুপুর (দুপুর - বিকেল)</option>
              <option value="evening">বিকেল ও সন্ধ্যা</option>
              <option value="night">রাতের ট্রিপ</option>
            </select>
          </div>
        </div>

        {/* Search CTA */}
        <div className="w-full lg:w-auto lg:pt-5">
          <Button
            variant="primary"
            size="md"
            onClick={onSearchSubmit}
            className="w-full lg:w-auto h-[46px] px-6 text-sm font-bold shadow-md justify-center whitespace-nowrap"
            leftIcon={<Search className="w-4 h-4" />}
          >
            যাত্রী খুঁজুন
          </Button>
        </div>
      </div>

      {/* Quick Corridor Suggestions */}
      <div className="mt-3.5 pt-3 border-t border-[#F0ECE7] flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[#6B6B6B] font-semibold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
          জনপ্রিয় রুট:
        </span>
        <button
          type="button"
          onClick={() => {
            onOriginChange('dhaka');
            onDestinationChange('cumilla');
          }}
          className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
            originId === 'dhaka' && destinationId === 'cumilla'
              ? 'bg-[#FF6B00] text-white'
              : 'bg-[#FFF7F0] text-[#E85D04] hover:bg-[#FFE7D4]'
          }`}
        >
          ঢাকা → কুমিল্লা (পাইলট)
        </button>
        <button
          type="button"
          onClick={() => {
            onOriginChange('dhaka');
            onDestinationChange('chattogram');
          }}
          className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
            originId === 'dhaka' && destinationId === 'chattogram'
              ? 'bg-[#FF6B00] text-white'
              : 'bg-[#FFF7F0] text-[#E85D04] hover:bg-[#FFE7D4]'
          }`}
        >
          ঢাকা → চট্টগ্রাম
        </button>
        <button
          type="button"
          onClick={() => {
            onOriginChange('dhaka');
            onDestinationChange('sylhet');
          }}
          className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
            originId === 'dhaka' && destinationId === 'sylhet'
              ? 'bg-[#FF6B00] text-white'
              : 'bg-[#FFF7F0] text-[#E85D04] hover:bg-[#FFE7D4]'
          }`}
        >
          ঢাকা → সিলেট
        </button>
        <button
          type="button"
          onClick={() => {
            onOriginChange('dhaka');
            onDestinationChange('khulna');
          }}
          className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
            originId === 'dhaka' && destinationId === 'khulna'
              ? 'bg-[#FF6B00] text-white'
              : 'bg-[#FFF7F0] text-[#E85D04] hover:bg-[#FFE7D4]'
          }`}
        >
          ঢাকা → খুলনা (পদ্মা সেতু)
        </button>
        <button
          type="button"
          onClick={() => {
            onOriginChange('dhaka');
            onDestinationChange('rajshahi');
          }}
          className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
            originId === 'dhaka' && destinationId === 'rajshahi'
              ? 'bg-[#FF6B00] text-white'
              : 'bg-[#FFF7F0] text-[#E85D04] hover:bg-[#FFE7D4]'
          }`}
        >
          ঢাকা → রাজশাহী
        </button>
      </div>
    </div>
  );
}
