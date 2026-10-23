'use client';

import React from 'react';
import Link from 'next/link';
import { BookingConfirmationData } from '@/types/sender';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { toBengaliNumerals } from '@/lib/utils';
import {
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  Share2,
  Sparkles,
  PhoneCall,
  RotateCcw,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Step7ConfirmationProps {
  confirmation: BookingConfirmationData;
  onReset: () => void;
}

export function Step7Confirmation({ confirmation, onReset }: Step7ConfirmationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      {/* Success Badge & Headline */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 rounded-3xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mx-auto shadow-sm ring-8 ring-[#DCFCE7]/40">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <Badge variant="verified" className="px-3 py-1 text-xs">
            বুকিং রিকোয়েস্ট সফল হয়েছে
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
            আপনার পার্সেল যাত্রা শুরু করার জন্য প্রস্তুত।
          </h2>
          <p className="text-sm text-[#6B6B6B] max-w-lg mx-auto">
            সহযাত্রী <strong className="text-[#171717]">{confirmation.travellerName}</strong> আপনার পিকআপ অনুরোধ গ্রহণ করেছেন। নির্দিষ্ট সময়ে পিকআপ পয়েন্টে উপস্থিত থাকার জন্য প্রস্তুত থাকুন।
          </p>
        </div>
      </div>

      {/* Booking Summary Receipt Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFE2CD] shadow-xl space-y-6">
        {/* Top Header: ID & Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-[#F0ECE7] gap-3">
          <div>
            <span className="text-xs text-[#6B6B6B] block">বুকিং আইডি ট্র্যাকিং কোড</span>
            <span className="text-xl font-mono font-black text-[#FF6B00]">
              {confirmation.bookingId}
            </span>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] text-[#6B6B6B] block">পেমেন্ট স্ট্যাটাস</span>
            <Badge variant="verified" className="text-xs">
              ডেমো এসক্রো পেমেন্ট সুরক্ষিত
            </Badge>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[#6B6B6B] block">রুট</span>
            <p className="font-bold text-[#171717] text-sm">{confirmation.routeBn}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[#6B6B6B] block">সহযাত্রী</span>
            <p className="font-bold text-[#171717] text-sm">{confirmation.travellerName}</p>
            <span className="text-[11px] text-[#16A34A] font-semibold">★ {toBengaliNumerals(confirmation.travellerRating)}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[#6B6B6B] block">পিকআপ সময়</span>
            <p className="font-bold text-[#171717] text-sm">{confirmation.pickupTimeEstimate}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[#6B6B6B] block">সম্ভাব্য ডেলিভারি</span>
            <p className="font-bold text-[#171717] text-sm">{confirmation.deliveryTimeEstimate}</p>
          </div>
        </div>

        {/* Dual OTP Codes Box (Core BOHOK Security) */}
        <div className="bg-[#FFF7F0] rounded-2xl p-5 border border-[#FFE2CD] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#FF6B00]" />
              <h4 className="font-bold text-sm text-[#171717]">
                দ্বৈত ওটিপি সিকিউরিটি পিন কোড
              </h4>
            </div>
            <span className="text-[11px] text-[#E85D04] font-semibold">
              কাউকে অগ্রিম বলবেন না
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Step 1 Pickup OTP */}
            <div className="bg-white p-3.5 rounded-xl border border-[#FFE2CD] text-center shadow-xs">
              <span className="text-[11px] font-bold text-[#FF6B00] block uppercase tracking-wider">
                ১ম ওটিপি (পিকআপ হ্যান্ডওভার পিন)
              </span>
              <span className="text-2xl font-mono font-black text-[#171717] tracking-widest my-1 block">
                {confirmation.pickupOtpCode}
              </span>
              <span className="text-[10px] text-[#6B6B6B]">
                ঢাকায় পার্সেল হস্তান্তরের সময় সহযাত্রীকে প্রদান করবেন
              </span>
            </div>

            {/* Step 2 Dropoff OTP */}
            <div className="bg-white p-3.5 rounded-xl border border-[#BBF7D0] text-center shadow-xs">
              <span className="text-[11px] font-bold text-[#166534] block uppercase tracking-wider">
                ২য় ওটিপি (প্রাপক ডেলিভারি পিন)
              </span>
              <span className="text-2xl font-mono font-black text-[#166534] tracking-widest my-1 block">
                {confirmation.dropoffOtpCode}
              </span>
              <span className="text-[10px] text-[#6B6B6B]">
                গন্তব্যে পণ্য বুঝে পাওয়ার পর প্রাপক সহযাত্রীকে প্রদান করবেন
              </span>
            </div>
          </div>
        </div>

        {/* Demo Payment Notice Banner */}
        <div className="bg-[#FEF3C7]/60 rounded-2xl p-4 border border-[#FDE68A] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#92400E]">
            <Sparkles className="w-4 h-4 shrink-0 text-[#D97706]" />
            <span>
              <strong>ডেমো পেমেন্ট তথ্য:</strong> মোট নির্ধারিত ভাড়া ৳ {toBengaliNumerals(confirmation.price)}। ফেজ ৩ পরীক্ষামূলক সংস্করণের জন্য এটি ডেমো এসক্রো হিসেবে দেখানো হয়েছে।
            </span>
          </div>
          <Badge variant="demo" className="shrink-0">
            ডেমো ডেটা
          </Badge>
        </div>
      </div>

      {/* Next Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link href={`/booking/${confirmation.bookingId}`}>
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto px-8 shadow-md"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            বুকিং ও হ্যান্ডওভার পরিচালনা করুন
          </Button>
        </Link>
        <Link href="/dashboard/sender">
          <Button variant="secondary" size="lg" className="w-full sm:w-auto px-6">
            প্রেরক ড্যাশবোর্ড
          </Button>
        </Link>
        <Button
          variant="outline"
          size="lg"
          onClick={onReset}
          className="w-full sm:w-auto px-6"
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          নতুন পার্সেল
        </Button>
      </div>
    </motion.div>
  );
}
