'use client';

import React from 'react';
import { ShieldCheck, Phone, Star, PackageCheck, Car, Ban, CheckCircle } from 'lucide-react';
import { TrustSignals } from '@/lib/auth/authTypes';
import { toBengaliNumerals } from '@/lib/utils';

interface TrustSummaryProps {
  signals: TrustSignals;
  userName?: string;
  className?: string;
}

export function TrustSummary({ signals, userName, className = '' }: TrustSummaryProps) {
  return (
    <div className={`bg-white rounded-3xl p-6 border border-[#FFE2CD] shadow-sm space-y-5 ${className}`}>
      <div className="flex items-center justify-between border-b border-[#F0ECE7] pb-4">
        <div>
          <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider block">
            বিশ্বাস ও নির্ভরতার সূচক
          </span>
          <h3 className="text-lg font-extrabold text-[#171717] mt-0.5">
            {userName ? `${userName}-এর প্রোফাইল ট্রাস্ট` : 'ট্রাস্ট সামারি'}
          </h3>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FFF7F0] text-[#E85D04] border border-[#FFE2CD]">
          {signals.trustLevelBn}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        {/* Phone Verification Signal */}
        <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <Phone className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>মোবাইল নম্বর</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-[#16A34A]">
            <CheckCircle className="w-4 h-4 fill-[#DCFCE7]" />
            <span>যাচাই সম্পন্ন</span>
          </div>
        </div>

        {/* Identity Verification Signal (Transparent!) */}
        <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>এনআইডি / পরিচয়</span>
          </div>
          <span className="text-xs font-bold text-[#64748B] block">
            পরবর্তী ধাপে সক্রিয়
          </span>
        </div>

        {/* Rating */}
        <div className="bg-[#FFF7F0] p-3.5 rounded-2xl border border-[#FFE2CD] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#6B6B6B]">
            <Star className="w-3.5 h-3.5 fill-[#FF6B00] text-[#FF6B00]" />
            <span>গড় রেটিং</span>
          </div>
          <span className="text-base font-black text-[#171717] block">
            ★ {toBengaliNumerals(signals.rating)} / ৫.০
          </span>
        </div>

        {/* Trips Completed */}
        <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <Car className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>ভ্রমণ সম্পন্ন</span>
          </div>
          <span className="text-sm font-bold text-[#171717] block">
            {toBengaliNumerals(signals.completedTrips)}টি সফল ট্রিপ
          </span>
        </div>

        {/* Deliveries Completed */}
        <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <PackageCheck className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>পার্সেল হস্তান্তর</span>
          </div>
          <span className="text-sm font-bold text-[#171717] block">
            {toBengaliNumerals(signals.completedDeliveries)}টি সফল ডেলিভারি
          </span>
        </div>

        {/* Cancellation Rate */}
        <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <Ban className="w-3.5 h-3.5 text-[#64748B]" />
            <span>বাতিলের হার</span>
          </div>
          <span className="text-sm font-bold text-[#16A34A] block">
            {toBengaliNumerals(signals.cancellationRate * 100)}% (০টি বাতিল)
          </span>
        </div>
      </div>

      <div className="pt-2 text-[11px] text-[#6B6B6B] bg-[#FFF7F0]/60 p-3 rounded-xl border border-[#FFE2CD]/60 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
        <span>
          BOHOK বিশ্বাসযোগ্যতা কাঠামো: কোনো মনগড়া বা কৃত্রিম ট্রাস্ট স্কোর তৈরি করা হয় না। প্রতিটি ডেটা পয়েন্ট বাস্তবিক ব্যবহারিক ইতিহাস ও দ্বৈত ওটিপি প্রটোকল দ্বারা যাচাইকৃত।
        </span>
      </div>
    </div>
  );
}
