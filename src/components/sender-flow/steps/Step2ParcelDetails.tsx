'use client';

import React from 'react';
import { ParcelCategory, ParcelDetails, ParcelSize } from '@/types/sender';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { toBengaliNumerals } from '@/lib/utils';
import {
  FileText,
  BookOpen,
  Shirt,
  Package,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';

interface Step2ParcelDetailsProps {
  parcel: ParcelDetails;
  onChange: (updated: Partial<ParcelDetails>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2ParcelDetails({
  parcel,
  onChange,
  onNext,
  onBack,
}: Step2ParcelDetailsProps) {
  const categories: {
    id: ParcelCategory;
    title: string;
    sub: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'documents',
      title: 'ডকুমেন্ট',
      sub: 'অফিস ফাইল, সার্টিফিকেট, পাসপোর্ট, পরীক্ষার কাগজ',
      icon: <FileText className="w-5 h-5 text-[#FF6B00]" />,
    },
    {
      id: 'books',
      title: 'বই',
      sub: 'পাঠ্যপুস্তক, নোটবুক, উপন্যাস বা ধর্মীয় গ্রন্থ',
      icon: <BookOpen className="w-5 h-5 text-[#FF6B00]" />,
    },
    {
      id: 'clothes',
      title: 'কাপড়',
      sub: 'পোশাক, জুতো বা ব্যক্তিগত ব্যবহারের পরিধেয়',
      icon: <Shirt className="w-5 h-5 text-[#FF6B00]" />,
    },
    {
      id: 'other_permitted',
      title: 'অন্যান্য অনুমোদিত পণ্য',
      sub: 'ছোট গ্যাজেট, প্রেসক্রিপশন ওষুধ, উপহার বা গৃহস্থালি জিনিস',
      icon: <Package className="w-5 h-5 text-[#FF6B00]" />,
    },
  ];

  const sizes: { id: ParcelSize; label: string; sub: string }[] = [
    { id: 'small', label: 'ছোট (খাম / ফাইল)', sub: 'পকেট বা ছোট ফোল্ডারে বহনযোগ্য' },
    { id: 'medium', label: 'মাঝারি (বক্স / প্যাকেট)', sub: 'সাধারণ ব্যাকপ্যাকে সহজে এঁটে যায়' },
    { id: 'large', label: 'বড় (সর্বোচ্চ ব্যাগ স্পেস)', sub: 'বড় ট্র্যাভেল ব্যাগের অতিরিক্ত জায়গা' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
          ধাপ ২: পার্সেল নির্বাচন
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] mt-1">
          আপনি কী পাঠাতে চান?
        </h2>
        <p className="text-sm text-[#6B6B6B] mt-1.5">
          পার্সেলের ধরন ও আনুমানিক ওজন জানান। প্রতিটি পার্সেল সাধারণ যাত্রীর ব্যাগে স্বাচ্ছন্দ্যে বহনযোগ্য হওয়া আবশ্যক।
        </p>
      </div>

      {/* Category Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {categories.map((cat) => {
          const isSelected = parcel.category === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() =>
                onChange({
                  category: cat.id,
                  categoryLabelBn: cat.title,
                })
              }
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                isSelected
                  ? 'bg-[#FFF7F0] border-[#FF6B00] ring-2 ring-[#FF6B00]/20 shadow-xs'
                  : 'bg-white border-[#E5E7EB] hover:border-[#FFE2CD]'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-white text-[#FF6B00] shadow-xs' : 'bg-[#FFF7F0] text-[#FF6B00]'
                }`}
              >
                {cat.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-[#171717]">{cat.title}</h4>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[#FF6B00] text-white flex items-center justify-center text-xs">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B6B6B] mt-0.5 leading-snug">{cat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weight & Size Fields */}
      <div className="bg-[#FFF7F0]/40 rounded-3xl p-5 sm:p-7 border border-[#FFE2CD] space-y-5">
        {/* Weight Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-[#171717]">
              আনুমানিক ওজন:
            </label>
            <span className="text-base font-extrabold text-[#FF6B00] bg-white px-3 py-1 rounded-xl border border-[#FFE2CD] shadow-xs">
              {toBengaliNumerals(parcel.weightKg)} কেজি
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.5"
            value={parcel.weightKg}
            onChange={(e) => onChange({ weightKg: parseFloat(e.target.value) })}
            className="w-full accent-[#FF6B00] cursor-pointer h-2 bg-[#E5E7EB] rounded-lg"
          />
          <div className="flex justify-between text-[11px] text-[#6B6B6B] mt-1.5 font-medium">
            <span>০.৫ কেজি (ডকুমেন্ট)</span>
            <span>২.৫ কেজি</span>
            <span>সর্বোচ্চ ৫ কেজি</span>
          </div>
        </div>

        {/* Size Pills */}
        <div>
          <label className="text-sm font-bold text-[#171717] block mb-2">
            আনুমানিক আকার (সাইজ):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {sizes.map((s) => {
              const isSelected = parcel.size === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onChange({ size: s.id, sizeLabelBn: s.label })}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#FF6B00] ring-2 ring-[#FF6B00]/20 shadow-xs'
                      : 'bg-white/80 border-[#E5E7EB] hover:border-[#FFE2CD]'
                  }`}
                >
                  <span className="text-xs font-bold text-[#171717] block">{s.label}</span>
                  <span className="text-[11px] text-[#6B6B6B] block mt-0.5">{s.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Brief Description */}
        <div>
          <label className="text-sm font-bold text-[#171717] block mb-1.5">
            ছোট বিবরণ (ঐচ্ছিক কিন্তু সহযাত্রীর বোঝার জন্য সহায়ক):
          </label>
          <input
            type="text"
            placeholder="যেমন: জরুরি অফিসের ফাইল ও পাসপোর্ট সাইজ খাম"
            value={parcel.description}
            onChange={(e) => onChange({ description: e.target.value })}
            className="w-full text-sm p-3.5 rounded-2xl border border-[#E5E7EB] bg-white text-[#171717] focus:outline-none focus:border-[#FF6B00] placeholder:text-[#9CA3AF]"
          />
        </div>
      </div>

      {/* Prohibited Item Notice */}
      <div className="bg-[#FFF7F0] rounded-2xl p-4 border border-[#FFE2CD] flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#E85D04] shrink-0 mt-0.5" />
        <div className="text-xs text-[#6B6B6B] leading-relaxed">
          <strong className="text-[#171717] font-bold block mb-0.5">
            নিরাপত্তা সতর্কতা ও নিষিদ্ধ পণ্য নির্দেশিকা:
          </strong>
          তরল দাহ্য পদার্থ, রাসায়নিক, তামাক, মাদকদ্রব্য, সোনাদানা/অর্থ এবং কোনো সিলগালা করা না-দেখা প্যাকেট বহন সম্পূর্ণ নিষিদ্ধ। হস্তান্তরের সময় পার্সেল উন্মুক্ত প্রদর্শন আবশ্যক।
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="secondary" size="md" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          পূর্ববর্তী
        </Button>
        <Button variant="primary" size="lg" onClick={onNext} rightIcon={<ArrowRight className="w-5 h-5" />}>
          পরবর্তী: ডেলিভারি সময়
        </Button>
      </div>
    </div>
  );
}
