'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/useAuth';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  ShieldCheck,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Lock,
  ArrowLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { toBengaliNumerals } from '@/lib/utils';

export default function VerificationCenterPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#FFF7F0]/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6B6B6B]">
          <Link href="/profile" className="hover:text-[#FF6B00] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>প্রোফাইলে ফিরুন</span>
          </Link>
          <span>/</span>
          <span className="text-[#171717]">যাচাইকরণ কেন্দ্র</span>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF7F0] border border-[#FFE2CD] text-xs font-bold text-[#E85D04]">
            <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
            <span>BOHOK ট্রাস্ট ও নিরাপত্তা ফ্রেমওয়ার্ক</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            যাচাইকরণ কেন্দ্র (Verification Center)
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
            BOHOK-এ নিরাপদ পার্সেল আদান-প্রদানের ভিত্তি হলো স্বচ্ছ ও খাঁটি পরিচয়। আপনার প্রোফাইলের বর্তমান স্ট্যাটাস নিচে দেখুন।
          </p>
        </div>

        <AuthGuard fallbackNoticeBn="আপনার ভেরিফিকেশন স্ট্যাটাস দেখতে অনুগ্রহ করে প্রথমে লগইন করুন।">
          <div className="space-y-6">
            {/* Step 1: Mobile Phone Verification */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#FFE2CD] shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#171717]">
                        মোবাইল নম্বর যাচাই
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#16A34A]">
                        ✓ সম্পন্ন
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6B6B] mt-1">
                      আপনার নিবন্ধিত মোবাইল নম্বর: <strong className="text-[#171717] font-semibold">{user?.maskedPhone}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-xs text-[#475569] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>৬ সংখ্যার ওটিপি ভেরিফিকেশনের মাধ্যমে মোবাইল নম্বর ডেমোভাবে নিশ্চিত করা হয়েছে।</span>
              </div>
            </div>

            {/* Step 2: National Identity (NID) Verification */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#FFE2CD] shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF7F0] text-[#FF6B00] flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#171717]">
                        জাতীয় পরিচয়পত্র (এনআইডি) যাচাই
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F3F4F6] text-[#6B7280]">
                        পরবর্তী ফেজে সক্রিয়
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6B6B] mt-1">
                      সরকারি পরিচয়পত্র ও বায়োমেট্রিক অথেনটিকেশন ইন্টিগ্রেশন।
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#FFF7F0]/80 rounded-2xl border border-[#FFE2CD] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#E85D04]">
                  <AlertCircle className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span>এই সংস্করণে সরকারি পরিচয় যাচাই সক্রিয় নয়</span>
                </div>
                <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                  BOHOK কোনো ভুয়া এনআইডি যাচাইয়ের দাবি করে না। অনুমোদিত জাতীয় ডেটাবেজ বা পরিচয় (Porichoy API) ইন্টিগ্রেশনের পরেই কেবল অফিসিয়াল এনআইডি ভেরিফিকেশন ব্যাজ প্রদান করা হবে। বর্তমানে কোনো এনআইডি তথ্য বা ছবি জমা নেওয়া হচ্ছে না।
                </p>
              </div>
            </div>

            {/* Step 3: Platform Reputation & Handover History */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#FFE2CD] shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#171717]">
                      হ্যান্ডওভার ও ট্রিপ হিস্ট্রি
                    </h3>
                    <p className="text-xs text-[#6B6B6B] mt-1">
                      দ্বৈত ওটিপি কোড দিয়ে সম্পন্ন হওয়া সফল ডেলিভারি ট্র্যাক রেকর্ড।
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[11px] text-[#64748B] block">সম্পন্ন ট্রিপ</span>
                  <span className="text-base font-bold text-[#171717]">
                    {toBengaliNumerals(user?.completedTrips || 0)}টি
                  </span>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[11px] text-[#64748B] block">ডেলিভারি</span>
                  <span className="text-base font-bold text-[#171717]">
                    {toBengaliNumerals(user?.completedDeliveries || 0)}টি
                  </span>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[11px] text-[#64748B] block">বাতিল</span>
                  <span className="text-base font-bold text-[#16A34A]">০টি</span>
                </div>
              </div>
            </div>

            {/* Footer Back Action */}
            <div className="pt-2 flex justify-between items-center">
              <Link href="/profile">
                <Button variant="secondary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  প্রোফাইলে ফিরুন
                </Button>
              </Link>
              <Link href="/send">
                <Button variant="primary" size="md">
                  পার্সেল সেবা নিন
                </Button>
              </Link>
            </div>
          </div>
        </AuthGuard>
      </div>
    </div>
  );
}
