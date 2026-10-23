// BOHOK Phase 7 — Handover Verification Component
// Dual-role verification simulator: Sender displays OTP 1, Traveller verifies checklist & submits OTP 1

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HandoverSafetyChecklist, DetailedBooking } from '@/lib/booking/bookingTypes';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Package,
  Eye,
  Lock,
} from 'lucide-react';

interface HandoverVerificationProps {
  booking: DetailedBooking;
  onVerify: (otp: string, checklist: HandoverSafetyChecklist) => void;
  onAdvanceToTransit?: () => void;
}

export function HandoverVerification({
  booking,
  onVerify,
  onAdvanceToTransit,
}: HandoverVerificationProps) {
  const [activeTab, setActiveTab] = useState<'sender' | 'traveller'>('sender');
  const [copied, setCopied] = useState(false);
  const [inputOtp, setInputOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [checklist, setChecklist] = useState<HandoverSafetyChecklist>({
    packageInspected: false,
    noProhibitedItems: false,
    recipientPhoneConfirmed: false,
    weightWithinLimit: false,
  });

  const isVerified = booking.handover.otp1Verified;

  const handleCopy = () => {
    navigator.clipboard.writeText(booking.handover.otp1);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChecklistToggle = (key: keyof HandoverSafetyChecklist) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setErrorMsg('');
  };

  const handleTravellerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (
      !checklist.packageInspected ||
      !checklist.noProhibitedItems ||
      !checklist.recipientPhoneConfirmed ||
      !checklist.weightWithinLimit
    ) {
      setErrorMsg('নিরাপত্তা চেকলিস্টের সকল ৪টি শর্ত নিশ্চিত করা আবশ্যক!');
      return;
    }

    if (!inputOtp.trim() || inputOtp.trim().length < 4) {
      setErrorMsg('অনুগ্রহ করে প্রেরকের কাছ থেকে প্রাপ্ত ৪-সংখ্যার ওটিপি কোডটি দিন।');
      return;
    }

    if (inputOtp.trim() !== booking.handover.otp1.trim()) {
      setErrorMsg('ভুল ওটিপি কোড! প্রেরকের স্ক্রিনের কোডের সাথে মিলছে না।');
      return;
    }

    onVerify(inputOtp.trim(), checklist);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFE2CD] shadow-sm space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#F0ECE7] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#FF6B00]" />
            <h3 className="text-xl font-extrabold text-[#171717]">
              পার্সেল হস্তান্তর ও ১ম ওটিপি যাচাই
            </h3>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            পিকআপ পয়েন্টে প্রেরক ও সহযাত্রীর শারীরিক উপস্থিতি নিশ্চিতকরণ
          </p>
        </div>

        {/* Interactive View Switcher */}
        <div className="flex items-center p-1 bg-[#F5EFEA] rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('sender')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'sender'
                ? 'bg-white text-[#FF6B00] shadow-xs'
                : 'text-[#6B6B6B] hover:text-[#171717]'
            }`}
          >
            প্রেরকের স্ক্রিন (Sender)
          </button>
          <button
            onClick={() => setActiveTab('traveller')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'traveller'
                ? 'bg-white text-[#FF6B00] shadow-xs'
                : 'text-[#6B6B6B] hover:text-[#171717]'
            }`}
          >
            সহযাত্রীর স্ক্রিন (Traveller)
          </button>
        </div>
      </div>

      {/* Verified State Card */}
      {isVerified ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#DCFCE7]/60 border border-[#86EFAC] rounded-2xl p-6 text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-[#16A34A] text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <Badge variant="verified" className="text-xs px-3 py-1 mb-2">
              ১ম ওটিপি ভেরিফাইড ও হস্তান্তর সম্পন্ন
            </Badge>
            <h4 className="text-2xl font-black text-[#14532D]">
              পার্সেল সফলভাবে সহযাত্রীর দায়িত্বে হস্তান্তর হয়েছে!
            </h4>
            <p className="text-xs text-[#166534] max-w-md mx-auto mt-1">
              যাচাইকৃত সময়: {new Date(booking.handover.verifiedAt || '').toLocaleTimeString('bn-BD')}। সহযাত্রী এখন মহাসড়কে যাত্রা শুরু করতে পারেন।
            </p>
          </div>

          {onAdvanceToTransit && booking.status === 'HANDED_OVER' && (
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={onAdvanceToTransit}
                className="shadow-md px-8"
              >
                মহাসড়কে যাত্রা শুরু করুন (In Transit)
              </Button>
            </div>
          )}
        </motion.div>
      ) : (
        /* Unverified Flow */
        <div className="space-y-6">
          {activeTab === 'sender' ? (
            /* TAB 1: SENDER VIEW */
            <div className="bg-[#FFF7F0] rounded-2xl p-6 border border-[#FFE2CD] space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider block">
                    প্রেরকের গোপন ওটিপি
                  </span>
                  <h4 className="text-base font-extrabold text-[#171717]">
                    সহযাত্রীকে হস্তান্তরের সময় এই কোডটি দিন
                  </h4>
                </div>
                <Badge variant="verified" className="text-[11px]">
                  প্রেরকের সুরক্ষিত কোড
                </Badge>
              </div>

              {/* Big Secure Code Display */}
              <div className="bg-white rounded-2xl p-5 border border-[#FFE2CD] text-center shadow-xs space-y-2">
                <span className="text-xs text-[#6B6B6B] block">১ম ওটিপি (পিকআপ হস্তান্তর পিন)</span>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl font-mono font-black text-[#FF6B00] tracking-widest">
                    {booking.handover.otp1}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl bg-[#FFF7F0] hover:bg-[#FFE2CD] text-[#FF6B00] transition-colors"
                    title="কোড কপি করুন"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <span className="text-[11px] text-[#8C827A] block">
                  পিকআপ লোকেশনে সহযাত্রী {booking.travellerName}-এর উপস্থিতির পর কেবল মুখে বলুন
                </span>
              </div>

              {/* Warning Alert */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>নিরাপত্তা সতর্কতা:</strong> পণ্য হস্তান্তরের আগে কখনোই এই ওটিপি এসএমএস বা ফোনে শেয়ার করবেন না। সহযাত্রী আপনার পার্সেল প্যাকেট বুঝে নিলে তবেই কোডটি দিন।
                </p>
              </div>
            </div>
          ) : (
            /* TAB 2: TRAVELLER VIEW */
            <form onSubmit={handleTravellerSubmit} className="space-y-6">
              {/* Safety Checklist Box */}
              <div className="bg-white rounded-2xl p-5 border border-[#FFE2CD] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE7]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
                    <h4 className="font-extrabold text-sm text-[#171717]">
                      সহযাত্রীর হ্যান্ডওভার নিরাপত্তা চেকলিস্ট
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-[#FF6B00]">
                    ৪টি শর্তই পূরণ আবশ্যক
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-[#F0ECE7] hover:bg-[#FFFDFB] cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={checklist.packageInspected}
                      onChange={() => handleChecklistToggle('packageInspected')}
                      className="w-4 h-4 rounded text-[#FF6B00] focus:ring-[#FF6B00] mt-0.5"
                    />
                    <div>
                      <span className="font-bold text-[#171717] block">
                        ১. পার্সেলের বাহ্যিক মোড়ক ও সিল অক্ষত অবস্থায় পরিদর্শন করেছি
                      </span>
                      <span className="text-[#6B6B6B] text-[11px]">
                        প্যাকেটে কোনো ছিঁড়া বা অননুমোদিত খোলা অংশ নেই।
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-[#F0ECE7] hover:bg-[#FFFDFB] cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={checklist.noProhibitedItems}
                      onChange={() => handleChecklistToggle('noProhibitedItems')}
                      className="w-4 h-4 rounded text-[#FF6B00] focus:ring-[#FF6B00] mt-0.5"
                    />
                    <div>
                      <span className="font-bold text-[#171717] block">
                        ২. প্যাকেটে কোনো দাহ্য, বিপজ্জনক বা সরকারি নিষিদ্ধ বস্তু নেই
                      </span>
                      <span className="text-[#6B6B6B] text-[11px]">
                        প্রেরক নিশ্চিত করেছেন এটি অনুমোদিত পার্সেল।
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-[#F0ECE7] hover:bg-[#FFFDFB] cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={checklist.recipientPhoneConfirmed}
                      onChange={() => handleChecklistToggle('recipientPhoneConfirmed')}
                      className="w-4 h-4 rounded text-[#FF6B00] focus:ring-[#FF6B00] mt-0.5"
                    />
                    <div>
                      <span className="font-bold text-[#171717] block">
                        ৩. প্রাপক {booking.recipientName}-এর সাথে ফোন নম্বর নিশ্চিত করেছি
                      </span>
                      <span className="text-[#6B6B6B] text-[11px]">
                        গন্তব্যে পৌঁছানোর পর প্রাপকের সাথে যোগাযোগ সম্ভব হবে।
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-[#F0ECE7] hover:bg-[#FFFDFB] cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={checklist.weightWithinLimit}
                      onChange={() => handleChecklistToggle('weightWithinLimit')}
                      className="w-4 h-4 rounded text-[#FF6B00] focus:ring-[#FF6B00] mt-0.5"
                    />
                    <div>
                      <span className="font-bold text-[#171717] block">
                        ৪. পার্সেলের ওজন ঘোষিত সীমার ({booking.parcelWeightKg} কেজি) মধ্যে রয়েছে
                      </span>
                      <span className="text-[#6B6B6B] text-[11px]">
                        অতিরিক্ত ভার বা ভ্রমণের জন্য বিঘ্ন সৃষ্টিকারী নয়।
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* OTP Input Form Box */}
              <div className="bg-[#FFF7F0] rounded-2xl p-5 border border-[#FFE2CD] space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    প্রেরকের থেকে প্রাপ্ত ১ম ওটিপি কোডটি লিখুন
                  </label>
                  <p className="text-[11px] text-[#6B6B6B] mb-3">
                    প্রেরক আপনাকে মৌখিকভাবে ৪-সংখ্যার ওটিপি কোডটি প্রদান করবেন
                  </p>
                  <input
                    type="text"
                    maxLength={4}
                    value={inputOtp}
                    onChange={(e) => {
                      setInputOtp(e.target.value.replace(/\D/g, ''));
                      setErrorMsg('');
                    }}
                    placeholder="যেমন: 4829"
                    className="w-full text-center text-3xl font-mono font-bold tracking-widest py-3 px-4 rounded-xl border border-[#FFE2CD] bg-white text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                    {errorMsg}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full shadow-md"
                  leftIcon={<CheckCircle2 className="w-5 h-5" />}
                >
                  ১ম ওটিপি যাচাই ও পার্সেল বুঝে নিন
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
