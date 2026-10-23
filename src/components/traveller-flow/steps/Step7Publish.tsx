'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TravellerTripData, ParcelRequestItem } from '@/types/traveller';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { TravellerRouteMap } from '../TravellerRouteMap';
import { toBengaliNumerals } from '@/lib/utils';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Weight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  PackageCheck,
  Package,
  RotateCcw,
  Check,
  X,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Step7PublishProps {
  tripData: TravellerTripData;
  availableRequests: ParcelRequestItem[];
  onAcceptRequest: (request: ParcelRequestItem) => void;
  onDeclineRequest: (requestId: string) => void;
  onResetTrip: () => void;
}

export function Step7Publish({
  tripData,
  availableRequests,
  onAcceptRequest,
  onDeclineRequest,
  onResetTrip,
}: Step7PublishProps) {
  const [selectedParcelId, setSelectedParcelId] = useState<string | undefined>(
    availableRequests[0]?.id
  );
  const [acceptedNotification, setAcceptedNotification] = useState<ParcelRequestItem | null>(null);

  // Calculate dynamic dashboard metrics
  const totalCapacityKg = tripData.capacityKg;
  const acceptedWeightKg = tripData.acceptedParcels.reduce((sum, p) => sum + p.weightKg, 0);
  const remainingCapacityKg = Math.max(0, totalCapacityKg - acceptedWeightKg);
  const totalEarned = tripData.acceptedParcels.reduce((sum, p) => sum + p.estimatedEarning, 0);

  const handleAccept = (req: ParcelRequestItem) => {
    onAcceptRequest(req);
    setAcceptedNotification(req);
    // Auto-dismiss notification after 4s
    setTimeout(() => {
      setAcceptedNotification(null);
    }, 4500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Live Badge & Success Announcement */}
      <div className="bg-gradient-to-b from-[#FFF7F0] to-white rounded-3xl p-6 sm:p-8 border border-[#FFE2CD] shadow-md text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-[#DCFCE7] text-[#16A34A] px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-ping" />
          <span>আপনার যাত্রা এখন লাইভ 🟠</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-[#171717] tracking-tight">
          {tripData.originCityBn} ↔ {tripData.destinationCityBn}
        </h2>

        <p className="text-sm text-[#6B6B6B] max-w-lg mx-auto">
          আপনার ভ্রমণের তথ্য বোহক ক্রাউডশিপিং নেটওয়ার্কে সক্রিয় করা হয়েছে। নিচের অনুরোধগুলো থেকে আপনার সুবিধাজনক পার্সেল গ্রহণ করুন।
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-[#6B6B6B]">
          <span className="font-semibold text-[#171717]">
            {tripData.departureDate} • ছাড়বে {tripData.departureTime}
          </span>
          <span>•</span>
          <span>যানবাহন: {tripData.travelModeLabelBn}</span>
          <span>•</span>
          <span className="text-[#FF6B00] font-bold">পিকআপ: {tripData.preferredPickupAreaName}</span>
        </div>
      </div>

      {/* Acceptance Notification Banner */}
      <AnimatePresence>
        {acceptedNotification && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-[#DCFCE7] border border-[#BBF7D0] rounded-2xl p-4 shadow-sm flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white text-[#16A34A] flex items-center justify-center font-bold shrink-0 shadow-xs">
                <Check className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-[#166534]">
                  পার্সেল অনুরোধ গ্রহণ করা হয়েছে!
                </h4>
                <p className="text-xs text-[#166534]">
                  প্রেরক: <strong>{acceptedNotification.senderName}</strong> • {acceptedNotification.titleBn} ({toBengaliNumerals(acceptedNotification.weightKg)} কেজি)
                </p>
                <span className="text-[11px] text-[#15803D] block font-medium">
                  * প্রেরকের সাথে যোগাযোগ ও পিকআপ ওটিপি যাত্রা শুরুর ২ ঘণ্টা পূর্বে সক্রিয় হবে।
                </span>
              </div>
            </div>

            <button
              onClick={() => setAcceptedNotification(null)}
              className="text-[#166534] hover:text-[#14532D] text-xs font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Traveller Dashboard Preview (Live Trip Metrics) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#FFE2CD] shadow-lg">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE7] mb-5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#16A34A] animate-pulse" />
            <h3 className="font-extrabold text-base sm:text-lg text-[#171717]">
              আজকের সক্রিয় ট্রিপ ড্যাশবোর্ড
            </h3>
          </div>
          <Badge variant="verified">🟢 লাইভ ট্রিপ</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {/* Total Capacity */}
          <div className="bg-[#FFF7F0]/60 p-4 rounded-2xl border border-[#FFE2CD]">
            <span className="text-[11px] text-[#6B6B6B] block mb-1 font-semibold">
              মোট খালি স্পেস
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#171717]">
              {toBengaliNumerals(totalCapacityKg)} কেজি
            </span>
            <span className="text-[10px] text-[#6B6B6B] block mt-0.5">নির্ধারিত সীমা</span>
          </div>

          {/* Accepted Parcels */}
          <div className="bg-[#DCFCE7]/50 p-4 rounded-2xl border border-[#BBF7D0]">
            <span className="text-[11px] text-[#166534] block mb-1 font-semibold">
              গৃহীত পার্সেল
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#166534]">
              {toBengaliNumerals(tripData.acceptedParcels.length)} টি
            </span>
            <span className="text-[10px] text-[#166534] block mt-0.5">
              ({toBengaliNumerals(acceptedWeightKg)} কেজি গৃহীত)
            </span>
          </div>

          {/* Remaining Capacity */}
          <div className="bg-[#FFF7F0]/60 p-4 rounded-2xl border border-[#FFE2CD]">
            <span className="text-[11px] text-[#6B6B6B] block mb-1 font-semibold">
              অবশিষ্ট খালি স্পেস
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#FF6B00]">
              {toBengaliNumerals(remainingCapacityKg)} কেজি
            </span>
            <span className="text-[10px] text-[#6B6B6B] block mt-0.5">আরও নিতে পারবেন</span>
          </div>

          {/* Estimated Earnings */}
          <div className="bg-[#FFF7F0] p-4 rounded-2xl border border-[#FFE2CD]">
            <span className="text-[11px] text-[#6B6B6B] block mb-1 font-semibold">
              অর্জিত সম্ভাব্য আয়
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#E85D04]">
              ৳ {toBengaliNumerals(totalEarned)}
            </span>
            <span className="text-[10px] text-[#16A34A] block mt-0.5 font-semibold">
              {totalEarned > 0 ? 'এসক্রো জমা হবে' : 'পার্সেল গ্রহণ করুন'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Map: Route & Matching Parcel Zone */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#171717] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#FF6B00]" />
            ম্যাপে আপনার রুট ও নিকটবর্তী পার্সেল অনুরোধসমূহ:
          </span>
          <span className="text-[#FF6B00] font-semibold">
            {toBengaliNumerals(availableRequests.length)}টি পার্সেল পিকআপ পয়েন্ট প্রস্তুত
          </span>
        </div>

        <TravellerRouteMap
          originId={tripData.originId}
          destinationId={tripData.destinationId}
          preferredPickupArea={tripData.preferredPickupAreaName}
          parcelRequests={availableRequests}
          selectedParcelId={selectedParcelId}
          onSelectParcel={(id) => setSelectedParcelId(id)}
          className="h-56 sm:h-72"
        />
      </div>

      {/* Incoming Matching Parcel Requests (Two-Sided Marketplace) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#171717] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#FF6B00]" />
              <span>আপনার রুটে আসা পার্সেল অনুরোধসমূহ</span>
            </h3>
            <p className="text-xs text-[#6B6B6B]">
              আপনার ইচ্ছানুযায়ী পার্সেল গ্রহণ করুন। কোনো বাধ্যবাধকতা নেই।
            </p>
          </div>
          <Badge variant="demo">ডেমো মার্কেটপ্লেস</Badge>
        </div>

        {availableRequests.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-[#FFE2CD] text-center space-y-2">
            <PackageCheck className="w-10 h-10 text-[#16A34A] mx-auto" />
            <h4 className="font-bold text-base text-[#171717]">
              সবগুলো পার্সেল অনুরোধ পর্যালোচনা সম্পন্ন হয়েছে!
            </h4>
            <p className="text-xs text-[#6B6B6B]">
              নতুন কোনো পার্সেল অনুরোধ আসলে স্বয়ংক্রিয়ভাবে নোটিফিকেশন পাবেন।
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {availableRequests.map((req) => {
              const isAccepted = req.status === 'accepted';
              const isSelected = req.id === selectedParcelId;

              return (
                <motion.div
                  key={req.id}
                  onClick={() => setSelectedParcelId(req.id)}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all cursor-pointer ${
                    isAccepted
                      ? 'border-[#16A34A] bg-[#DCFCE7]/20 shadow-xs'
                      : isSelected
                      ? 'border-[#FF6B00] ring-2 ring-[#FF6B00]/20 shadow-md'
                      : 'border-[#FFE2CD] hover:border-[#FF6B00]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Parcel Info */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#FFF7F0] border border-[#FFE2CD] flex items-center justify-center text-xl shrink-0">
                        📦
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-base text-[#171717]">{req.titleBn}</h4>
                          <span className="text-[10px] bg-[#FFF7F0] text-[#FF6B00] px-2 py-0.5 rounded font-bold border border-[#FFE2CD]">
                            {req.urgencyLabelBn}
                          </span>
                          {isAccepted && (
                            <Badge variant="verified" className="text-[10px]">
                              গৃহীত
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-[#6B6B6B] leading-relaxed">
                          {req.itemDescriptionBn}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#374151] pt-1">
                          <span className="flex items-center gap-1 font-semibold text-[#FF6B00]">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            পিকআপ: {req.pickupAreaBn} ({req.pickupPreferenceLabelBn})
                          </span>
                          <span>•</span>
                          <span>ওজন: {toBengaliNumerals(req.weightKg)} কেজি</span>
                          <span>•</span>
                          <span className="text-[#6B6B6B]">প্রেরক: {req.senderName} (★ {toBengaliNumerals(req.senderRating)})</span>
                        </div>
                      </div>
                    </div>

                    {/* Earnings & Accept / Decline Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F0ECE7] gap-3">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-[#6B6B6B] block">আপনার পারিশ্রমিক</span>
                        <span className="text-2xl font-black text-[#FF6B00]">
                          ৳ {toBengaliNumerals(req.estimatedEarning)}
                        </span>
                      </div>

                      {isAccepted ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-3 py-1.5 rounded-xl">
                          <Check className="w-4 h-4" />
                          <span>গৃহীত হয়েছে</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeclineRequest(req.id);
                            }}
                            className="text-xs px-3 py-1.5 text-[#6B6B6B] hover:text-[#DC2626]"
                          >
                            না, ধন্যবাদ
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={remainingCapacityKg < req.weightKg}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAccept(req);
                            }}
                            className="text-xs px-4 py-2 font-bold shadow-xs whitespace-nowrap"
                            rightIcon={<Check className="w-3.5 h-3.5" />}
                          >
                            গ্রহণ করুন
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Navigation & Actions */}
      <div className="pt-4 border-t border-[#F0ECE7] flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/">
          <Button variant="secondary" size="md">
            হোমপেজে ফিরুন
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/send">
            <Button variant="outline" size="md">
              পার্সেল পাঠাতে চান?
            </Button>
          </Link>
          <Button
            variant="primary"
            size="md"
            onClick={onResetTrip}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            নতুন যাত্রা পোস্ট করুন
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
