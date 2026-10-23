'use client';

import React, { useState } from 'react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { HOW_IT_WORKS_STEPS, PERMITTED_ITEMS, PROHIBITED_ITEMS } from '@/data/steps';
import {
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Check,
  XCircle,
  FileCheck,
  Package,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function HowItWorks() {
  const [activeRole, setActiveRole] = useState<'sender' | 'traveller'>('sender');

  const icons = {
    MapPin: <MapPin className="w-6 h-6 text-[#FF6B00]" />,
    Users: <Users className="w-6 h-6 text-[#FF6B00]" />,
    ShieldCheck: <ShieldCheck className="w-6 h-6 text-[#FF6B00]" />,
    CheckCircle2: <CheckCircle2 className="w-6 h-6 text-[#FF6B00]" />,
  };

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-white">
      <Container>
        <SectionHeading
          badgeText="সহজ ৪টি ধাপ"
          title="কীভাবে কাজ করে"
          highlightText="বোহক ক্রাউডশিপিং?"
          subtitle="গতানুগতিক কুরিয়ারের দীর্ঘ অপেক্ষা বা জটিল ফরম নয় — সরাসরি একই রুটের যাচাইকৃত সহযাত্রীর মাধ্যমে সবচেয়ে দ্রুত পার্সেল পৌঁছে দিন।"
        />

        {/* Role Toggle Selector */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-[#FFF7F0] p-1.5 rounded-2xl border border-[#FFE2CD]">
            <button
              onClick={() => setActiveRole('sender')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeRole === 'sender'
                  ? 'bg-[#FF6B00] text-white shadow-sm'
                  : 'text-[#6B6B6B] hover:text-[#171717]'
              }`}
            >
              আমি পার্সেল পাঠাতে চাই (প্রেরক)
            </button>
            <button
              onClick={() => setActiveRole('traveller')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeRole === 'traveller'
                  ? 'bg-[#FF6B00] text-white shadow-sm'
                  : 'text-[#6B6B6B] hover:text-[#171717]'
              }`}
            >
              আমি ভ্রমণ করছি (সহযাত্রী)
            </button>
          </div>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative flex"
            >
              <Card
                interactive
                className="flex flex-col justify-between p-6 sm:p-7 relative w-full border-[#FFE2CD]/80 hover:border-[#FF6B00] bg-white group"
              >
                <div>
                  {/* Step Top Bar: Number & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-black text-3xl sm:text-4xl text-[#FFE2CD] group-hover:text-[#FF6B00] transition-colors">
                      {step.number}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-[#FFF7F0] border border-[#FFE2CD] flex items-center justify-center group-hover:bg-[#FF6B00]/10 transition-colors">
                      {icons[step.iconName as keyof typeof icons]}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[#171717] mb-2 leading-snug">
                    {step.titleBn}
                  </h3>
                  <p className="text-xs font-semibold text-[#FF6B00] mb-3">
                    {step.subtitleBn}
                  </p>
                  <p className="text-sm text-[#6B6B6B] leading-relaxed mb-4">
                    {step.descriptionBn}
                  </p>
                </div>

                {/* Highlight Tag */}
                <div className="pt-3 border-t border-[#F0ECE7] mt-auto">
                  <span className="text-[11px] font-medium text-[#171717] bg-[#FFF7F0] px-2.5 py-1.5 rounded-lg border border-[#FFE2CD] block leading-tight">
                    💡 {step.highlightTextBn}
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Permitted vs Prohibited Items Safety Guide */}
        <div className="mt-16 bg-[#FFF7F0]/60 rounded-3xl p-6 sm:p-10 border border-[#FFE2CD]">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <Badge variant="softOrange" className="mb-2">
              পণ্য নির্দেশিকা ও নিরাপত্তা নীতিমালা
            </Badge>
            <h4 className="text-xl sm:text-2xl font-bold text-[#171717]">
              কী পাঠানো যাবে এবং কী পাঠানো যাবে না?
            </h4>
            <p className="text-sm text-[#6B6B6B] mt-1">
              যাত্রী ও সমাজের নিরাপত্তা রক্ষায় বোহকে প্রতিটি পার্সেল উন্মুক্ত প্রদর্শন ও পরিদর্শন বাধ্যতামূলক।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Allowed Items */}
            <div className="bg-white rounded-2xl p-6 border border-[#DCFCE7] shadow-xs">
              <div className="flex items-center gap-2 mb-4 text-[#16A34A]">
                <div className="w-7 h-7 rounded-full bg-[#DCFCE7] flex items-center justify-center">
                  <Check className="w-4 h-4 text-[#16A34A]" />
                </div>
                <h5 className="font-bold text-base text-[#171717]">
                  অনুমোদিত পার্সেল (বহনযোগ্য)
                </h5>
              </div>
              <ul className="space-y-2.5">
                {PERMITTED_ITEMS.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-[#374151]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                    <span>{item.labelBn}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prohibited Items */}
            <div className="bg-white rounded-2xl p-6 border border-[#FEE2E2] shadow-xs">
              <div className="flex items-center gap-2 mb-4 text-[#DC2626]">
                <div className="w-7 h-7 rounded-full bg-[#FEE2E2] flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-[#DC2626]" />
                </div>
                <h5 className="font-bold text-base text-[#171717]">
                  সম্পূর্ণ নিষিদ্ধ পণ্য (কঠোর নিষেধ)
                </h5>
              </div>
              <ul className="space-y-2.5">
                {PROHIBITED_ITEMS.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-[#6B7280]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                    <span className="line-through decoration-[#DC2626]/40">{item.labelBn}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
