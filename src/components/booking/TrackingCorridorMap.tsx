// BOHOK Phase 7 — Highway Corridor Tracking Map Component
// Privacy-preserving highway milestone progress with interactive corridor simulation

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrackingProgress } from '@/lib/tracking/trackingTypes';
import { defaultDemoTrackingProvider } from '@/lib/tracking/demoTrackingProvider';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  MapPin,
  Navigation,
  Clock,
  Compass,
  Shield,
  RotateCcw,
  Sparkles,
  Truck,
  CheckCircle2,
} from 'lucide-react';

interface TrackingCorridorMapProps {
  bookingId: string;
  originBn?: string;
  destinationBn?: string;
  onMilestoneReached?: (isFinished: boolean) => void;
}

export function TrackingCorridorMap({
  bookingId,
  originBn = 'ঢাকা',
  destinationBn = 'কুমিল্লা',
  onMilestoneReached,
}: TrackingCorridorMapProps) {
  const [tracking, setTracking] = useState<TrackingProgress | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  useEffect(() => {
    let mounted = true;
    defaultDemoTrackingProvider
      .getTracking(bookingId, originBn, destinationBn)
      .then((data) => {
        if (mounted) setTracking(data);
      });
    return () => {
      mounted = false;
    };
  }, [bookingId, originBn, destinationBn]);

  const handleAdvance = async () => {
    if (!tracking) return;
    setIsAdvancing(true);
    try {
      const updated = await defaultDemoTrackingProvider.advanceTracking(bookingId);
      setTracking(updated);
      const isEnd = updated.activeCheckpointIndex === updated.checkpoints.length - 1;
      if (onMilestoneReached) {
        onMilestoneReached(isEnd);
      }
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleReset = async () => {
    if (!tracking) return;
    const reset = await defaultDemoTrackingProvider.resetTracking(bookingId);
    setTracking(reset);
  };

  if (!tracking) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-[#FFE2CD] animate-pulse text-center text-xs text-[#6B6B6B]">
        করিডোর ট্র্যাকিং ম্যাপ লোড হচ্ছে...
      </div>
    );
  }

  const isCompleted = tracking.activeCheckpointIndex === tracking.checkpoints.length - 1;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFE2CD] shadow-sm space-y-6">
      {/* Header & Meta */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#F0ECE7] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#FF6B00]" />
            <h3 className="text-xl font-extrabold text-[#171717]">
              মহাসড়ক করিডোর লাইভ অগ্রগতি
            </h3>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            {tracking.corridorNameBn}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="verified" className="text-xs px-3 py-1">
            {tracking.progressPercentage}% সম্পন্ন
          </Badge>
          <Badge variant="demo" className="text-[11px]">
            সিমুলেটেড জিপিএস
          </Badge>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FFF7F0] p-4 rounded-2xl border border-[#FFE2CD] text-xs">
        <div>
          <span className="text-[#6B6B6B] block">বর্তমান চেকপয়েন্ট</span>
          <span className="font-bold text-[#171717] block truncate">
            {tracking.activeCheckpointBn}
          </span>
        </div>

        <div>
          <span className="text-[#6B6B6B] block">বাকি দূরত্ব</span>
          <span className="font-bold text-[#FF6B00] block">
            {tracking.distanceRemainingKm} কিমি
          </span>
        </div>

        <div>
          <span className="text-[#6B6B6B] block">সম্ভাব্য সময় বাকি</span>
          <span className="font-bold text-[#171717] block">
            প্রায় {tracking.estimatedMinutesRemaining} মিনিট
          </span>
        </div>

        <div>
          <span className="text-[#6B6B6B] block">আনুমানিক আগমন (ETA)</span>
          <span className="font-bold text-[#16A34A] block">{tracking.etaBn}</span>
        </div>
      </div>

      {/* Visual Corridor Bar */}
      <div className="space-y-4 py-2">
        <div className="relative">
          {/* Track line */}
          <div className="h-3 bg-[#F0ECE7] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#FF6B00] to-[#E85D04] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${tracking.progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Vehicle Icon Marker moving along */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -ml-4 w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center shadow-md ring-4 ring-[#FFE2CD]"
            animate={{ left: `${tracking.progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Truck className="w-4 h-4 text-[#FF6B00]" />
          </motion.div>
        </div>

        {/* Milestone Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-4">
          {tracking.checkpoints.map((cp, idx) => {
            const isPassed = cp.passed;
            const isCurrent = idx === tracking.activeCheckpointIndex;

            return (
              <div
                key={cp.id}
                className={`p-3 rounded-xl border text-xs transition-all ${
                  isCurrent
                    ? 'bg-[#FFF7F0] border-[#FF6B00] shadow-xs'
                    : isPassed
                    ? 'bg-green-50/50 border-green-200'
                    : 'bg-white border-[#F0ECE7]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-bold ${
                      isCurrent
                        ? 'text-[#FF6B00]'
                        : isPassed
                        ? 'text-[#16A34A]'
                        : 'text-[#8C827A]'
                    }`}
                  >
                    মাইলস্টোন ০{idx + 1}
                  </span>
                  {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />}
                </div>
                <p className="font-bold text-[#171717] truncate">{cp.nameBn}</p>
                <p className="text-[10px] text-[#6B6B6B] truncate">{cp.milestoneDescriptionBn}</p>
                <span className="text-[10px] text-[#A39A92] block mt-1 font-mono">
                  {cp.cumulativeKm} কিমি • {cp.estimatedArrivalBn}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="bg-[#FFFDFB] border border-[#F0ECE7] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#6B6B6B]">
        <Shield className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#171717] block">
            সহযাত্রীর সুরক্ষা ও গোপনীয়তা গ্যারান্টি:
          </span>
          <p className="text-[11px] mt-0.5">{tracking.safetyNoteBn}</p>
        </div>
      </div>

      {/* Interactive Simulation Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#F0ECE7]">
        <div className="text-xs text-[#6B6B6B]">
          পরীক্ষামূলক ডেমো সিমুলেশন: আপনি বোতাম চেপে পরবর্তী মাইলস্টোনে পার্সেল ট্রানজিট পরীক্ষা করতে পারেন।
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs px-3"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            রিসেট
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleAdvance}
            disabled={isCompleted}
            isLoading={isAdvancing}
            className="text-xs px-4"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            {isCompleted ? 'গন্তব্যে পৌঁছে গেছে' : 'পরবর্তী মাইলস্টোন সিমুলেট করুন'}
          </Button>
        </div>
      </div>
    </div>
  );
}
