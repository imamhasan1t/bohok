// BOHOK Phase 7 — Parcel Journey Timeline Component
// Cinematic 7-stage lifecycle progress visualization with Framer Motion

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BookingLifecycleStatus,
} from '@/lib/booking/bookingTypes';
import { BOOKING_STATUS_META } from '@/lib/booking/bookingTransitions';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  PackageCheck,
  Truck,
  MapPin,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface ParcelJourneyTimelineProps {
  currentStatus: BookingLifecycleStatus;
  timelineEvents?: Array<{
    id: string;
    titleBn: string;
    descriptionBn: string;
    timestamp: string;
  }>;
}

interface TimelineStage {
  step: number;
  id: string;
  labelBn: string;
  icon: React.ElementType;
  matchingStatuses: BookingLifecycleStatus[];
}

const TIMELINE_STAGES: TimelineStage[] = [
  {
    step: 1,
    id: 'stage-1',
    labelBn: 'বুকিং গ্রহণ',
    icon: CheckCircle2,
    matchingStatuses: ['ACCEPTED', 'PAYMENT_PENDING'],
  },
  {
    step: 2,
    id: 'stage-2',
    labelBn: 'এসক্রো পেমেন্ট',
    icon: ShieldCheck,
    matchingStatuses: ['PAYMENT_HELD', 'READY_FOR_PICKUP'],
  },
  {
    step: 3,
    id: 'stage-3',
    labelBn: '১ম ওটিপি হস্তান্তর',
    icon: PackageCheck,
    matchingStatuses: ['TRAVELLER_ARRIVED', 'HANDOVER_PENDING', 'HANDED_OVER'],
  },
  {
    step: 4,
    id: 'stage-4',
    labelBn: 'মহাসড়কে যাত্রা',
    icon: Truck,
    matchingStatuses: ['IN_TRANSIT'],
  },
  {
    step: 5,
    id: 'stage-5',
    labelBn: 'গন্তব্যে পৌঁছানো',
    icon: MapPin,
    matchingStatuses: ['ARRIVED_DESTINATION', 'DELIVERY_PENDING'],
  },
  {
    step: 6,
    id: 'stage-6',
    labelBn: '২য় ওটিপি ডেলিভারি',
    icon: Sparkles,
    matchingStatuses: ['DELIVERED'],
  },
];

export function ParcelJourneyTimeline({
  currentStatus,
  timelineEvents = [],
}: ParcelJourneyTimelineProps) {
  const currentMeta = BOOKING_STATUS_META[currentStatus] || {
    labelBn: currentStatus,
    variant: 'default',
    stepNumber: 1,
    descriptionBn: '',
  };

  const getStageStatus = (stage: TimelineStage) => {
    const isPast = stage.step < currentMeta.stepNumber;
    const isCurrent =
      stage.step === currentMeta.stepNumber ||
      stage.matchingStatuses.includes(currentStatus);
    return { isPast, isCurrent };
  };

  const isDisputed = currentStatus === 'DISPUTED';
  const isCancelled = currentStatus === 'CANCELLED';

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFE2CD] shadow-sm space-y-6">
      {/* Header with Live Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F5EFEA]">
        <div>
          <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider block">
            লাইভ অপারেশনাল লাইফসাইকেল
          </span>
          <h3 className="text-xl font-extrabold text-[#171717]">
            পার্সেল যাত্রা টাইমলাইন
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {isCancelled ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
              <AlertCircle className="w-3.5 h-3.5" /> বুকিং বাতিল
            </span>
          ) : isDisputed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              <AlertCircle className="w-3.5 h-3.5" /> বিরোধ পর্যালোচনায়
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FFF7F0] text-[#FF6B00] border border-[#FFE2CD] shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B00] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6B00]"></span>
              </span>
              {currentMeta.labelBn}
            </span>
          )}
        </div>
      </div>

      {/* Cinematic Horizontal Progress Bar (Desktop & Tablet) */}
      <div className="relative pt-4 pb-2 hidden md:block">
        <div className="absolute top-9 left-6 right-6 h-1 bg-[#F0ECE7] rounded-full -z-0">
          <motion.div
            className="h-full bg-[#FF6B00] rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min(100, Math.max(0, ((currentMeta.stepNumber - 1) / 5) * 100))}%`,
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        </div>

        <div className="grid grid-cols-6 relative z-10 text-center">
          {TIMELINE_STAGES.map((stage) => {
            const { isPast, isCurrent } = getStageStatus(stage);
            const Icon = stage.icon;

            let iconBg = 'bg-[#F5EFEA] text-[#8C827A] border-[#E5DFDA]';
            if (isPast) {
              iconBg = 'bg-[#16A34A] text-white border-[#16A34A]';
            } else if (isCurrent) {
              iconBg = 'bg-[#FF6B00] text-white border-[#FF6B00] ring-4 ring-[#FFE2CD]';
            }

            return (
              <div key={stage.id} className="flex flex-col items-center space-y-2">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-all ${iconBg} shadow-xs`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span
                    className={`text-xs block font-bold ${
                      isCurrent
                        ? 'text-[#FF6B00]'
                        : isPast
                        ? 'text-[#16A34A]'
                        : 'text-[#8C827A]'
                    }`}
                  >
                    {stage.labelBn}
                  </span>
                  <span className="text-[10px] text-[#A39A92]">ধাপ ০{stage.step}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vertical Stepper for Mobile */}
      <div className="md:hidden space-y-4">
        {TIMELINE_STAGES.map((stage) => {
          const { isPast, isCurrent } = getStageStatus(stage);
          const Icon = stage.icon;

          return (
            <div
              key={stage.id}
              className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                isCurrent
                  ? 'bg-[#FFF7F0] border-[#FFE2CD]'
                  : isPast
                  ? 'bg-green-50/50 border-green-200'
                  : 'bg-white border-[#F0ECE7]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isCurrent
                    ? 'bg-[#FF6B00] text-white'
                    : isPast
                    ? 'bg-[#16A34A] text-white'
                    : 'bg-[#F0ECE7] text-[#8C827A]'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#171717]">
                    {stage.labelBn}
                  </span>
                  <span className="text-[10px] text-[#8C827A]">ধাপ ০{stage.step}</span>
                </div>
                {isCurrent && (
                  <p className="text-[11px] text-[#FF6B00] font-medium mt-0.5">
                    {currentMeta.descriptionBn}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Log Dropdown / Expandable */}
      {timelineEvents.length > 0 && (
        <div className="bg-[#FFFDFB] rounded-2xl p-4 border border-[#F0ECE7] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#6B6B6B]">
            <Clock className="w-4 h-4 text-[#FF6B00]" />
            <span>অপারেশনাল লগ রেকর্ডস ({timelineEvents.length})</span>
          </div>

          <div className="space-y-2 text-xs divide-y divide-[#F5EFEA]">
            {timelineEvents.slice(-3).reverse().map((ev) => (
              <div key={ev.id} className="pt-2 first:pt-0 flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-[#171717]">{ev.titleBn}</p>
                  <p className="text-[#6B6B6B] text-[11px]">{ev.descriptionBn}</p>
                </div>
                <span className="text-[10px] text-[#8C827A] whitespace-nowrap">
                  {new Date(ev.timestamp).toLocaleTimeString('bn-BD', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
