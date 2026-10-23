'use client';

import React from 'react';
import { SenderStep } from '@/types/sender';
import { toBengaliNumerals } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: SenderStep;
  onStepClick?: (step: SenderStep) => void;
}

export const STEP_DEFINITIONS = [
  { step: 1, labelBn: 'রুট', shortTitle: 'রুট নির্বাচন' },
  { step: 2, labelBn: 'পার্সেল', shortTitle: 'পার্সেল বিবরণ' },
  { step: 3, labelBn: 'জরুরি সময়', shortTitle: 'ডেলিভারি সময়' },
  { step: 4, labelBn: 'পিকআপ', shortTitle: 'পিকআপ তথ্য' },
  { step: 5, labelBn: 'ম্যাচিং', shortTitle: 'সহযাত্রী ম্যাচিং' },
  { step: 6, labelBn: 'বাছাই', shortTitle: 'যাত্রী নির্বাচন' },
  { step: 7, labelBn: 'নিশ্চিত', shortTitle: 'বুকিং নিশ্চিত' },
] as const;

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Desktop Step Flow */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-[#F0ECE7] -z-1" />
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-[#FF6B00] -z-1 transition-all duration-300"
          style={{
            width: `${((currentStep - 1) / (STEP_DEFINITIONS.length - 1)) * 100}%`,
          }}
        />

        {STEP_DEFINITIONS.map((def) => {
          const isCurrent = def.step === currentStep;
          const isPassed = def.step < currentStep;
          const isClickable = def.step < currentStep && onStepClick;

          return (
            <button
              key={def.step}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(def.step as SenderStep)}
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
            ধাপ {toBengaliNumerals(currentStep)} / {toBengaliNumerals(STEP_DEFINITIONS.length)}
          </span>
          <span className="font-medium text-[#171717]">
            {STEP_DEFINITIONS[currentStep - 1]?.shortTitle}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-[#FFF7F0] rounded-full overflow-hidden border border-[#FFE2CD]/50">
          <div
            className="h-full bg-gradient-to-r from-[#FF6B00] to-[#E85D04] transition-all duration-300"
            style={{ width: `${(currentStep / STEP_DEFINITIONS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
