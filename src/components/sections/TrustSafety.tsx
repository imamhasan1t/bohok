'use client';

import React from 'react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { TRUST_FEATURES } from '@/data/trust';
import {
  BadgeCheck,
  KeyRound,
  Star,
  ShieldAlert,
  Headphones,
  Lock,
  CheckCircle,
  FileText,
  Smartphone,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function TrustSafety() {
  const icons = {
    BadgeCheck: <BadgeCheck className="w-7 h-7 text-[#16A34A]" />,
    KeyRound: <KeyRound className="w-7 h-7 text-[#FF6B00]" />,
    Star: <Star className="w-7 h-7 text-[#E85D04]" />,
    ShieldAlert: <ShieldAlert className="w-7 h-7 text-[#16A34A]" />,
    Headphones: <Headphones className="w-7 h-7 text-[#FF6B00]" />,
  };

  return (
    <section id="trust-safety" className="py-20 sm:py-28 bg-[#FFF7F0]/30 border-y border-[#FFE2CD]/60">
      <Container>
        <SectionHeading
          badgeText="নিরাপত্তা ও বিশ্বাসযোগ্যতা"
          badgePulse
          title="আপনার পার্সেল ও ভ্রমণের"
          highlightText="নিরাপত্তা আমাদের সর্বোচ্চ অগ্রাধিকার"
          subtitle="বোহকে কোনো অচেনা বা অনিবন্ধিত ব্যক্তির জায়গা নেই। ৫-স্তরের আধুনিক নিরাপত্তা প্রোটোকলের মাধ্যমে প্রতিটি ট্রিপ শতভাগ সুরক্ষিত।"
        />

        {/* 5 Trust Features Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {TRUST_FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={idx === 0 ? 'lg:col-span-2' : ''}
            >
              <Card
                interactive
                className="h-full flex flex-col justify-between p-6 sm:p-8 bg-white border-[#FFE2CD] hover:border-[#FF6B00] group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#FFF7F0] border border-[#FFE2CD] flex items-center justify-center group-hover:scale-105 transition-transform">
                      {icons[feature.iconName as keyof typeof icons]}
                    </div>
                    <Badge variant="verified" className="text-[11px]">
                      {feature.badgeBn}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold text-[#171717] mb-1.5 group-hover:text-[#FF6B00] transition-colors">
                    {feature.titleBn}
                  </h3>
                  <p className="text-xs font-semibold text-[#FF6B00] mb-3">
                    {feature.subtitleBn}
                  </p>
                  <p className="text-sm text-[#6B6B6B] leading-relaxed">
                    {feature.descriptionBn}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-[#F0ECE7] flex items-center gap-2 text-xs font-semibold text-[#16A34A]">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{feature.securityGuaranteeBn}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Dual OTP Protocol In-depth Visual Box */}
        <div className="mt-14 bg-white rounded-3xl p-6 sm:p-10 border border-[#FFE2CD] shadow-sm">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <Badge variant="softOrange">দ্বৈত ওটিপি আর্কিটেকচার</Badge>
              <h4 className="text-2xl font-bold text-[#171717]">
                পিকআপ থেকে ডেলিভারি — পিন কোড ছাড়া কোনো পার্সেল হস্তান্তর নয়
              </h4>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">
                ১ম ওটিপি প্রেরক যাত্রীকে দেন পার্সেল হস্তান্তরের প্রমাণ হিসেবে। ২য় ওটিপি প্রাপক কুমিল্লায় পণ্য বুঝে পাওয়ার পর যাত্রীকে দেন। ওটিপি ম্যাচ না করলে সিস্টেম কোনো পেমেন্ট রিলিজ করে না।
              </p>
            </div>

            {/* OTP Flow Steps */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              {/* Step 1 Box */}
              <div className="bg-[#FFF7F0] border border-[#FFE2CD] rounded-2xl p-4 text-center w-full sm:w-48 shadow-xs">
                <span className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-wider block">
                  ধাপ ১: ঢাকায় পিকআপ
                </span>
                <div className="my-2 text-xl font-mono font-bold tracking-widest text-[#171717] bg-white py-1.5 px-3 rounded-lg border border-[#FFE2CD]">
                  ৮ ৪ ২ ৯
                </div>
                <span className="text-[11px] text-[#6B6B6B]">প্রেরক প্রদান করেন</span>
              </div>

              <div className="text-[#FF6B00] font-bold text-lg hidden sm:block">→</div>

              {/* Step 2 Box */}
              <div className="bg-[#DCFCE7]/50 border border-[#BBF7D0] rounded-2xl p-4 text-center w-full sm:w-48 shadow-xs">
                <span className="text-[10px] font-bold text-[#166534] uppercase tracking-wider block">
                  ধাপ ২: কুমিল্লায় ডেলিভারি
                </span>
                <div className="my-2 text-xl font-mono font-bold tracking-widest text-[#171717] bg-white py-1.5 px-3 rounded-lg border border-[#BBF7D0]">
                  ৩ ৯ ১ ০
                </div>
                <span className="text-[11px] text-[#166534]">প্রাপক প্রদান করেন</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
