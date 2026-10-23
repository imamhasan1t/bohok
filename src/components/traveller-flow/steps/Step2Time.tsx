'use client';

import React from 'react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Calendar, Clock, ArrowRight, ArrowLeft, Sun, Sunset, Moon, Sparkles } from 'lucide-react';

interface Step2TimeProps {
  departureDate: string;
  departureTime: string;
  estimatedArrival: string;
  onChangeDate: (date: string) => void;
  onChangeTime: (time: string, arrival: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2Time({
  departureDate,
  departureTime,
  estimatedArrival,
  onChangeDate,
  onChangeTime,
  onNext,
  onBack,
}: Step2TimeProps) {
  const dates = [
    { id: 'আজকে', label: 'আজকে (Today)', sub: 'আজকের নিয়মিত ট্রিপ' },
    { id: 'আগামীকাল', label: 'আগামীকাল (Tomorrow)', sub: 'পরের দিনের যাত্রা' },
    { id: 'নিয়মিত যাতায়াতকারী', label: 'সাপ্তাহিক নিয়মিত', sub: 'প্রতি সপ্তাহে যাতায়াত' },
  ];

  const timeSlots = [
    {
      slot: 'সকাল ৭:০০ - ৮:৩০',
      period: 'সকালের ট্রিপ',
      arrival: 'সকাল ১০:৩০ - ১১:৩০',
      icon: <Sun className="w-5 h-5 text-[#FF6B00]" />,
    },
    {
      slot: 'দুপুর ১২:০০ - ১:৩০',
      period: 'দুপুরের ট্রিপ',
      arrival: 'বিকেল ৩:০০ - ৪:০০',
      icon: <Sun className="w-5 h-5 text-[#E85D04]" />,
    },
    {
      slot: 'বিকেল ৪:৩০ - ৫:৩০',
      period: 'বিকেলের ট্রিপ (জনপ্রিয়)',
      arrival: 'রাত ৭:৩০ - ৮:৩০',
      icon: <Sunset className="w-5 h-5 text-[#FF6B00]" />,
      popular: true,
    },
    {
      slot: 'রাত ৮:০০ - ৯:০০',
      period: 'রাতের ট্রিপ',
      arrival: 'রাত ১১:০০ - ১২:০০',
      icon: <Moon className="w-5 h-5 text-[#171717]" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
          ধাপ ২: সময়সূচি
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] mt-1">
          আপনি কখন যাত্রা করবেন?
        </h2>
        <p className="text-sm text-[#6B6B6B] mt-1.5">
          আপনার সম্ভাব্য যাত্রার তারিখ ও সময় নির্ধারণ করুন। এর মাধ্যমে একই সময়ে ডেলিভারি চাওয়া পার্সেল সহজে খুঁজে পাওয়া যাবে।
        </p>
      </div>

      {/* Date Selector */}
      <div>
        <label className="text-xs font-bold text-[#171717] block mb-2">
          যাত্রার তারিখ নির্বাচন করুন:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {dates.map((d) => {
            const isSelected = departureDate === d.id;
            return (
              <div
                key={d.id}
                onClick={() => onChangeDate(d.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFF7F0] border-[#FF6B00] ring-2 ring-[#FF6B00]/20 shadow-xs'
                    : 'bg-white border-[#E5E7EB] hover:border-[#FFE2CD]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-[#171717]">{d.label}</span>
                  {isSelected && <span className="text-xs font-bold text-[#FF6B00]">✓</span>}
                </div>
                <span className="text-[11px] text-[#6B6B6B]">{d.sub}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Slots Cards */}
      <div>
        <label className="text-xs font-bold text-[#171717] block mb-2">
          সম্ভাব্য ছাড়ার সময় (ডিপার্চার উইন্ডো):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {timeSlots.map((slot) => {
            const isSelected = departureTime === slot.slot;

            return (
              <div
                key={slot.slot}
                onClick={() => onChangeTime(slot.slot, slot.arrival)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isSelected
                    ? 'bg-[#FFF7F0] border-[#FF6B00] ring-2 ring-[#FF6B00]/20 shadow-xs'
                    : 'bg-white border-[#E5E7EB] hover:border-[#FFE2CD]'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-white text-[#FF6B00] shadow-xs' : 'bg-[#FFF7F0]'
                  }`}
                >
                  {slot.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#171717]">{slot.slot}</span>
                    {slot.popular && (
                      <span className="text-[10px] bg-[#DCFCE7] text-[#16A34A] px-2 py-0.5 rounded font-bold">
                        সেরা ম্যাচ
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">{slot.period}</p>
                  <span className="text-[11px] text-[#FF6B00] font-medium block mt-1">
                    সম্ভাব্য পৌঁছানো: {slot.arrival}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Arrival Preview Info */}
      <div className="bg-[#FFF7F0]/60 rounded-2xl p-4 border border-[#FFE2CD] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#171717]">
          <Clock className="w-4 h-4 text-[#FF6B00]" />
          <span className="font-bold">নির্বাচিত শিডিউল:</span>
          <span className="text-[#6B6B6B]">
            {departureDate} • ছাড়বে {departureTime} (পৌঁছাবে {estimatedArrival})
          </span>
        </div>
        <Badge variant="verified" className="text-[10px] hidden sm:inline-flex">
          স্মার্ট টাইম ট্র্যাকিং
        </Badge>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="secondary" size="md" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          পূর্ববর্তী: রুট
        </Button>
        <Button variant="primary" size="lg" onClick={onNext} rightIcon={<ArrowRight className="w-5 h-5" />}>
          পরবর্তী: যানবাহন মাধ্যম
        </Button>
      </div>
    </div>
  );
}
