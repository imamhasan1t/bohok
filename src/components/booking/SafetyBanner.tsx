// BOHOK Phase 7 — Trust & Safety Banner Component
// Reusable safety tips and security guidelines for Bangladesh crowdshipping

'use client';

import React from 'react';
import { ShieldCheck, Lock, AlertCircle, PhoneCall } from 'lucide-react';

export function SafetyBanner() {
  return (
    <div className="bg-gradient-to-br from-[#FFF7F0] to-[#FFFDFB] rounded-3xl p-6 border border-[#FFE2CD] shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-[#FF6B00]" />
        <h4 className="font-extrabold text-sm text-[#171717]">
          BOHOK নিরাপত্তা ও ট্রাস্ট প্রোটোকল
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-2xl border border-[#FFE2CD]/60 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#171717]">
            <Lock className="w-4 h-4 text-[#FF6B00]" />
            <span>দ্বৈত ওটিপি সিকিউরিটি</span>
          </div>
          <p className="text-[11px] text-[#6B6B6B]">
            ১ম ওটিপি পিকআপে এবং ২য় ওটিপি ডেলিভারিতে স্বশরীরে নিশ্চিত না করা পর্যন্ত কোনো পেমেন্ট ছাড় দেওয়া হয় না।
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-[#FFE2CD]/60 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#171717]">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            <span>১০০% এসক্রো সুরক্ষা</span>
          </div>
          <p className="text-[11px] text-[#6B6B6B]">
            ভাড়া সরাসরি সহযাত্রীর হাতে না দিয়ে BOHOK ভল্টে জমা থাকে, যা ডেলিভারি সফল না হলে প্রেরককে ফেরতযোগ্য।
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-[#FFE2CD]/60 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#171717]">
            <PhoneCall className="w-4 h-4 text-[#FF6B00]" />
            <span>২৪/৭ কাস্টমার সহায়তা</span>
          </div>
          <p className="text-[11px] text-[#6B6B6B]">
            কোনো ধরনের ব্যত্যয় বা বিলম্ব দেখা দিলে তাৎক্ষণিক বিরোধ (Dispute) ফাইল করুন অথবা হেল্পলাইনে যোগাযোগ করুন।
          </p>
        </div>
      </div>
    </div>
  );
}
