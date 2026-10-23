'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  Clock,
  Zap,
  PackageCheck,
  ShieldCheck,
  ArrowRight,
  Check,
  X,
  FileText,
  Pill,
  Smartphone,
  Gift,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SenderSectionProps {
  onOpenSendModal: () => void;
}

export function SenderSection({ onOpenSendModal }: SenderSectionProps) {
  const comparisonItems = [
    {
      feature: 'ডেলিভারি সময়',
      traditional: '২৪ থেকে ৪৮ ঘণ্টা (হাব ও গোডাউন প্রক্রিয়া)',
      bohok: 'মাত্র ২.৫ থেকে ৩.৫ ঘণ্টা (একই দিনে সরাসরি)',
      bohokAdvantage: true,
    },
    {
      feature: 'পার্সেলের যত্ন ও হ্যান্ডলিং',
      traditional: 'শত শত বস্তার নিচে চাপা পড়ার ঝুঁকি থাকে',
      bohok: 'সহযাত্রীর ব্যাগে নিজস্ব মালামালের মতোই নিরাপদ',
      bohokAdvantage: true,
    },
    {
      feature: 'হস্তান্তর প্রক্রিয়া',
      traditional: 'অফিস কাউন্টার লাইন বা রাইডারের জন্য দীর্ঘ অপেক্ষা',
      bohok: 'কাছের বাস স্টপ, মেট্রো বা নির্ধারিত মোড়ে সরাসরি হাতবদল',
      bohokAdvantage: true,
    },
    {
      feature: 'সুরক্ষা ও নিশ্চয়তা',
      traditional: 'কাগজের চালান ও দেরিতে ক্ষতিপূরণ প্রক্রিয়া',
      bohok: 'দ্বৈত ওটিপি কোড ও ১০০% এনআইডি ভেরিফাইড প্রোফাইল',
      bohokAdvantage: true,
    },
  ];

  const commonUseCases = [
    {
      icon: <FileText className="w-5 h-5 text-[#FF6B00]" />,
      title: 'জরুরি ডকুমেন্টস ও পাসপোর্ট',
      desc: 'ভিসা ইন্টারভিউ, চাকরির পরীক্ষা বা জমির দলিলের ফাইল।',
    },
    {
      icon: <Pill className="w-5 h-5 text-[#FF6B00]" />,
      title: 'জীবনরক্ষাকারী প্রেসক্রিপশন ওষুধ',
      desc: 'ঢাকায় পাওয়া যায় কিন্তু কুমিল্লায় অমিল এমন ওষুধ।',
    },
    {
      icon: <Smartphone className="w-5 h-5 text-[#FF6B00]" />,
      title: 'ছোট গ্যাজেটস ও এক্সেসরিজ',
      desc: 'ভুলে ফেলে আসা ল্যাপটপ চার্জার, চশমা বা জরুরি ডিভাইস।',
    },
    {
      icon: <Gift className="w-5 h-5 text-[#FF6B00]" />,
      title: 'উপহার ও ব্যক্তিগত প্যাকেজ',
      desc: 'প্রিয়জনের জন্মদিন বা উৎসবের শুভেচ্ছা উপহার সামগ্রী।',
    },
  ];

  return (
    <section id="sender-section" className="py-20 sm:py-28 bg-[#FFF7F0]/40 border-t border-[#FFE2CD]/60">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="softOrange" className="mb-3">
            প্রেরকদের জন্য সুপারফাস্ট সমাধান
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#171717] tracking-tight">
            জরুরি পার্সেল <span className="text-[#FF6B00]">দ্রুত পাঠান</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#6B6B6B] leading-relaxed">
            কুরিয়ার হাবের দীর্ঘ চক্র নয় — জরুরি ডকুমেন্টস, ওষুধ বা প্রয়োজনীয় মালামাল কয়েক ঘণ্টায় ঢাকা থেকে কুমিল্লায় সরাসরি মানুষের হাতে পৌঁছে দিন।
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {commonUseCases.map((uc, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-[#FFE2CD] shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#FFF7F0] flex items-center justify-center mb-3">
                  {uc.icon}
                </div>
                <h4 className="font-bold text-base text-[#171717] mb-1">
                  {uc.title}
                </h4>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  {uc.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table Card */}
        <div className="bg-white rounded-3xl border border-[#FFE2CD] p-6 sm:p-10 shadow-sm mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#F0ECE7] gap-3">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#171717]">
                গতানুগতিক কুরিয়ার বনাম বোহক পিয়ার-টু-পিয়ার
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6B6B]">
                কেন সাধারণ মানুষের সাথে পার্সেল পাঠানো বেশি দ্রুত ও নিরাপদ?
              </p>
            </div>
            <Badge variant="softOrange">পার্থক্যটি স্পষ্ট</Badge>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="border-b border-[#F0ECE7] text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">
                  <th className="py-3 px-4">বৈশিষ্ট্য</th>
                  <th className="py-3 px-4">সাধারণ কুরিয়ার</th>
                  <th className="py-3 px-4 text-[#FF6B00]">বোহক (BOHOK)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE7] text-xs sm:text-sm">
                {comparisonItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#FFF7F0]/30 transition-colors">
                    <td className="py-4 px-4 font-semibold text-[#171717]">
                      {item.feature}
                    </td>
                    <td className="py-4 px-4 text-[#6B6B6B] flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 inline-flex items-center justify-center shrink-0">
                        <X className="w-3 h-3" />
                      </span>
                      <span>{item.traditional}</span>
                    </td>
                    <td className="py-4 px-4 font-medium text-[#171717] bg-[#FFF7F0]/60 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-green-100 text-green-600 inline-flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </span>
                        <span>{item.bohok}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sender CTA Button */}
        <div className="text-center">
          <Link href="/send">
            <Button
              size="lg"
              variant="primary"
              className="shadow-[0_8px_24px_rgba(255,107,0,0.28)] px-8"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              এখনই পার্সেল পাঠান — দেশব্যাপী নেটওয়ার্ক
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
