'use client';

import React from 'react';
import { PickupPreference, PickupPreferenceOption } from '@/types/traveller';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { TravellerRouteMap } from '../TravellerRouteMap';
import { MapPin, Navigation, Compass, Lock, ArrowRight, ArrowLeft, Shield } from 'lucide-react';

interface Step5PickupPreferenceProps {
  originId: string;
  destinationId: string;
  pickupPreference: PickupPreference;
  preferredPickupAreaName: string;
  onChangePreference: (pref: PickupPreference, labelBn: string) => void;
  onChangeAreaName: (areaName: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step5PickupPreference({
  originId,
  destinationId,
  pickupPreference,
  preferredPickupAreaName,
  onChangePreference,
  onChangeAreaName,
  onNext,
  onBack,
}: Step5PickupPreferenceProps) {
  const preferences: PickupPreferenceOption[] = [
    {
      id: 'near_me',
      labelBn: 'আমার সুবিধাজনক কাছাকাছি এলাকা',
      subBn: 'প্রেরক আপনার বাসার বা অফিসের সুবিধাজনক এলাকার কাছাকাছি এসে পার্সেল বুঝিয়ে দেবেন।',
      tagBn: 'সর্বাধিক সুবিধাজনক',
    },
    {
      id: 'specific_area',
      labelBn: 'নির্দিষ্ট কোনো এলাকার পয়েন্ট',
      subBn: 'শহরের নির্দিষ্ট কোনো মেট্রো স্টেশন, শপিং মল বা পরিচিত মোড় থেকে গ্রহণ করবেন।',
      tagBn: 'সুনির্দিষ্ট পয়েন্ট',
    },
    {
      id: 'along_route',
      labelBn: 'যাত্রাপথের নির্দিষ্ট কাউন্টার বা স্টপ',
      subBn: 'বাস কাউন্টার, রেলস্টেশন বা জাতীয় মহাসড়কের নির্ধারিত সংযোগ পয়েন্টে পার্সেল গ্রহণ।',
      tagBn: 'সরাসরি যাত্রাপথে',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
          ধাপ ৫: পিকআপ স্থান নির্ধারণ
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] mt-1">
          কোথা থেকে পার্সেল নিতে পারবেন?
        </h2>
        <p className="text-sm text-[#6B6B6B] mt-1.5">
          আপনার যাত্রাপথের শুরুতে কোথা থেকে পার্সেল সংগ্রহ করা আপনার জন্য সবচেয়ে সুবিধাজনক তা নির্বাচন করুন।
        </p>
      </div>

      {/* Map Preview of Route and Approximate Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#171717] flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#FF6B00]" />
            ম্যাপে আপনার যাত্রাপথ ও পিকআপ এলাকা:
          </span>
          <span className="text-[#16A34A] font-semibold flex items-center gap-1">
            <Lock className="w-3 h-3" />
            গোপনীয়তা সুরক্ষা এলাকা (~১.২ কিমি)
          </span>
        </div>

        <TravellerRouteMap
          originId={originId}
          destinationId={destinationId}
          preferredPickupArea={preferredPickupAreaName}
          className="h-44 sm:h-52"
        />
      </div>

      {/* Preference Options */}
      <div className="space-y-3">
        {preferences.map((p) => {
          const isSelected = pickupPreference === p.id;

          return (
            <div
              key={p.id}
              onClick={() => onChangePreference(p.id, p.labelBn.split(' ')[0])}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-[#FFF7F0] border-[#FF6B00] ring-2 ring-[#FF6B00]/20 shadow-xs'
                  : 'bg-white border-[#E5E7EB] hover:border-[#FFE2CD]'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm sm:text-base text-[#171717]">{p.labelBn}</h4>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      isSelected ? 'bg-[#FF6B00] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
                    }`}
                  >
                    {p.tagBn}
                  </span>
                </div>
                <p className="text-xs text-[#6B6B6B] mt-1 leading-snug">{p.subBn}</p>
              </div>

              <div className="self-end sm:self-center">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-[#FF6B00] bg-[#FF6B00] text-white' : 'border-[#D1D5DB]'
                  }`}
                >
                  {isSelected && <span className="text-xs">✓</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pickup Area Specific Text Input */}
      <div className="bg-[#FFF7F0]/40 rounded-2xl p-4 sm:p-5 border border-[#FFE2CD] space-y-2">
        <label className="text-xs font-bold text-[#171717] block">
          পিকআপ এলাকা বা স্টপের নাম লিখুন:
        </label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF6B00]">
            <MapPin className="w-4 h-4" />
          </div>
          <input
            type="text"
            required
            placeholder="যেমন: ধানমন্ডি ২৭ / সায়েদাবাদ বাস টার্মিনাল / মিরপুর ১০"
            value={preferredPickupAreaName}
            onChange={(e) => onChangeAreaName(e.target.value)}
            className="w-full text-sm font-semibold pl-10 pr-4 py-3.5 rounded-xl border border-[#E5E7EB] bg-white text-[#171717] focus:outline-none focus:border-[#FF6B00]"
          />
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-[#FFF7F0] rounded-2xl p-4 border border-[#FFE2CD] flex items-start gap-3">
        <Shield className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
        <p className="text-xs text-[#6B6B6B] leading-relaxed">
          <strong className="text-[#171717] font-semibold">প্রাইভেসি নিরাপত্তা নীতি: </strong>
          আপনার সঠিক লাইভ জিপিএস বা ব্যক্তিগত বাসার অবস্থান কখনোই পাবলিক প্ল্যাটফর্মে উন্মুক্ত করা হবে না। বুকিং চূড়ান্ত হওয়ার পরই শুধু নির্ধারিত পিকআপ পয়েন্ট শেয়ার হবে।
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="secondary" size="md" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          পূর্ববর্তী: ধারণক্ষমতা
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onNext}
          disabled={!preferredPickupAreaName}
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          পরবর্তী: যাত্রা পর্যালোচনা
        </Button>
      </div>
    </div>
  );
}
