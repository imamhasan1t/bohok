'use client';

import React from 'react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { toBengaliNumerals } from '@/lib/utils';
import { Weight, Package, ShieldCheck, ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface Step4CapacityProps {
  capacityKg: number;
  capacitySize: 'small' | 'medium' | 'large';
  onChangeKg: (kg: number) => void;
  onChangeSize: (size: 'small' | 'medium' | 'large', labelBn: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step4Capacity({
  capacityKg,
  capacitySize,
  onChangeKg,
  onChangeSize,
  onNext,
  onBack,
}: Step4CapacityProps) {
  const kgPresets = [0.5, 1, 2, 3, 5];

  const sizeOptions = [
    {
      id: 'small' as const,
      title: 'ছোট আকার',
      sub: 'অফিস খাম, পাসপোর্ট, ওষুধ বা ছোট চশমার কেস',
      capacityDesc: 'ব্যাগের সামনের পকেট বা ফোল্ডারে বহনযোগ্য',
    },
    {
      id: 'medium' as const,
      title: 'মাঝারি আকার',
      sub: 'ছোট গিফট বক্স, বই, গ্যাজেট বা টি-শার্ট প্যাকেট',
      capacityDesc: 'সাধারণ ব্যাকপ্যাকে সহজে এঁটে যায়',
    },
    {
      id: 'large' as const,
      title: 'বড় আকার',
      sub: 'বড় বাক্স বা একাধিক পার্সেল একত্র বহন',
      capacityDesc: 'প্রাইভেট কারের ট্রাঙ্ক বা বড় লাগেজের ফাঁকা জায়গা',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
          ধাপ ৪: ধারণক্ষমতা
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] mt-1">
          কতটুকু পার্সেল নিতে পারবেন?
        </h2>
        <p className="text-sm text-[#6B6B6B] mt-1.5">
          আপনার ব্যাগে বা সাথে যতটুকু অতিরিক্ত খালি জায়গা রয়েছে তা উল্লেখ করুন। আপনার স্বাচ্ছন্দ্যই সবার আগে।
        </p>
      </div>

      {/* Kg Selector Pills & Slider Card */}
      <div className="bg-[#FFF7F0]/50 rounded-3xl p-5 sm:p-7 border border-[#FFE2CD] space-y-5">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-[#171717] uppercase tracking-wider">
              সর্বোচ্চ বহনযোগ্য ওজন:
            </label>
            <span className="text-xl font-extrabold text-[#FF6B00] bg-white px-3.5 py-1 rounded-xl border border-[#FFE2CD] shadow-xs">
              {toBengaliNumerals(capacityKg)} কেজি খালি জায়গা
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {kgPresets.map((kg) => {
              const isSelected = capacityKg === kg;
              return (
                <button
                  key={kg}
                  type="button"
                  onClick={() => onChangeKg(kg)}
                  className={`py-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-sm'
                      : 'bg-white text-[#171717] border-[#E5E7EB] hover:border-[#FFE2CD] hover:bg-[#FFF7F0]'
                  }`}
                >
                  {toBengaliNumerals(kg)} কেজি
                </button>
              );
            })}
          </div>

          <input
            type="range"
            min="0.5"
            max="5"
            step="0.5"
            value={capacityKg}
            onChange={(e) => onChangeKg(parseFloat(e.target.value))}
            className="w-full accent-[#FF6B00] cursor-pointer h-2 bg-[#E5E7EB] rounded-lg"
          />
          <div className="flex justify-between text-[11px] text-[#6B6B6B] mt-1.5">
            <span>০.৫ কেজি (ডকুমেন্টস)</span>
            <span>২.৫ কেজি (বক্স)</span>
            <span>সর্বোচ্চ ৫ কেজি</span>
          </div>
        </div>

        {/* Size Selector */}
        <div>
          <label className="text-xs font-bold text-[#171717] block mb-2 uppercase tracking-wider">
            পার্সেল সাইজ বা আকার ক্যাটাগরি:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sizeOptions.map((opt) => {
              const isSelected = capacitySize === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => onChangeSize(opt.id, opt.title)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#FF6B00] ring-2 ring-[#FF6B00]/20 shadow-xs'
                      : 'bg-white/80 border-[#E5E7EB] hover:border-[#FFE2CD]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-sm text-[#171717]">{opt.title}</h4>
                    {isSelected && <span className="text-xs text-[#FF6B00] font-bold">✓</span>}
                  </div>
                  <p className="text-[11px] text-[#6B6B6B] leading-tight mb-2">{opt.sub}</p>
                  <span className="text-[10px] text-[#16A34A] block font-medium">
                    {opt.capacityDesc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Freedom of Acceptance Guarantee Note */}
      <div className="bg-white rounded-2xl p-4 border border-[#DCFCE7] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
        <div className="text-xs text-[#6B6B6B] leading-relaxed">
          <strong className="text-[#171717] font-bold block mb-0.5">
            সহযাত্রীর সম্পূর্ণ স্বাধীনতা ও অধিকার:
          </strong>
          ধারণক্ষমতা উল্লেখ করার অর্থ এই নয় যে যেকোনো পার্সেল নিতেই হবে। পার্সেলের বিষয়বস্তু দেখে আপনি চাইলে প্রতিটি পার্সেল অনুরোধ আলাদাভাবে গ্রহণ অথবা প্রত্যাখ্যান করতে পারবেন।
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="secondary" size="md" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          পূর্ববর্তী: যানবাহন
        </Button>
        <Button variant="primary" size="lg" onClick={onNext} rightIcon={<ArrowRight className="w-5 h-5" />}>
          পরবর্তী: পিকআপ পছন্দ
        </Button>
      </div>
    </div>
  );
}
