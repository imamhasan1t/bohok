'use client';

import React from 'react';
import { Traveller } from '@/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { toBengaliNumerals } from '@/lib/utils';
import {
  Star,
  ShieldCheck,
  Clock,
  MapPin,
  Weight,
  Bus,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TravellerCardProps {
  traveller: Traveller;
  onSelectBooking?: (traveller: Traveller) => void;
  className?: string;
  isCompact?: boolean;
}

export function TravellerCard({
  traveller,
  onSelectBooking,
  className = '',
  isCompact = false,
}: TravellerCardProps) {
  return (
    <motion.div
      key={traveller.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className={`bg-white rounded-2xl border border-[#FFE2CD] p-4 sm:p-5 shadow-[0_8px_24px_-6px_rgba(255,107,0,0.12)] ${className}`}
    >
      {/* Header: Avatar, Name, Verification, Rating */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#F0ECE7]">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FFF7F0] border-2 border-[#FF6B00] flex items-center justify-center font-bold text-base sm:text-lg text-[#E85D04] shadow-xs">
              {traveller.avatarInitials}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#16A34A] text-white p-0.5 rounded-full ring-2 ring-white">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-bold text-sm sm:text-base text-[#171717]">
                {traveller.name}
              </h4>
              <Badge variant="verified" className="text-[10px] py-0.5 px-1.5">
                ভেরিফাইড
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6B6B6B] mt-0.5">
              <span className="flex items-center gap-1 font-semibold text-[#171717]">
                <Star className="w-3.5 h-3.5 fill-[#FF6B00] text-[#FF6B00]" />
                {toBengaliNumerals(traveller.rating)}
              </span>
              <span>•</span>
              <span>{toBengaliNumerals(traveller.totalTripsCompleted)} ট্রিপ</span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] font-semibold text-[#6B6B6B] block">রওনা হওয়ার সময়</span>
          <span className="text-xs font-bold text-[#FF6B00] bg-[#FFF7F0] px-2 py-0.5 rounded-lg border border-[#FFE2CD] inline-block mt-0.5">
            {traveller.departureTime}
          </span>
        </div>
      </div>

      {/* Route & Distance Info */}
      <div className="grid grid-cols-2 gap-3 py-3 border-b border-[#F0ECE7] text-xs">
        <div className="space-y-0.5">
          <span className="text-[#6B6B6B] flex items-center gap-1 text-[11px]">
            <MapPin className="w-3 h-3 text-[#FF6B00]" />
            পিকআপ পয়েন্ট:
          </span>
          <p className="font-semibold text-[#171717] truncate">{traveller.originAreaBn}</p>
          <span className="text-[11px] text-[#FF6B00] font-medium">
            ~{toBengaliNumerals(traveller.approximateDistanceKm)} কিমি দূরে
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[#6B6B6B] flex items-center gap-1 text-[11px]">
            <Weight className="w-3 h-3 text-[#FF6B00]" />
            খালি স্পেস:
          </span>
          <p className="font-semibold text-[#171717]">
            সর্বোচ্চ {toBengaliNumerals(traveller.availableCapacityKg)} কেজি
          </p>
          <span className="text-[11px] text-[#16A34A] flex items-center gap-1 truncate font-medium">
            <Bus className="w-3 h-3 shrink-0" />
            {traveller.vehicleModeBn}
          </span>
        </div>
      </div>

      {/* Allowed Items Tags */}
      {!isCompact && (
        <div className="py-2.5">
          <span className="text-[10px] font-semibold text-[#6B6B6B] block mb-1">
            অনুমোদিত পার্সেল:
          </span>
          <div className="flex flex-wrap gap-1">
            {traveller.allowedParcelTypes.map((item, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-[#F9FAFB] text-[#374151] border border-[#E5E7EB] px-2 py-0.5 rounded-md"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Guarantee Note */}
      <div className="bg-[#FFF7F0] rounded-xl p-2 my-3 border border-[#FFE2CD] flex items-start gap-1.5">
        <Lock className="w-3.5 h-3.5 text-[#FF6B00] shrink-0 mt-0.5" />
        <p className="text-[10px] text-[#6B6B6B] leading-tight">
          <strong className="text-[#171717] font-semibold">প্রাইভেসি: </strong>
          {traveller.privacyNoteBn}
        </p>
      </div>

      {/* Action Button */}
      <Button
        variant="primary"
        size="sm"
        className="w-full justify-center text-xs py-2.5 font-bold shadow-sm"
        onClick={() => onSelectBooking && onSelectBooking(traveller)}
        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
      >
        এই সহযাত্রীর সাথে পার্সেল পাঠান
      </Button>
    </motion.div>
  );
}
