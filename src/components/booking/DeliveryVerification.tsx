// BOHOK Phase 7 — Delivery Verification & Escrow Release Component
// Dual-role verification: Recipient holds OTP 2, Traveller submits OTP 2 to trigger instant escrow release

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DetailedBooking } from '@/lib/booking/bookingTypes';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  Sparkles,
  KeyRound,
  CheckCircle2,
  DollarSign,
  Copy,
  Check,
  ShieldCheck,
  Star,
} from 'lucide-react';
import Link from 'next/link';

interface DeliveryVerificationProps {
  booking: DetailedBooking;
  onVerify: (otp: string, notes?: string) => Promise<void>;
}

export function DeliveryVerification({
  booking,
  onVerify,
}: DeliveryVerificationProps) {
  const [activeTab, setActiveTab] = useState<'recipient' | 'traveller'>('recipient');
  const [copied, setCopied] = useState(false);
  const [inputOtp, setInputOtp] = useState('');
  const [recipientNotes, setRecipientNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDelivered = booking.delivery.otp2Verified;

  const handleCopy = () => {
    navigator.clipboard.writeText(booking.delivery.otp2);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTravellerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!inputOtp.trim() || inputOtp.trim().length < 4) {
      setErrorMsg('অনুগ্রহ করে প্রাপকের কাছ থেকে প্রাপ্ত ৪-সংখ্যার ২য় ওটিপি কোডটি দিন।');
      return;
    }

    if (inputOtp.trim() !== booking.delivery.otp2.trim()) {
      setErrorMsg('ভুল ওটিপি কোড! প্রাপকের মোবাইলে পাঠানো ২য় ওটিপির সাথে মিলছে না।');
      return;
    }

    setIsSubmitting(true);
    try {
      await onVerify(inputOtp.trim(), recipientNotes);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'ডেলিভারি যাচাইকরণে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFE2CD] shadow-sm space-y-6">
      {/* Header & Role Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#F0ECE7] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF6B00]" />
            <h3 className="text-xl font-extrabold text-[#171717]">
              গন্তব্যে ডেলিভারি ও এসক্রো রিলিজ
            </h3>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            প্রাপক পণ্য বুঝে পেয়ে ২য় ওটিপি প্রদান করলেই সহযাত্রীর ভাড়া মুক্তি পাবে
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center p-1 bg-[#F5EFEA] rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('recipient')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'recipient'
                ? 'bg-white text-[#FF6B00] shadow-xs'
                : 'text-[#6B6B6B] hover:text-[#171717]'
            }`}
          >
            প্রাপকের স্ক্রিন (Recipient)
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

      {/* Delivered State View */}
      {isDelivered ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#DCFCE7]/60 border border-[#86EFAC] rounded-3xl p-6 sm:p-8 text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-[#16A34A] text-white flex items-center justify-center mx-auto shadow-md ring-8 ring-green-100">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <Badge variant="verified" className="text-xs px-3 py-1">
              ডেলিভারি সফল ও সুরক্ষিত
            </Badge>
            <h4 className="text-3xl font-black text-[#14532D]">
              পার্সেল প্রাপক সফলভাবে গ্রহণ করেছেন!
            </h4>
            <p className="text-sm text-[#166534] max-w-lg mx-auto">
              প্রাপক <strong>{booking.recipientName}</strong> পণ্য বুঝে পেয়েছেন। BOHOK ডেমো এসক্রো ভল্ট থেকে সহযাত্রী <strong>{booking.travellerName}</strong>-এর ভাড়ার টাকা সফলভাবে রিলিজ করা হয়েছে।
            </p>
          </div>

          {/* Payment Released Receipt Box */}
          <div className="bg-white rounded-2xl p-5 border border-green-200 max-w-md mx-auto text-left shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs text-[#6B6B6B]">এসক্রো পেমেন্ট স্ট্যাটাস</span>
              <Badge variant="verified" className="text-[11px]">
                টাকা ছাড় সম্পন্ন (RELEASED)
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-[#171717]">সহযাত্রীর অর্জিত ভাড়া</span>
              <span className="font-black text-xl text-[#16A34A]">
                ৳ {booking.priceBreakdown.travellerFee}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-[#6B6B6B]">
              <span>স্থানান্তর ট্রানজেকশন</span>
              <span className="font-mono">{booking.paymentTransactionId || 'TXN-DEMO-PAYOUT'}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href={`/booking/${booking.id}/rating`}>
              <Button
                variant="primary"
                size="lg"
                className="shadow-md px-8"
                leftIcon={<Star className="w-4 h-4 fill-white" />}
              >
                সহযাত্রীকে রেটিং ও মতামত দিন
              </Button>
            </Link>
            <Link href="/dashboard/sender">
              <Button variant="secondary" size="lg" className="px-6">
                ড্যাশবোর্ডে ফিরুন
              </Button>
            </Link>
          </div>
        </motion.div>
      ) : (
        /* Unverified State */
        <div className="space-y-6">
          {activeTab === 'recipient' ? (
            /* TAB 1: RECIPIENT VIEW */
            <div className="bg-[#FFF7F0] rounded-2xl p-6 border border-[#FFE2CD] space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider block">
                    প্রাপকের গোপন ডেলিভারি কোড
                  </span>
                  <h4 className="text-base font-extrabold text-[#171717]">
                    পণ্য বুঝে পাওয়ার পর সহযাত্রীকে এই কোডটি দিন
                  </h4>
                </div>
                <Badge variant="verified" className="text-[11px]">
                  প্রাপকের পিন
                </Badge>
              </div>

              {/* Secure 2nd OTP Display */}
              <div className="bg-white rounded-2xl p-5 border border-[#FFE2CD] text-center shadow-xs space-y-2">
                <span className="text-xs text-[#6B6B6B] block">২য় ওটিপি (ডেলিভারি কনফার্মেশন পিন)</span>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl font-mono font-black text-[#16A34A] tracking-widest">
                    {booking.delivery.otp2}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl bg-green-50 hover:bg-green-100 text-[#16A34A] transition-colors"
                    title="কোড কপি করুন"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-700" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <span className="text-[11px] text-[#8C827A] block">
                  সহযাত্রী {booking.travellerName} পণ্য বুঝিয়ে দিলে তবেই কোডটি শেয়ার করুন
                </span>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-green-900">
                <ShieldCheck className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <p>
                  <strong>দ্বৈত নিরাপত্তা গ্যারান্টি:</strong> আপনি এই কোড প্রদান না করা পর্যন্ত সহযাত্রী কোনোভাবেই এসক্রো ভল্ট থেকে টাকা তুলতে পারবেন না।
                </p>
              </div>
            </div>
          ) : (
            /* TAB 2: TRAVELLER VIEW */
            <form onSubmit={handleTravellerSubmit} className="space-y-6">
              <div className="bg-[#FFF7F0] rounded-2xl p-6 border border-[#FFE2CD] space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    প্রাপক {booking.recipientName}-এর থেকে প্রাপ্ত ২য় ওটিপি কোডটি লিখুন
                  </label>
                  <p className="text-[11px] text-[#6B6B6B] mb-3">
                    প্রাপক পার্সেল গ্রহণ নিশ্চিত করে আপনাকে এই ৪-সংখ্যার কোডটি জানাবেন
                  </p>
                  <input
                    type="text"
                    maxLength={4}
                    value={inputOtp}
                    onChange={(e) => {
                      setInputOtp(e.target.value.replace(/\D/g, ''));
                      setErrorMsg('');
                    }}
                    placeholder="যেমন: 7154"
                    className="w-full text-center text-3xl font-mono font-bold tracking-widest py-3 px-4 rounded-xl border border-[#FFE2CD] bg-white text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    হস্তান্তরকালীন কোনো নোট (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={recipientNotes}
                    onChange={(e) => setRecipientNotes(e.target.value)}
                    placeholder="যেমন: প্রাপক অক্ষত অবস্থায় পার্সেল বুঝে নিয়েছেন"
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-[#FFE2CD] bg-white text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
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
                  isLoading={isSubmitting}
                  className="w-full shadow-md"
                  leftIcon={<Sparkles className="w-5 h-5" />}
                >
                  ২য় ওটিপি যাচাই ও ভাড়া (৳{booking.priceBreakdown.travellerFee}) বুঝে নিন
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
