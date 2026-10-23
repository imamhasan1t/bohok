'use client';

import React from 'react';
import { TravellerStep } from '@/types/traveller';
import { toBengaliNumerals } from '@/lib/utils';
import { Check } from 'lucide-react';

interface TravellerStepIndicatorProps {
  currentStep: TravellerStep;
  onStepClick?: (step: TravellerStep) => void;
}

export const TRAVELLER_STEPS = [
  { step: 1, labelBn: 'রুট', shortTitle: 'রুট নির্বাচন' },
  { step: 2, labelBn: 'সময়', shortTitle: 'যাত্রার সময়' },
  { step: 3, labelBn: 'বাহন', shortTitle: 'যানবাহন মাধ্যম' },
  { step: 4, labelBn: 'স্পেস', shortTitle: 'পার্সেল ধারণক্ষমতা' },
  { step: 5, labelBn: 'পিকআপ', shortTitle: 'পিকআপ পছন্দ' },
  { step: 6, labelBn: 'রিভিউ', shortTitle: 'যাত্রা পর্যালোচনা' },
  { step: 7, labelBn: 'লাইভ', shortTitle: 'যাত্রা প্রকাশ' },
] as const;

export function TravellerStepIndicator({ currentStep, onStepClick }: TravellerStepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Desktop Step Flow */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-[#F0ECE7] -z-1" />
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-[#FF6B00] -z-1 transition-all duration-300"
          style={{
            width: `${((currentStep - 1) / (TRAVELLER_STEPS.length - 1)) * 100}%`,
          }}
        />

        {TRAVELLER_STEPS.map((def) => {
          const isCurrent = def.step === currentStep;
          const isPassed = def.step < currentStep;
          const isClickable = def.step < currentStep && onStepClick;

          return (
            <button
              key={def.step}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(def.step as TravellerStep)}
              className={`flex flex-col items-center group transition-all ${
                isClickable ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isCurrent
                    ? 'bg-[#FF6B00] text-white ring-4 ring-[#FFE2CD] shadow-sm scale-110'
                    : isPassed
                    ? 'bg-[#16A34A] text-white shadow-xs'
                    : 'bg-white text-[#9CA3AF] border border-[#E5E7EB]'
                }`}
              >
                {isPassed ? <Check className="w-4 h-4" /> : toBengaliNumerals(def.step)}
              </div>
              <span
                className={`text-[11px] font-semibold mt-1.5 transition-colors ${
                  isCurrent
                    ? 'text-[#FF6B00]'
                    : isPassed
                    ? 'text-[#171717]'
                    : 'text-[#9CA3AF]'
                }`}
              >
                {def.labelBn}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Step Flow (Compact Bar & Title) */}
      <div className="md:hidden flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#FF6B00]">
            ধাপ {toBengaliNumerals(currentStep)} / {toBengaliNumerals(TRAVELLER_STEPS.length)}
          </span>
          <span className="font-medium text-[#171717]">
            {TRAVELLER_STEPS[currentStep - 1]?.shortTitle}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-[#FFF7F0] rounded-full overflow-hidden border border-[#FFE2CD]/50">
          <div
            className="h-full bg-gradient-to-r from-[#FF6B00] to-[#E85D04] transition-all duration-300"
            style={{ width: `${(currentStep / TRAVELLER_STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
