'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MatchingResult, SortCriteria } from '@/types/sender';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { toBengaliNumerals } from '@/lib/utils';
import {
  Sparkles,
  Star,
  ShieldCheck,
  Clock,
  MapPin,
  Weight,
  Bus,
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Step5MatchingProps {
  originId: string;
  destinationId: string;
  matchedTravellers: MatchingResult[];
  onSelectTraveller: (traveller: MatchingResult) => void;
  onBack: () => void;
}

export function Step5Matching({
  originId,
  destinationId,
  matchedTravellers,
  onSelectTraveller,
  onBack,
}: Step5MatchingProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<SortCriteria>('best_match');
  const [expandedScoreIds, setExpandedScoreIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Premium route matching transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const toggleBreakdown = (id: string) => {
    setExpandedScoreIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Sorted travellers list based on chosen criteria
  const sortedTravellers = useMemo(() => {
    const list = [...matchedTravellers];
    switch (sortBy) {
      case 'best_match':
        return list.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
      case 'nearest':
        return list.sort((a, b) => a.approximateDistanceKm - b.approximateDistanceKm);
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating);
      case 'earliest':
        return list.sort((a, b) => {
          // Compare departures
          const isEarlyA = a.departureTime.includes('০৬:') || a.departureTime.includes('০৭:') || a.departureTime.includes('০৮:') || a.departureTime.includes('০৯:');
          const isEarlyB = b.departureTime.includes('০৬:') || b.departureTime.includes('০৭:') || b.departureTime.includes('০৮:') || b.departureTime.includes('০৯:');
          if (isEarlyA && !isEarlyB) return -1;
          if (!isEarlyA && isEarlyB) return 1;
          return 0;
        });
      default:
        return list;
    }
  }, [matchedTravellers, sortBy]);

  // Loading animation state
  if (isLoading) {
    return (
      <div className="py-16 sm:py-24 flex flex-col items-center justify-center text-center space-y-6">
        {/* Animated glowing route pulse loader */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#FF6B00]"
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-3 rounded-full bg-[#FFF7F0] border-2 border-[#FFE2CD]"
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />
          <div className="relative w-14 h-14 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center font-black text-2xl shadow-lg">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2 max-w-sm">
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#171717]">
            আপনার রুটে সহযাত্রী খোঁজা হচ্ছে...
          </h3>
          <p className="text-xs sm:text-sm text-[#6B6B6B]">
            জাতীয় পরিচয়পত্র যাচাইকৃত সহযাত্রীদের সাথে আপনার পিকআপ লোকেশন, সময় ও ধারণক্ষমতা মেলানো হচ্ছে।
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#E85D04] font-semibold bg-[#FFF7F0] px-4 py-2 rounded-full border border-[#FFE2CD]">
          <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping" />
          <span>স্মার্ট রুট ম্যাচিং অ্যালগরিদম সক্রিয়</span>
        </div>
      </div>
    );
  }

  // Empty State: When no suitable travellers match
  if (sortedTravellers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#FFE2CD] text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF7F0] border-2 border-[#FF6B00] text-[#FF6B00] flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-[#FF6B00]" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#171717]">
              এই মুহূর্তে উপযুক্ত যাত্রী পাওয়া যায়নি
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
              আপনার নির্বাচিত রুট বা পার্সেলের ওজনের সাথে সামঞ্জস্যপূর্ণ কোনো সক্রিয় ভ্রমণকারী এই মুহূর্তে পাওয়া যায়নি। আপনি সময় বা রুট পরিবর্তন করতে পারেন, অথবা সহযাত্রীদের জন্য রিকোয়েস্ট উন্মুক্ত রাখতে পারেন।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={onBack}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              রুট বা সময় পরিবর্তন করুন
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => alert('আপনার পার্সেল রিকোয়েস্ট প্ল্যাটফর্মের ট্রাভেলার বোর্ডে উন্মুক্ত করা হয়েছে!')}
              leftIcon={<Radio className="w-4 h-4" />}
            >
              যাত্রীদের জন্য রিকোয়েস্ট উন্মুক্ত রাখুন
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-start">
          <Button variant="secondary" size="md" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            পূর্ববর্তী: পিকআপ তথ্য
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
              ধাপ ৫: সহযাত্রী ম্যাচিং
            </span>
            <Badge variant="verified" className="text-[10px]">
              স্বচ্ছ ম্যাচিং অ্যালগরিদম
            </Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] mt-1">
            {toBengaliNumerals(sortedTravellers.length)} জন উপযুক্ত যাত্রী পাওয়া গেছে
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
            রুট, সময়, দূরত্ব ও ধারণক্ষমতা বিশ্লেষণ করে সেরা সম্ভাব্য সহযাত্রী নির্বাচন করুন।
          </p>
        </div>

        {/* Sorting Pills */}
        <div className="flex items-center gap-1.5 bg-[#FFF7F0] p-1.5 rounded-2xl border border-[#FFE2CD] self-stretch sm:self-auto justify-between sm:justify-start flex-wrap">
          <button
            type="button"
            onClick={() => setSortBy('best_match')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              sortBy === 'best_match'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'text-[#6B6B6B] hover:text-[#171717]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>সেরা ম্যাচ</span>
          </button>
          <button
            type="button"
            onClick={() => setSortBy('nearest')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              sortBy === 'nearest'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'text-[#6B6B6B] hover:text-[#171717]'
            }`}
          >
            সবচেয়ে কাছের
          </button>
          <button
            type="button"
            onClick={() => setSortBy('rating')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              sortBy === 'rating'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'text-[#6B6B6B] hover:text-[#171717]'
            }`}
          >
            সবচেয়ে ভালো রেটিং
          </button>
          <button
            type="button"
            onClick={() => setSortBy('earliest')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              sortBy === 'earliest'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'text-[#6B6B6B] hover:text-[#171717]'
            }`}
          >
            আগে পৌঁছাবে
          </button>
        </div>
      </div>

      {/* Travellers Grid */}
      <div className="space-y-4">
        {sortedTravellers.map((traveller, index) => {
          const isTopMatch = traveller.isTopMatch || (index === 0 && sortBy === 'best_match');
          const isExpanded = !!expandedScoreIds[traveller.travellerId];
          const score = traveller.matchScore ?? 92;

          return (
            <motion.div
              key={traveller.travellerId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`bg-white rounded-3xl border overflow-hidden transition-all group ${
                isTopMatch
                  ? 'border-[#FF6B00] shadow-md ring-1 ring-[#FF6B00]/30'
                  : 'border-[#FFE2CD] shadow-xs hover:shadow-md hover:border-[#FF6B00]'
              }`}
            >
              {/* Top Match Highlight Banner */}
              {isTopMatch && (
                <div className="bg-gradient-to-r from-[#FFF7F0] via-[#FFEFE2] to-[#FFF7F0] border-b border-[#FFE2CD] px-5 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF6B00] fill-[#FF6B00]" />
                    <span className="text-xs font-black text-[#E85D04] tracking-wide">
                      BOHOK-এর সেরা সম্ভাব্য ম্যাচ
                    </span>
                  </div>
                  <span className="text-[11px] font-extrabold text-[#FF6B00] bg-white px-2.5 py-0.5 rounded-full border border-[#FFE2CD]">
                    স্মার্ট স্কোর: {toBengaliNumerals(score)}%
                  </span>
                </div>
              )}

              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                  {/* Left Column: Avatar & Traveller details */}
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-[#FFF7F0] border-2 border-[#FF6B00] flex items-center justify-center font-black text-xl text-[#E85D04] shadow-xs group-hover:scale-105 transition-transform">
                        {traveller.avatarInitials}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-[#16A34A] text-white p-0.5 rounded-full ring-2 ring-white">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-[#171717]">{traveller.name}</h3>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16A34A] bg-[#DCFCE7]/70 border border-[#86EFAC]/60 px-2 py-0.5 rounded-md">
                          ✓ ফোন যাচাই
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#6B7280] bg-[#F3F4F6] border border-[#E5E7EB] px-2 py-0.5 rounded-md">
                          পরিচয় যাচাই করা হয়নি
                        </span>
                        {/* Match percentage badge */}
                        <span
                          className={`text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            score >= 90
                              ? 'bg-[#FFF7F0] text-[#FF6B00] border border-[#FFE2CD]'
                              : score >= 75
                              ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]'
                              : 'bg-[#FEFCE8] text-[#CA8A04] border border-[#FEF08A]'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{toBengaliNumerals(score)}% ম্যাচ</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs text-[#6B6B6B]">
                        <span className="flex items-center gap-1 font-bold text-[#171717]">
                          <Star className="w-3.5 h-3.5 fill-[#FF6B00] text-[#FF6B00]" />
                          {toBengaliNumerals(traveller.rating)}
                        </span>
                        <span>•</span>
                        <span>{toBengaliNumerals(traveller.totalTripsCompleted)} ট্রিপ সফল</span>
                        <span>•</span>
                        <span className="text-[#16A34A] font-semibold">{traveller.vehicleModeBn}</span>
                        <span>•</span>
                        <span className="text-[#6B6B6B] font-medium">ধারণক্ষমতা: {toBengaliNumerals(traveller.availableCapacityKg)} কেজি</span>
                      </div>

                      {/* Route & Area info */}
                      <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#374151]">
                        <span className="flex items-center gap-1 text-[#FF6B00] font-semibold">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          পিকআপ: ~{toBengaliNumerals(traveller.approximateDistanceKm)} কিমি দূরে ({traveller.originAreaBn})
                        </span>
                        <span>•</span>
                        <span className="text-[#6B6B6B]">
                          গন্তব্য হাব: {traveller.destinationAreaBn}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Time, Price & Action CTA */}
                  <div className="flex sm:flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-[#F0ECE7] gap-3">
                    <div className="text-left lg:text-right">
                      <span className="text-xs text-[#6B6B6B] block">রওনা ও পৌঁছানোর সময়:</span>
                      <span className="text-sm font-bold text-[#171717] block">
                        {traveller.departureTime} → পৌঁছাবে {traveller.estimatedDeliveryTime}
                      </span>
                      <div className="mt-1 flex items-center lg:justify-end gap-1.5">
                        <span className="text-xl font-extrabold text-[#FF6B00]">
                          ৳ {toBengaliNumerals(traveller.estimatedPrice)}
                        </span>
                        <span className="text-[11px] text-[#6B6B6B]">ভাড়া</span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => onSelectTraveller(traveller)}
                      className="px-5 py-2.5 text-xs font-bold shadow-sm whitespace-nowrap"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      এই যাত্রীকে বেছে নিন
                    </Button>
                  </div>
                </div>

                {/* Explainable Reasons Pills in Bangladeshi Bengali */}
                {traveller.reasons && traveller.reasons.length > 0 && (
                  <div className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-[#F5F2ED]">
                    {traveller.reasons.map((reason, rIdx) => (
                      <span
                        key={rIdx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFF7F0] border border-[#FFE2CD] text-[11px] font-medium text-[#4B5563]"
                      >
                        <Check className="w-3 h-3 text-[#16A34A] shrink-0" />
                        <span>{reason}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Expandable Breakdown Accordion Toggle */}
                {traveller.breakdown && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => toggleBreakdown(traveller.travellerId)}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#E85D04] hover:text-[#FF6B00] transition-colors cursor-pointer select-none"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>ম্যাচ স্কোরের বিস্তারিত বিশ্লেষণ</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Breakdown Panel */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 pt-3 border-t border-[#F0ECE7]"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.entries(traveller.breakdown).map(([key, item]) => (
                              <div
                                key={key}
                                className="bg-[#FFF7F0]/70 p-3 rounded-2xl border border-[#FFE2CD] space-y-1.5"
                              >
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-[#171717]">{item.labelBn}</span>
                                  <span className="font-extrabold text-[#FF6B00]">
                                    {toBengaliNumerals(item.score)} / {toBengaliNumerals(item.maxScore)}
                                  </span>
                                </div>
                                <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-[#FF6B00] h-full rounded-full transition-all"
                                    style={{ width: `${item.percentage}%` }}
                                  />
                                </div>
                                <p className="text-[11px] text-[#6B6B6B] leading-tight">
                                  {item.descriptionBn}
                                </p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="secondary" size="md" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          পূর্ববর্তী: পিকআপ তথ্য
        </Button>
        <span className="text-xs text-[#6B6B6B] font-medium hidden sm:inline">
          * তালিকাভুক্ত সকল সহযাত্রী এনআইডি ও দ্বৈত ওটিপি প্রোটোকল মেনে চলেন।
        </span>
      </div>
    </div>
  );
}
