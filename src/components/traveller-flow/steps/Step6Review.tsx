'use client';

import React from 'react';
import { TravellerTripData } from '@/types/traveller';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { toBengaliNumerals } from '@/lib/utils';
import {
  Compass,
  Calendar,
  Clock,
  Bus,
  Weight,
  MapPin,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface Step6ReviewProps {
  tripData: TravellerTripData;
  onPublish: () => void;
  onBack: () => void;
}

export function Step6Review({ tripData, onPublish, onBack }: Step6ReviewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
            ধাপ ৬: ট্রিপ পর্যালোচনা
          </span>
          <Badge variant="softOrange">চূড়ান্ত প্রিভিউ</Badge>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] mt-1">
          আপনার যাত্রার সারসংক্ষেপ
        </h2>
        <p className="text-sm text-[#6B6B6B] mt-1.5">
          আপনার ট্রিপের তথ্যসমূহ যাচাই করে যাত্রা প্রকাশ করুন। প্রকাশের পরই একই রুটের অনুমোদিত পার্সেল ম্যাচ দেখতে পাবেন।
        </p>
      </div>

      {/* Main Review Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFE2CD] shadow-lg space-y-6">
        {/* Route Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-[#F0ECE7] gap-4">
          <div>
            <span className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider block">
              যাত্রাপথ করিডোর
            </span>
            <div className="flex items-center gap-2 text-2xl font-black text-[#171717] mt-1">
              <span>{tripData.originCityBn}</span>
              <span className="text-[#FF6B00]">→</span>
              <span>{tripData.destinationCityBn}</span>
            </div>
          </div>

          {/* Potential Earnings Estimate Pill */}
          <div className="bg-[#FFF7F0] p-4 rounded-2xl border border-[#FFE2CD] text-left sm:text-right">
            <span className="text-[11px] font-bold text-[#6B6B6B] block">
              সম্ভাব্য অতিরিক্ত আয় (আনুমানিক):
            </span>
            <div className="text-2xl font-black text-[#FF6B00] mt-0.5">
              ৳ {toBengaliNumerals(tripData.potentialEarningsEstimate)} - {toBengaliNumerals(tripData.potentialEarningsEstimate + 250)}
            </div>
            <span className="text-[10px] text-[#9CA3AF] block">
              * পার্সেল ওজন ও সংখ্যার উপর নির্ভরশীল ডেমো পূর্বাভাস
            </span>
          </div>
        </div>

        {/* 4 Key Details Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-[#FFF7F0]/40 p-4 rounded-2xl border border-[#FFE2CD]">
            <span className="text-[#6B6B6B] block mb-1 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#FF6B00]" />
              তারিখ:
            </span>
            <p className="font-extrabold text-[#171717] text-sm">{tripData.departureDate}</p>
          </div>

          <div className="bg-[#FFF7F0]/40 p-4 rounded-2xl border border-[#FFE2CD]">
            <span className="text-[#6B6B6B] block mb-1 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
              ছাড়ার সময়:
            </span>
            <p className="font-extrabold text-[#171717] text-sm">{tripData.departureTime}</p>
            <span className="text-[10px] text-[#6B6B6B]">পৌঁছাবে {tripData.estimatedArrival}</span>
          </div>

          <div className="bg-[#FFF7F0]/40 p-4 rounded-2xl border border-[#FFE2CD]">
            <span className="text-[#6B6B6B] block mb-1 font-semibold flex items-center gap-1">
              <Bus className="w-3.5 h-3.5 text-[#FF6B00]" />
              যানবাহন:
            </span>
            <p className="font-extrabold text-[#171717] text-sm">{tripData.travelModeLabelBn}</p>
            {tripData.vehicleNameOptional && (
              <span className="text-[10px] text-[#FF6B00] truncate block">
                {tripData.vehicleNameOptional}
              </span>
            )}
          </div>

          <div className="bg-[#FFF7F0]/40 p-4 rounded-2xl border border-[#FFE2CD]">
            <span className="text-[#6B6B6B] block mb-1 font-semibold flex items-center gap-1">
              <Weight className="w-3.5 h-3.5 text-[#FF6B00]" />
              ধারণক্ষমতা:
            </span>
            <p className="font-extrabold text-[#171717] text-sm">
              {toBengaliNumerals(tripData.capacityKg)} কেজি
            </p>
            <span className="text-[10px] text-[#16A34A]">{tripData.capacitySizeLabelBn}</span>
          </div>
        </div>

        {/* Pickup Preference Review */}
        <div className="p-4 rounded-2xl border border-[#F0ECE7] bg-[#F9FAFB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0" />
            <div>
              <span className="font-bold text-[#171717] block">পিকআপ অগ্রাধিকার:</span>
              <span className="text-[#6B6B6B]">
                {tripData.pickupPreferenceLabelBn} ({tripData.preferredPickupAreaName})
              </span>
            </div>
          </div>
          <Badge variant="verified" className="text-[10px]">
            গোপনীয়তা নিশ্চিত
          </Badge>
        </div>

        {/* Safety Principles Note */}
        <div className="bg-[#FFF7F0] rounded-2xl p-4 border border-[#FFE2CD] space-y-2 text-xs">
          <div className="flex items-center gap-2 text-[#171717] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            <span>সহযাত্রী হিসেবে আপনার অধিকার ও নিরাপত্তা নীতি</span>
          </div>
          <ul className="space-y-1.5 text-[#6B6B6B] pl-6 list-disc">
            <li>হস্তান্তরের সময় পার্সেলটি খোলা অবস্থায় দেখার আপনার শতভাগ অধিকার রয়েছে।</li>
            <li>যেকোনো সন্দেহজনক বা না-দেখা প্যাকেট প্রত্যাখ্যান করার অধিকার সংরক্ষিত।</li>
            <li>প্রাপকের হাতে হস্তান্তরের পর ২য় ওটিপি ইনপুটের সাথে সাথেই আপনার অ্যাকাউন্টে টাকা জমা হবে।</li>
          </ul>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="secondary" size="md" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          পূর্ববর্তী: পিকআপ পছন্দ
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onPublish}
          className="px-8 shadow-[0_8px_24px_rgba(255,107,0,0.28)]"
          rightIcon={<CheckCircle2 className="w-5 h-5" />}
        >
          যাত্রা প্রকাশ করুন
        </Button>
      </div>
    </div>
  );
}
