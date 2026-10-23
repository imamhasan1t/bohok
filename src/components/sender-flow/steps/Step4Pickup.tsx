'use client';

import React from 'react';
import { PickupDetails } from '@/types/sender';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { SenderRouteMap } from '../SenderRouteMap';
import { MapPin, Phone, Building2, Lock, ArrowRight, ArrowLeft, Shield } from 'lucide-react';

interface Step4PickupProps {
  originId: string;
  destinationId: string;
  pickup: PickupDetails;
  onChange: (updated: Partial<PickupDetails>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step4Pickup({
  originId,
  destinationId,
  pickup,
  onChange,
  onNext,
  onBack,
}: Step4PickupProps) {
  const commonHubNeighborhoods: Record<string, string[]> = {
    dhaka: ['মিরপুর ১০ মেট্রো এলাকা', 'ধানমন্ডি ২৭ / শুক্রাবাদ', 'মতিঝিল শাপলা চত্বর', 'সায়েদাবাদ বাস টার্মিনাল', 'উত্তরা জসীমউদ্দীন অ্যাভিনিউ'],
    cumilla: ['কান্দিরপাড় টাউন হল এলাকা', 'পদুয়ার বাজার বিশ্বরোড', 'শাসনগাছা বাস টার্মিনাল', 'ক্যান্টনমেন্ট ময়নামতি'],
    chattogram: ['জিইসি মোড়', 'অলংকার মোড় টার্মিনাল', 'আগ্রাবাদ বাণিজ্যিক এলাকা', 'দামপাড়া বাস কাউন্টার'],
    sylhet: ['কদমতলী বাস টার্মিনাল', 'আম্বরখানা পয়েন্ট', 'মীরাবাজার', 'টিলাগড় মোড়'],
  };

  const suggestions = commonHubNeighborhoods[originId] || ['কেন্দ্রীয় বাস টার্মিনাল এলাকা', 'প্রধান রেলওয়ে স্টেশন', 'শহরের জিরো পয়েন্ট'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
          ধাপ ৪: পিকআপ তথ্য
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] mt-1">
          পার্সেল কোথা থেকে নেওয়া হবে?
        </h2>
        <p className="text-sm text-[#6B6B6B] mt-1.5">
          আপনার সুবিধাজনক পিকআপ এলাকা ও নিকটবর্তী পরিচিত ল্যান্ডমার্ক জানান। পাবলিক প্রোফাইলে কখনোই আপনার সুনির্দিষ্ট বাসাবাড়ির অবস্থান দেখানো হয় না।
        </p>
      </div>

      {/* Approximate Location Map Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#171717] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#FF6B00]" />
            ম্যাপে আনুমানিক পিকআপ এলাকা:
          </span>
          <span className="text-[#16A34A] font-semibold flex items-center gap-1">
            <Lock className="w-3 h-3" />
            গোপনীয়তা সুরক্ষা এলাকা (~১.২ কিমি)
          </span>
        </div>

        <SenderRouteMap
          originId={originId}
          destinationId={destinationId}
          pickupAreaName={pickup.areaName || 'আপনার পিকআপ এলাকা'}
          showPickupMarker={true}
          className="h-44 sm:h-52"
        />
      </div>

      {/* Form Fields Card */}
      <div className="bg-[#FFF7F0]/40 rounded-3xl p-5 sm:p-7 border border-[#FFE2CD] space-y-4">
        {/* Neighborhood / Area */}
        <div>
          <label className="text-xs font-bold text-[#171717] block mb-1.5">
            পিকআপ এলাকা বা মহল্লা (যেমন: ধানমন্ডি ২৭, মিরপুর ১০ বা সায়েদাবাদ):
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF6B00]">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              placeholder="পিকআপ এলাকা লিখুন বা নিচের পরামর্শ থেকে নির্বাচন করুন"
              value={pickup.areaName}
              onChange={(e) => onChange({ areaName: e.target.value })}
              className="w-full text-sm font-semibold pl-10 pr-4 py-3.5 rounded-2xl border border-[#E5E7EB] bg-white text-[#171717] focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          {/* Quick neighborhood suggestions */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {suggestions.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => onChange({ areaName: area })}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  pickup.areaName === area
                    ? 'bg-[#FF6B00] text-white border-[#FF6B00] font-semibold'
                    : 'bg-white text-[#6B6B6B] border-[#E5E7EB] hover:border-[#FFE2CD]'
                }`}
              >
                + {area}
              </button>
            ))}
          </div>
        </div>

        {/* Landmark */}
        <div>
          <label className="text-xs font-bold text-[#171717] block mb-1.5">
            পরিচিত ল্যান্ডমার্ক (সহযাত্রীর চেনার সুবিধার্থে):
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]">
              <Building2 className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="যেমন: রাপা প্লাজার ফুটওভার ব্রিজের নিচে / মেট্রো ২ নম্বর গেট"
              value={pickup.landmark}
              onChange={(e) => onChange({ landmark: e.target.value })}
              className="w-full text-sm pl-10 pr-4 py-3.5 rounded-2xl border border-[#E5E7EB] bg-white text-[#171717] focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
        </div>

        {/* Contact Phone */}
        <div>
          <label className="text-xs font-bold text-[#171717] block mb-1.5">
            আপনার যোগাযোগের মোবাইল নম্বর (ওটিপি ও হ্যান্ডওভারের জন্য):
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6B6B6B]">
              +৮৮
            </span>
            <input
              type="tel"
              required
              placeholder="০১৭১২-৩৪৫৬৭৮"
              value={pickup.contactPhone}
              onChange={(e) => onChange({ contactPhone: e.target.value })}
              className="w-full text-sm font-semibold pl-14 pr-4 py-3.5 rounded-2xl border border-[#E5E7EB] bg-white text-[#171717] focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <span className="text-[11px] text-[#6B6B6B] mt-1 block">
            * পার্সেল হস্তান্তরের সময় এই নম্বরে প্রেরক ওটিপি কোড পাঠানো হবে।
          </span>
        </div>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="bg-[#FFF7F0] rounded-2xl p-4 border border-[#FFE2CD] flex items-center gap-3">
        <Shield className="w-5 h-5 text-[#16A34A] shrink-0" />
        <p className="text-xs text-[#6B6B6B] leading-tight">
          <strong className="text-[#171717] font-bold">ব্যক্তিগত গোপনীয়তা রক্ষা: </strong>
          আপনার সঠিক ঠিকানা বা ফোন নম্বর বুকিং নিশ্চিত হওয়ার পূর্বে কোনো অবস্থাতেই জনসাধারণের নিকট প্রকাশিত হবে না।
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="secondary" size="md" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          পূর্ববর্তী
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onNext}
          disabled={!pickup.areaName || !pickup.contactPhone}
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          পরবর্তী: সহযাত্রী খুঁজুন
        </Button>
      </div>
    </div>
  );
}
