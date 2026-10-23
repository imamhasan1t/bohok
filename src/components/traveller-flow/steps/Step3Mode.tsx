'use client';

import React from 'react';
import { TravelMode, TravelModeOption } from '@/types/traveller';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Bus, Train, Car, Bike, Compass, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface Step3ModeProps {
  travelMode: TravelMode;
  vehicleName: string;
  onChangeMode: (mode: TravelMode, labelBn: string) => void;
  onChangeVehicleName: (name: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Mode({
  travelMode,
  vehicleName,
  onChangeMode,
  onChangeVehicleName,
  onNext,
  onBack,
}: Step3ModeProps) {
  const modes: TravelModeOption[] = [
    {
      id: 'bus',
      labelBn: 'বাস (আন্তঃজেলা এসি / নন-এসি)',
      subBn: 'যেমন: গ্রীন লাইন, শ্যামলী, এশিয়া লাইন, তিশা বা পদ্মা এক্সপ্রেস',
      iconName: 'Bus',
      allowedParcelTypesNote: 'ব্যাকপ্যাক বা কেবিন স্পেসে ছোট ও মাঝারি প্যাকেজ বহনের উপযোগী',
    },
    {
      id: 'train',
      labelBn: 'ট্রেন (বাংলাদেশ রেলওয়ে)',
      subBn: 'যেমন: সোনার বাংলা, সুবর্ণ, তূর্ণা নিশিতা, উপকূল বা উপবন এক্সপ্রেস',
      iconName: 'Train',
      allowedParcelTypesNote: 'বগি সিটের পাশে সুরক্ষিত ফাইল ও লাগেজ পার্সেলের জন্য নিরাপদ',
    },
    {
      id: 'car',
      labelBn: 'প্রাইভেট কার / রাইডশেয়ার',
      subBn: 'ব্যক্তিগত গাড়ি বা বন্ধুদের সাথে শেয়ার করা মাইক্রোবাস/কার',
      iconName: 'Car',
      allowedParcelTypesNote: 'ট্রাঙ্ক ও ব্যাকসিটে অধিকতর নমনীয় ও বড় স্পেস সুবিধা',
    },
    {
      id: 'motorcycle',
      labelBn: 'মোটরসাইকেল (হাইওয়ে বাইকার)',
      subBn: 'হাইওয়েতে ব্যক্তিগত বাইকে যাতায়াতকারী রাইডার',
      iconName: 'Bike',
      allowedParcelTypesNote: 'শুধুমাত্র পিঠের ব্যাগে সহজে আঁটে এমন ছোট ফাইল বা জরুরি ওষুধ',
    },
    {
      id: 'other',
      labelBn: 'অন্যান্য অনুমোদিত মাধ্যম',
      subBn: 'লঞ্চ বা নির্দিষ্ট বিমান রুটের যাত্রী',
      iconName: 'Compass',
      allowedParcelTypesNote: 'যাত্রীর নিজস্ব ব্যাগেজ সীমা অনুযায়ী অনুমোদিত পণ্য',
    },
  ];

  const getIcon = (name: string) => {
    switch (name) {
      case 'Bus':
        return <Bus className="w-5 h-5 text-[#FF6B00]" />;
      case 'Train':
        return <Train className="w-5 h-5 text-[#FF6B00]" />;
      case 'Car':
        return <Car className="w-5 h-5 text-[#FF6B00]" />;
      case 'Bike':
        return <Bike className="w-5 h-5 text-[#FF6B00]" />;
      default:
        return <Compass className="w-5 h-5 text-[#FF6B00]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
          ধাপ ৩: যানবাহন নির্বাচন
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] mt-1">
          কীভাবে যাচ্ছেন?
        </h2>
        <p className="text-sm text-[#6B6B6B] mt-1.5">
          আপনার যাতায়াতের মাধ্যম নির্বাচন করুন। যানবাহনের ধরন অনুযায়ী প্রাপকের কাছে পৌঁছানোর সময় ও বহনযোগ্যতা পরিবর্তিত হতে পারে।
        </p>
      </div>

      {/* Mode Selection Cards */}
      <div className="space-y-3.5">
        {modes.map((m) => {
          const isSelected = travelMode === m.id;

          return (
            <div
              key={m.id}
              onClick={() => onChangeMode(m.id, m.labelBn.split(' ')[0])}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isSelected
                  ? 'bg-[#FFF7F0] border-[#FF6B00] ring-2 ring-[#FF6B00]/20 shadow-xs'
                  : 'bg-white border-[#E5E7EB] hover:border-[#FFE2CD]'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-white text-[#FF6B00] shadow-xs' : 'bg-[#FFF7F0]'
                  }`}
                >
                  {getIcon(m.iconName)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm sm:text-base text-[#171717]">{m.labelBn}</h4>
                  </div>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">{m.subBn}</p>
                  <span className="text-[11px] text-[#16A34A] block mt-1 font-medium">
                    💡 {m.allowedParcelTypesNote}
                  </span>
                </div>
              </div>

              <div className="self-end sm:self-center">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
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

      {/* Vehicle / Service Name Optional Input */}
      <div className="bg-[#FFF7F0]/50 rounded-2xl p-4 sm:p-5 border border-[#FFE2CD] space-y-2">
        <label className="text-xs font-bold text-[#171717] block">
          নির্দিষ্ট বাস/ট্রেন বা সার্ভিসের নাম (ঐচ্ছিক):
        </label>
        <input
          type="text"
          placeholder="যেমন: পদ্মা এক্সপ্রেস এসি বাস / সোনার বাংলা এক্সপ্রেস"
          value={vehicleName}
          onChange={(e) => onChangeVehicleName(e.target.value)}
          className="w-full text-sm p-3 rounded-xl border border-[#E5E7EB] bg-white text-[#171717] focus:outline-none focus:border-[#FF6B00]"
        />
      </div>

      {/* Helper Compliance Note */}
      <div className="bg-[#FFF7F0] rounded-2xl p-4 border border-[#FFE2CD] flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#E85D04] shrink-0 mt-0.5" />
        <p className="text-xs text-[#6B6B6B] leading-relaxed">
          <strong className="text-[#171717] font-semibold">নিয়মাবলী: </strong>
          আপনার যানবাহন ও যাত্রার নিয়ম অনুযায়ী পার্সেল বহনের অনুমতি প্রযোজ্য হতে পারে। নিজের সিট বা ব্যাগের সীমার বাইরে কোনো ঝুঁকিপূর্ণ মালামাল নেওয়া নিষেধ।
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="secondary" size="md" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          পূর্ববর্তী: সময়
        </Button>
        <Button variant="primary" size="lg" onClick={onNext} rightIcon={<ArrowRight className="w-5 h-5" />}>
          পরবর্তী: পার্সেল স্পেস
        </Button>
      </div>
    </div>
  );
}
