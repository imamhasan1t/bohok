'use client';

import React from 'react';
import { MatchingResult, SenderFormData } from '@/types/sender';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { SenderRouteMap } from '../SenderRouteMap';
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
  ArrowLeft,
  KeyRound,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Step6SelectionProps {
  formData: SenderFormData;
  traveller: MatchingResult;
  onConfirm: () => void;
  onBack: () => void;
}

export function Step6Selection({
  formData,
  traveller,
  onConfirm,
  onBack,
}: Step6SelectionProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
            ধাপ ৬: নির্বাচন ও বুকিং পর্যালোচনা
          </span>
          <Badge variant="softOrange">চূড়ান্ত যাচাই</Badge>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] mt-1">
          এই যাত্রীকে বেছে নেবেন?
        </h2>
        <p className="text-sm text-[#6B6B6B] mt-1.5">
          সহযাত্রীর বিস্তারিত বিবরণ, পিকআপ সময় এবং পার্সেল নিরাপত্তা শর্তাবলী পড়ে ম্যাচ নিশ্চিত করুন।
        </p>
      </div>

      {/* Map Focus on Traveller */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#171717] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#FF6B00]" />
            ম্যাপে নির্বাচিত সহযাত্রী ও আপনার পিকআপ করিডোর:
          </span>
          <span className="text-[#FF6B00] font-semibold">
            {traveller.name} (~{toBengaliNumerals(traveller.approximateDistanceKm)} কিমি দূরে)
          </span>
        </div>

        <SenderRouteMap
          originId={formData.originId}
          destinationId={formData.destinationId}
          pickupAreaName={formData.pickup.areaName}
          matchedTravellers={[traveller]}
          selectedTravellerId={traveller.travellerId}
          className="h-48 sm:h-56"
        />
      </div>

      {/* Confirmation Details Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#FFE2CD] shadow-lg space-y-6">
        {/* Traveller Row */}
        <div className="flex items-start justify-between pb-5 border-b border-[#F0ECE7]">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF7F0] border-2 border-[#FF6B00] flex items-center justify-center font-black text-xl text-[#E85D04]">
                {traveller.avatarInitials}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#16A34A] text-white p-0.5 rounded-full ring-2 ring-white">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#171717]">{traveller.name}</h3>
                <Badge variant="verified" className="text-[10px]">
                  এনআইডি ভেরিফাইড
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#6B6B6B] mt-0.5">
                <span className="flex items-center gap-1 font-bold text-[#171717]">
                  <Star className="w-3.5 h-3.5 fill-[#FF6B00] text-[#FF6B00]" />
                  {toBengaliNumerals(traveller.rating)}
                </span>
                <span>•</span>
                <span>{toBengaliNumerals(traveller.totalTripsCompleted)}টি ট্রিপ সম্পন্ন</span>
                <span>•</span>
                <span className="text-[#16A34A] font-semibold">{traveller.vehicleModeBn}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#6B6B6B] block">পার্সেল বহন ভাড়া</span>
            <span className="text-2xl font-black text-[#FF6B00]">
              ৳ {toBengaliNumerals(traveller.estimatedPrice)}
            </span>
          </div>
        </div>

        {/* Journey Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#FFF7F0]/50 p-4 rounded-2xl border border-[#FFE2CD]">
            <span className="text-[#6B6B6B] block mb-1 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
              রওনা হওয়ার সময়:
            </span>
            <p className="font-extrabold text-[#171717] text-sm">{traveller.departureTime}</p>
            <span className="text-[11px] text-[#6B6B6B] mt-0.5 block">
              আনুমানিক পৌঁছাবে {traveller.estimatedDeliveryTime}
            </span>
          </div>

          <div className="bg-[#FFF7F0]/50 p-4 rounded-2xl border border-[#FFE2CD]">
            <span className="text-[#6B6B6B] block mb-1 font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
              পিকআপ পয়েন্ট:
            </span>
            <p className="font-extrabold text-[#171717] text-sm">{formData.pickup.areaName}</p>
            <span className="text-[11px] text-[#FF6B00] font-medium block mt-0.5">
              ল্যান্ডমার্ক: {formData.pickup.landmark || 'অনুরোধ সাপেক্ষে'}
            </span>
          </div>

          <div className="bg-[#FFF7F0]/50 p-4 rounded-2xl border border-[#FFE2CD]">
            <span className="text-[#6B6B6B] block mb-1 font-semibold flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#FF6B00]" />
              পার্সেল বিবরণ:
            </span>
            <p className="font-extrabold text-[#171717] text-sm">
              {formData.parcel.categoryLabelBn} ({toBengaliNumerals(formData.parcel.weightKg)} কেজি)
            </p>
            <span className="text-[11px] text-[#6B6B6B] block mt-0.5 truncate">
              {formData.parcel.description || 'অনুমোদিত সাধারণ পার্সেল'}
            </span>
          </div>
        </div>

        {/* Safety & OTP Protocol Box */}
        <div className="bg-[#FFF7F0] rounded-2xl p-4 border border-[#FFE2CD] space-y-2 text-xs">
          <div className="flex items-center gap-2 text-[#171717] font-bold">
            <KeyRound className="w-4 h-4 text-[#FF6B00]" />
            <span>দ্বৈত ওটিপি ও সুরক্ষা গ্যারান্টি</span>
          </div>
          <ul className="space-y-1.5 text-[#6B6B6B] pl-6 list-disc">
            <li>পার্সেল গ্রহণের সময় ১ম ওটিপি কোড দিয়ে হ্যান্ডওভার সম্পন্ন হবে।</li>
            <li>হস্তান্তরের সময় পার্সেল উন্মুক্ত রেখে ভেতরের মালামাল দেখানো বাধ্যতামূলক।</li>
            <li>প্রাপক কর্তৃক ২য় ওটিপি ইনপুটের পূর্ব পর্যন্ত এসক্রো পেমেন্ট সুরক্ষিত থাকবে।</li>
          </ul>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="secondary" size="md" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          সহযাত্রী তালিকায় ফিরুন
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onConfirm}
          className="px-8 shadow-[0_8px_24px_rgba(255,107,0,0.28)]"
          rightIcon={<CheckCircle2 className="w-5 h-5" />}
        >
          ম্যাচ নিশ্চিত করুন
        </Button>
      </div>
    </div>
  );
}
