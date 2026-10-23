'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { Badge } from '@/components/common/Badge';
import { ShieldCheck, PhoneCall, Mail, MapPin, Heart, AlertTriangle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#FFF7F0] border-t border-[#FFE2CD] pt-16 pb-12 text-[#171717]">
      <Container>
        {/* Pilot Route Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#FFE2CD] shadow-xs mb-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="demo" pulse>
                পাইলট প্রকল্প নোটিশ
              </Badge>
              <span className="text-xs font-semibold text-[#E85D04]">
                ঢাকা ↔ কুমিল্লা করিডোর
              </span>
            </div>
            <h4 className="text-lg font-bold text-[#171717]">
              বোহক বর্তমানে শুধুমাত্র ঢাকা ও কুমিল্লা রুটে সীমিত ট্রায়াল পরিচালনা করছে
            </h4>
            <p className="text-sm text-[#6B6B6B] max-w-2xl">
              প্রথম ধাপে সর্বোচ্চ নিরাপত্তা, ওটিপি হ্যান্ডওভার এবং এনআইডি ভেরিফিকেশনের কার্যকারিতা নিশ্চিত করতে আমরা ধীরস্থিরভাবে যাত্রী ও প্রেরক সংযুক্ত করছি।
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#faq"
              className="text-xs sm:text-sm font-semibold text-[#FF6B00] hover:text-[#E85D04] underline underline-offset-4"
            >
              পাইলট বিস্তারিত জানুন →
            </a>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#F0ECE7]">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FF6B00] flex items-center justify-center text-white font-black text-lg shadow-sm">
                B
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-[#171717]">
                BOHOK <span className="text-[#FF6B00] font-normal text-lg">বহন</span>
              </span>
            </div>
            <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-sm">
              বাংলাদেশের প্রথম পিয়ার-টু-পিয়ার ক্রাউডশিপিং নেটওয়ার্ক। প্রতিদিনের নিয়মিত ভ্রমণকারী সহযাত্রীদের মাধ্যমে দ্রুততম সময়ে জরুরি পার্সেল পৌঁছানোর আধুনিক প্ল্যাটফর্ম।
            </p>
            <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>১০০% এনআইডি ও ওটিপি সংরক্ষিত ইকোসিস্টেম</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-[#171717] tracking-wider uppercase">
              নেভিগেশন
            </h5>
            <ul className="space-y-2 text-sm text-[#6B6B6B]">
              <li>
                <a href="#hero" className="hover:text-[#FF6B00] transition-colors">
                  হোম
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#FF6B00] transition-colors">
                  কীভাবে কাজ করে
                </a>
              </li>
              <li>
                <a href="#map-section" className="hover:text-[#FF6B00] transition-colors">
                  লাইভ রুট ম্যাপ
                </a>
              </li>
              <li>
                <a href="#route-explorer" className="hover:text-[#FF6B00] transition-colors">
                  রুট তালিকা
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#FF6B00] transition-colors">
                  সাধারণ জিজ্ঞাসা (FAQ)
                </a>
              </li>
            </ul>
          </div>

          {/* Safety & Guidelines */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-[#171717] tracking-wider uppercase">
              সুরক্ষা ও নীতি
            </h5>
            <ul className="space-y-2 text-sm text-[#6B6B6B]">
              <li>
                <a href="#trust-safety" className="hover:text-[#FF6B00] transition-colors">
                  এনআইডি ভেরিফিকেশন
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#FF6B00] transition-colors">
                  অনুমোদিত পণ্যের তালিকা
                </a>
              </li>
              <li>
                <a href="#trust-safety" className="hover:text-[#FF6B00] transition-colors">
                  দ্বৈত ওটিপি নিরাপত্তা
                </a>
              </li>
              <li>
                <a href="#trust-safety" className="hover:text-[#FF6B00] transition-colors">
                  এসক্রো পেমেন্ট প্রোটেকশন
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#FF6B00] transition-colors">
                  যাত্রী ও প্রেরকের অধিকার
                </a>
              </li>
            </ul>
          </div>

          {/* Emergency & Contact */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-[#171717] tracking-wider uppercase">
              পাইলট হেল্পডেস্ক
            </h5>
            <div className="space-y-2.5 text-sm text-[#6B6B6B]">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#FF6B00]" />
                <span className="font-medium text-[#171717]">০৯৬১২-বোহক (২৪/৭)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FF6B00]" />
                <span>support@bohok.com.bd</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                <span className="text-xs">
                  পাইলট হাব: ধানমন্ডি ২৭ ও সায়েদাবাদ, ঢাকা | কান্দিরপাড়, কুমিল্লা
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B6B6B]">
          <p>© ২০২৬ BOHOK Bangladesh. সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-1">
            <span>বাংলাদেশ-ফার্স্ট উদ্ভাবন ও প্রযুক্তি</span>
            <span className="inline-block text-[#FF6B00] ml-1">🇧🇩</span>
          </div>
          <p className="text-[11px] text-[#9CA3AF]">
            *বোহক কোনো কুরিয়ার লাইসেন্সড গোডাউন নয়, এটি একটি প্রযুক্তিভিত্তিক পিয়ার-টু-পিয়ার রাইডার কানেক্টিভিটি প্ল্যাটফর্ম।
          </p>
        </div>
      </Container>
    </footer>
  );
}
