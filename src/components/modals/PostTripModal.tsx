'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Bus, Clock, Calendar, Check, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface PostTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PostTripModal({ isOpen, onClose }: PostTripModalProps) {
  const [departureDate, setDepartureDate] = useState('আজকের ট্রিপ');
  const [departureTime, setDepartureTime] = useState('বিকেল ৫:০০ - ৬:০০');
  const [spaceKg, setSpaceKg] = useState('৩ কেজি');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="যাত্রা পোস্ট করুন — ঢাকা থেকে কুমিল্লা"
      subtitle="আপনার স্বাভাবিক যাত্রাপথেই বাড়তি আয় করুন"
    >
      {submitted ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mx-auto">
            <Check className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold text-[#171717]">
            আপনার যাত্রা সফলভাবে তালিকাভুক্ত হয়েছে!
          </h4>
          <p className="text-sm text-[#6B6B6B] max-w-sm mx-auto">
            পাইলট রুটে ঢাকা থেকে কুমিল্লার দিকে যাওয়া এই ট্রিপে আপনার সুবিধাজনক পিকআপ পয়েন্টের সাথে ম্যাচ করা পার্সেল রিকোয়েস্ট এসএমএসে পাঠানো হবে।
          </p>
          <div className="bg-[#FFF7F0] p-4 rounded-xl border border-[#FFE2CD] text-xs text-left space-y-1">
            <span className="font-semibold text-[#171717] block">ট্রিপ প্রিভিউ:</span>
            <p>• সময়: {departureDate} ({departureTime})</p>
            <p>• অতিরিক্ত স্পেস: {spaceKg}</p>
            <p>• সম্ভাব্য আয়: ৳ ৪০০ - ৮০০</p>
          </div>
          <Button variant="primary" onClick={handleReset} className="w-full">
            ধন্যবাদ
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="flex items-center gap-2 bg-[#FFF7F0] p-3 rounded-xl border border-[#FFE2CD] text-xs text-[#E85D04]">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#16A34A]" />
            <span>
              নিরাপত্তা নীতি: কোনো সন্দেহজনক বা অপছন্দের পার্সেল প্রত্যাখ্যান করার আপনার পূর্ণ অধিকার রয়েছে।
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">
                যাত্রার তারিখ
              </label>
              <select
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="আজকের ট্রিপ">আজকের ট্রিপ</option>
                <option value="আগামীকালকের ট্রিপ">আগামীকালকের ট্রিপ</option>
                <option value="সাপ্তাহিক নিয়মিত">সাপ্তাহিক নিয়মিত যাতায়াত</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">
                রওনা হওয়ার সময়
              </label>
              <select
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="সকাল ৭:০০ - ৯:০০">সকাল ৭:০০ - ৯:০০</option>
                <option value="দুপুর ১২:০০ - ২:০০">দুপুর ১২:০০ - ২:০০</option>
                <option value="বিকেল ৫:০০ - ৬:০০">বিকেল ৫:০০ - ৬:০০</option>
                <option value="রাত ৮:০০ - ১০:০০">রাত ৮:০০ - ১০:০০</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">
              ব্যাগে অতিরিক্ত খালি জায়গা (ক্যাপাসিটি)
            </label>
            <select
              value={spaceKg}
              onChange={(e) => setSpaceKg(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="১-২ কেজি (হালকা ব্যাগ)">১ - ২ কেজি (হালকা ব্যাকপ্যাক)</option>
              <option value="৩ কেজি">৩ কেজি (সাধারণ ব্যাগ)</option>
              <option value="৫ কেজি (বড় স্পেস)">৫ কেজি (বড় ব্যাগ / প্রাইভেট কার)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">
              যাতায়াত মাধ্যম (বাস / ট্রেন / নিজস্ব গাড়ি)
            </label>
            <input
              type="text"
              placeholder="যেমন: পদ্মা এক্সপ্রেস / প্রাইভেট কার"
              defaultValue="পদ্মা / এশিয়া লাইন বাস"
              className="w-full text-sm p-3 rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          <div className="pt-2 space-y-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              ট্রিপ পোস্ট নিশ্চিত করুন
            </Button>

            <Link href="/travel" onClick={onClose} className="block text-center">
              <span className="text-xs font-semibold text-[#FF6B00] hover:text-[#E85D04] inline-flex items-center gap-1 mt-1">
                <Sparkles className="w-3.5 h-3.5" />
                সম্পূর্ণ ৭-ধাপের ট্রাভেলার পোর্টালে যান →
              </span>
            </Link>
          </div>
        </form>
      )}
    </Modal>
  );
}
