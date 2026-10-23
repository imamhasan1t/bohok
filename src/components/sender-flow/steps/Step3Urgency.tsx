'use client';

import React from 'react';
import { UrgencyOption } from '@/types/sender';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Zap, Calendar, Clock, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

interface Step3UrgencyProps {
  urgency: UrgencyOption;
  targetTimeNote: string;
  onChangeUrgency: (urgency: UrgencyOption, labelBn: string) => void;
  onChangeNote: (note: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Urgency({
  urgency,
  targetTimeNote,
  onChangeUrgency,
  onChangeNote,
  onNext,
  onBack,
}: Step3UrgencyProps) {
  const options: {
    id: UrgencyOption;
    title: string;
    sub: string;
    tag: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'today',
      title: 'আজই (একই দিনে ডেলিভারি)',
      sub: 'আজ রওনা হওয়া বিকেলের বা রাতের সহযাত্রীর সাথে কয়েক ঘণ্টায় ডেলিভারি।',
      tag: 'সবচেয়ে দ্রুত',
      icon: <Zap className="w-6 h-6 text-[#FF6B00]" />,
    },
    {
      id: 'tomorrow',
      title: 'আগামীকাল',
      sub: 'আগামীকাল সকালে রওনা হওয়া যাত্রীর সাথে সুবিধাজনক ডেলিভারি।',
      tag: 'সাশ্রয়ী ও শিথিল',
      icon: <Calendar className="w-6 h-6 text-[#FF6B00]" />,
    },
    {
      id: 'custom_time',
      title: 'নির্দিষ্ট সময় বা শিডিউল',
      sub: 'আপনার সুবিধাজনক নির্দিষ্ট সময়ে প্রাপকের কাছে পৌঁছানোর নিশ্চয়তা।',
      tag: 'কাস্টম সময়',
      icon: <Clock className="w-6 h-6 text-[#FF6B00]" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
          ধাপ ৩: জরুরি সময়
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] mt-1">
          কখন পৌঁছাতে হবে?
        </h2>
        <p className="text-sm text-[#6B6B6B] mt-1.5">
          আপনার পার্সেল পৌঁছানোর কাঙ্ক্ষিত সময়সীমা নির্বাচন করুন। আমাদের অ্যালগরিদম সেই অনুযায়ী যাত্রীদের ফিল্টার করবে।
        </p>
      </div>

      {/* Options Cards */}
      <div className="space-y-3.5">
        {options.map((opt) => {
          const isSelected = urgency === opt.id;

          return (
            <div
              key={opt.id}
              onClick={() => onChangeUrgency(opt.id, opt.title)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isSelected
                  ? 'bg-[#FFF7F0] border-[#FF6B00] ring-2 ring-[#FF6B00]/20 shadow-sm'
                  : 'bg-white border-[#E5E7EB] hover:border-[#FFE2CD]'
              }`}
            >
              <div className="flex items-start sm:items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-white text-[#FF6B00] shadow-xs' : 'bg-[#FFF7F0]'
                  }`}
                >
                  {opt.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base sm:text-lg text-[#171717]">{opt.title}</h4>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? 'bg-[#FF6B00] text-white'
                          : 'bg-[#F3F4F6] text-[#6B7280]'
                      }`}
                    >
                      {opt.tag}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#6B6B6B] mt-1">{opt.sub}</p>
                </div>
              </div>

              <div className="self-end sm:self-center">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-[#FF6B00] bg-[#FF6B00] text-white'
                      : 'border-[#D1D5DB] bg-white'
                  }`}
                >
                  {isSelected && <span className="text-xs">✓</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Time Details (if custom_time is selected) */}
      {urgency === 'custom_time' && (
        <div className="bg-[#FFF7F0]/60 rounded-3xl p-5 border border-[#FFE2CD] space-y-3">
          <label className="text-xs font-bold text-[#171717] block">
            আপনার নির্দিষ্ট সময় বা সময়সীমা উল্লেখ করুন:
          </label>
          <input
            type="text"
            placeholder="যেমন: আগামীকাল দুপুর ২টার মধ্যে পৌঁছানো আবশ্যক"
            value={targetTimeNote}
            onChange={(e) => onChangeNote(e.target.value)}
            className="w-full text-sm p-3.5 rounded-2xl border border-[#E5E7EB] bg-white text-[#171717] focus:outline-none focus:border-[#FF6B00]"
          />
        </div>
      )}

      {/* Trust Guarantee Note */}
      <div className="bg-white rounded-2xl p-4 border border-[#DCFCE7] flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-[#16A34A] shrink-0" />
        <span className="text-xs text-[#16A34A] font-semibold">
          বোহকের সকল নিয়মিত যাত্রী একই দিনে সরাসরি আন্তঃজেলা পরিবহনে ভ্রমণকারী।
        </span>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="secondary" size="md" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          পূর্ববর্তী
        </Button>
        <Button variant="primary" size="lg" onClick={onNext} rightIcon={<ArrowRight className="w-5 h-5" />}>
          পরবর্তী: পিকআপ তথ্য
        </Button>
      </div>
    </div>
  );
}
