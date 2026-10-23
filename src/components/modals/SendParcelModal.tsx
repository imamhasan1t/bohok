'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Package, MapPin, Clock, ArrowRight, ShieldCheck, Check, Sparkles } from 'lucide-react';

interface SendParcelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SendParcelModal({ isOpen, onClose }: SendParcelModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [pickupArea, setPickupArea] = useState('মিরপুর ১০');
  const [parcelType, setParcelType] = useState('জরুরি ডকুমেন্টস');
  const [weightKg, setWeightKg] = useState('১.৫');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setStep(1);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="পার্সেল পাঠান — ঢাকা ↔ কুমিল্লা"
      subtitle="পাইলট রুটে নিকটবর্তী সহযাত্রীর সাথে যুক্ত হোন"
    >
      {submitted ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mx-auto">
            <Check className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold text-[#171717]">
            আপনার পার্সেল ম্যাচিং অনুরোধ গৃহীত হয়েছে!
          </h4>
          <p className="text-sm text-[#6B6B6B] max-w-sm mx-auto">
            পাইলট প্রকল্পের আওতায় এই রুটে বর্তমানে সক্রিয় ৮ জন যাচাইকৃত সহযাত্রীর মধ্যে নিকটবর্তী ৩ জনের নিকট নোটিফিকেশন পাঠানো হয়েছে।
          </p>
          <div className="bg-[#FFF7F0] p-4 rounded-xl border border-[#FFE2CD] text-xs text-left space-y-1">
            <span className="font-semibold text-[#171717] block">ডেমো সারসংক্ষেপ:</span>
            <p>• রুট: ঢাকা ({pickupArea}) → কুমিল্লা (কান্দিরপাড়)</p>
            <p>• আইটেম: {parcelType} ({weightKg} কেজি)</p>
            <p>• আনুমানিক ভাড়া: ৳ ৪২০ - ৫২০</p>
          </div>
          <Button variant="primary" onClick={handleReset} className="w-full">
            ঠিক আছে
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="flex items-center gap-2 bg-[#FFF7F0] p-3 rounded-xl border border-[#FFE2CD] text-xs text-[#E85D04]">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#16A34A]" />
            <span>
              পাইলট নিরাপত্তা: পার্সেল হস্তান্তরকালে উন্মুক্ত রাখা ও ওটিপি ভেরিফিকেশন বাধ্যতামূলক।
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">
              ঢাকায় আপনার পিকআপ এলাকা
            </label>
            <select
              value={pickupArea}
              onChange={(e) => setPickupArea(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="মিরপুর ১০">মিরপুর ১০ / মেট্রো সংলগ্ন</option>
              <option value="ধানমন্ডি ২৭">ধানমন্ডি ২৭ / শুক্রাবাদ</option>
              <option value="মতিঝিল">মতিঝিল / দিলকুশা</option>
              <option value="সায়েদাবাদ">সায়েদাবাদ বাস টার্মিনাল</option>
              <option value="উত্তরা ৪">উত্তরা জসীমউদ্দীন অ্যাভিনিউ</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">
                পার্সেল ধরন
              </label>
              <select
                value={parcelType}
                onChange={(e) => setParcelType(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="জরুরি ডকুমেন্টস">জরুরি ডকুমেন্টস / ফাইল</option>
                <option value="প্রেসক্রিপশন ওষুধ">প্রেসক্রিপশন ওষুধ</option>
                <option value="ছোট গ্যাজেট">ছোট ইলেকট্রনিক গ্যাজেট</option>
                <option value="পোশাক/উপহার">পোশাক / ছোট উপহার</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">
                আনুমানিক ওজন
              </label>
              <select
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="০.৫">০.৫ কেজির নিচে</option>
                <option value="১.৫">১ - ২ কেজি</option>
                <option value="৩.০">২.৫ - ৪ কেজি</option>
                <option value="৫.০">সর্বোচ্চ ৫ কেজি</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">
              কুমিল্লায় ডেলিভারি পয়েন্ট
            </label>
            <input
              type="text"
              readOnly
              value="কুমিল্লা কান্দিরপাড় / পদুয়ার বাজার (পাইলট হাব)"
              className="w-full text-sm p-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-[#6B6B6B]"
            />
          </div>

          <div className="pt-2 space-y-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              সহযাত্রী খুঁজুন (ডেমো প্রিভিউ)
            </Button>

            <Link href="/send" onClick={onClose} className="block text-center">
              <span className="text-xs font-semibold text-[#FF6B00] hover:text-[#E85D04] inline-flex items-center gap-1 mt-1">
                <Sparkles className="w-3.5 h-3.5" />
                সম্পূর্ণ ৭-ধাপের সেন্ডার ফ্লোতে যান →
              </span>
            </Link>
          </div>
        </form>
      )}
    </Modal>
  );
}
