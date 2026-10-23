'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { toBengaliNumerals } from '@/lib/utils';
import {
  Wallet,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TravellerSectionProps {
  onOpenTripModal: () => void;
}

export function TravellerSection({ onOpenTripModal }: TravellerSectionProps) {
  const [tripsPerMonth, setTripsPerMonth] = useState<number>(4);
  const [parcelWeightKg, setParcelWeightKg] = useState<number>(3);

  // Approximate calculation: ~350 tk base + ~120 tk per kg
  const estimatedPerTrip = 350 + parcelWeightKg * 120;
  const estimatedMonthly = estimatedPerTrip * tripsPerMonth;

  return (
    <section id="traveller-section" className="py-20 sm:py-28 bg-white">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Story & Benefits */}
          <div className="lg:col-span-7 space-y-6">
            <Badge variant="softOrange">ভ্রমণকারীদের জন্য সুযোগ</Badge>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#171717] tracking-tight leading-[1.2]">
              যাত্রার সাথে <span className="text-[#FF6B00]">আয় করুন</span>
            </h2>

            <p className="text-base sm:text-lg text-[#6B6B6B] leading-relaxed">
              আপনি কি ঢাকা ও কুমিল্লার মধ্যে নিয়মিত যাতায়াত করেন? অফিস, বাড়ি ফেরা বা ব্যবসার কাজে আপনি যে রুটে এমনিতেই যেতেন, সেই পথেই ব্যাগের কিছুটা বাড়তি জায়গায় অন্যের একটি জরুরি বৈধ পার্সেল পৌঁছে দিয়ে আপনার যাতায়াত খরচ সম্পূর্ণ ফ্রিতে পরিণত করুন।
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-[#FFF7F0] border border-[#FFE2CD] flex items-center justify-center text-[#FF6B00] shrink-0 mt-0.5">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#171717]">
                    কোনো বাড়তি ভ্রমণ নেই
                  </h4>
                  <p className="text-xs sm:text-sm text-[#6B6B6B]">
                    আপনাকে নিজের রুট পরিবর্তন করতে হবে না। আপনার যাত্রা শুরু ও গন্তব্যের কাছাকাছি স্টপেই পার্সেল আদান-প্রদান হবে।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] border border-[#BBF7D0] flex items-center justify-center text-[#16A34A] shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#171717]">
                    পার্সেল খতিয়ে দেখার শতভাগ আইনি অধিকার
                  </h4>
                  <p className="text-xs sm:text-sm text-[#6B6B6B]">
                    কোনো না-দেখা প্যাকেট নয়। পার্সেল নেওয়ার আগে প্রেরক তা আপনার সামনে উন্মুক্ত রাখবেন এবং আপনি সন্তুষ্ট হলেই বহন করবেন।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-[#FFF7F0] border border-[#FFE2CD] flex items-center justify-center text-[#E85D04] shrink-0 mt-0.5">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#171717]">
                    ডেলিভারির পরপরই সরাসরি ওয়ালেটে পেমেন্ট
                  </h4>
                  <p className="text-xs sm:text-sm text-[#6B6B6B]">
                    গন্তব্যে পৌঁছার পর ওটিপি মেলানোর সাথে সাথেই আপনার ডিজিটাল অ্যাকাউন্টে পারিশ্রমিক জমা হয়ে যাবে।
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link href="/travel">
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-[0_8px_24px_rgba(255,107,0,0.25)] px-8"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  আপনার যাত্রা পোস্ট করুন — আয় করুন
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Earnings Estimator Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#FFF7F0] rounded-3xl p-6 sm:p-8 border border-[#FFE2CD] shadow-lg">
              <div className="flex items-center justify-between pb-4 border-b border-[#FFE2CD]">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#FF6B00]" />
                  <h4 className="font-bold text-lg text-[#171717]">
                    সম্ভাব্য আয় ক্যালকুলেটর
                  </h4>
                </div>
                <Badge variant="demo" className="text-[10px]">
                  পাইলট মডেল
                </Badge>
              </div>

              <div className="mt-6 space-y-6">
                {/* Trips Slider */}
                <div>
                  <div className="flex justify-between items-center text-sm font-semibold mb-2 text-[#171717]">
                    <span>মাসে আপনার ঢাকা ↔ কুমিল্লা ট্রিপ:</span>
                    <span className="text-[#FF6B00] font-bold text-base bg-white px-2.5 py-0.5 rounded-lg border border-[#FFE2CD]">
                      {toBengaliNumerals(tripsPerMonth)} টি ট্রিপ
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="16"
                    value={tripsPerMonth}
                    onChange={(e) => setTripsPerMonth(Number(e.target.value))}
                    className="w-full accent-[#FF6B00] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-[#6B6B6B] mt-1">
                    <span>১টি ট্রিপ</span>
                    <span>৮টি ট্রিপ</span>
                    <span>১৬টি ট্রিপ</span>
                  </div>
                </div>

                {/* Weight Slider */}
                <div>
                  <div className="flex justify-between items-center text-sm font-semibold mb-2 text-[#171717]">
                    <span>ব্যাগে আনুমানিক অতিরিক্ত স্পেস:</span>
                    <span className="text-[#FF6B00] font-bold text-base bg-white px-2.5 py-0.5 rounded-lg border border-[#FFE2CD]">
                      {toBengaliNumerals(parcelWeightKg)} কেজি
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={parcelWeightKg}
                    onChange={(e) => setParcelWeightKg(Number(e.target.value))}
                    className="w-full accent-[#FF6B00] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-[#6B6B6B] mt-1">
                    <span>১ কেজি (ডকুমেন্টস)</span>
                    <span>৩ কেজি (ছোট বক্স)</span>
                    <span>৫ কেজি (মাঝারি পার্সেল)</span>
                  </div>
                </div>

                {/* Estimated Earnings Display */}
                <div className="bg-white rounded-2xl p-5 border border-[#FFE2CD] text-center shadow-xs">
                  <span className="text-xs font-semibold text-[#6B6B6B] block">
                    মাসিক সম্ভাব্য অতিরিক্ত আয়:
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#171717] mt-1">
                    ৳ {toBengaliNumerals(estimatedMonthly.toLocaleString())}{' '}
                    <span className="text-xs font-normal text-[#6B6B6B]">/ মাস</span>
                  </div>
                  <span className="text-xs text-[#16A34A] font-semibold mt-1 block">
                    প্রতি ট্রিপে আনুমানিক ৳ {toBengaliNumerals(estimatedPerTrip)}
                  </span>
                </div>

                <div className="text-[11px] text-[#6B6B6B] text-center leading-tight">
                  * ঢাকা ↔ কুমিল্লা পাইলট রুটের আনুমানিক ভাড়ার পূর্বাভাস। পার্সেলের প্রকৃতি ও দূরত্বের উপর প্রকৃত রেট নির্ভর করে।
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
