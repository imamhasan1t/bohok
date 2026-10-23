'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, KeyRound, Compass, MapPin, CheckCircle2 } from 'lucide-react';

interface ParcelJourneyFlowProps {
  currentStageIndex: number;
  progressPercent: number;
}

export function ParcelJourneyFlow({ currentStageIndex, progressPercent }: ParcelJourneyFlowProps) {
  const stages = [
    { id: 'sender', labelBn: 'প্রেরক (Sender)', icon: <User className="w-3.5 h-3.5" />, subBn: 'পার্সেল উন্মুক্ত প্রদর্শন' },
    { id: 'pickup', labelBn: 'পিকআপ (Pickup)', icon: <KeyRound className="w-3.5 h-3.5" />, subBn: '১ম ওটিপি কোড' },
    { id: 'traveller', labelBn: 'সহযাত্রী (Traveller)', icon: <Compass className="w-3.5 h-3.5" />, subBn: 'মহাসড়কে যাত্রা' },
    { id: 'destination', labelBn: 'গন্তব্য (Destination)', icon: <MapPin className="w-3.5 h-3.5" />, subBn: 'পিকপয়েন্টে আগমন' },
    { id: 'recipient', labelBn: 'প্রাপক (Recipient)', icon: <CheckCircle2 className="w-3.5 h-3.5" />, subBn: '২য় ওটিপি ডেলিভারি' },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-[#FFE2CD] shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B00] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping" />
          লাইভ পার্সেল জার্নি ফ্লো
        </span>
        <span className="text-[11px] font-semibold text-[#6B6B6B]">
          অগ্রগতি: {Math.round(progressPercent)}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="relative w-full h-1.5 bg-[#FFF7F0] rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full bg-gradient-to-r from-[#FF6B00] to-[#E85D04] rounded-full"
          style={{ width: `${progressPercent}%` }}
          transition={{ ease: 'linear' }}
        />
      </div>

      {/* 5-Step Grid */}
      <div className="grid grid-cols-5 gap-1 text-center">
        {stages.map((stage, idx) => {
          const isActive = idx === currentStageIndex;
          const isPassed = idx < currentStageIndex;

          return (
            <div key={stage.id} className="flex flex-col items-center">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#FF6B00] text-white ring-4 ring-[#FFE2CD] scale-110 shadow-sm'
                    : isPassed
                    ? 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]'
                    : 'bg-[#F9FAFB] text-[#9CA3AF] border border-[#E5E7EB]'
                }`}
              >
                {stage.icon}
              </div>
              <span
                className={`text-[10px] sm:text-[11px] font-semibold mt-1.5 truncate max-w-full ${
                  isActive ? 'text-[#FF6B00]' : isPassed ? 'text-[#171717]' : 'text-[#9CA3AF]'
                }`}
              >
                {stage.labelBn.split(' ')[0]}
              </span>
              <span className="text-[9px] text-[#6B6B6B] hidden sm:block truncate max-w-full">
                {stage.subBn}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
